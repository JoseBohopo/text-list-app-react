import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import { usePersistenceStatus } from "./usePersistenceStatus";
import { isValidPersistedState } from "./validatePersistedState";
import type { Item, ListStore } from "./types/useListStore.types";

let nextId = 1;

const snapshot = (s: { items: ListStore["items"]; focusedIndex: number }) => ({
  items: s.items.map((item) => ({ ...item })),
  focusedIndex: s.focusedIndex,
});

const HISTORY_LIMIT = 20;

let readFailed = false;

const jsonStorage = createJSONStorage<ListStore>(
  () => ({
    getItem: (name) => {
      const saved = localStorage.getItem(name);
      if (saved === null) return null;

      const parsed: unknown = JSON.parse(saved);

      if (!isValidPersistedState(parsed)) {
        throw new Error("Invalid saved task data");
      }

      return saved;
    },
    setItem: (name, value) => localStorage.setItem(name, value),
    removeItem: (name) => localStorage.removeItem(name),
  }),
  {
    reviver: (key, value) =>
      key === "history" && Array.isArray(value)
        ? value.slice(-HISTORY_LIMIT)
        : value,
  }
);

if (!jsonStorage) {
  throw new Error("Could not initialize task storage");
}

const storage: PersistStorage<ListStore> = {
  getItem: (name) => {
    try {
      return jsonStorage.getItem(name);
    } catch (error) {
      readFailed = true;
      usePersistenceStatus.getState().setStatus("read-error");
      throw error;
    }
  },
  setItem: (name, value) => {
    if (readFailed) return;

    try {
      jsonStorage.setItem(name, value);
      usePersistenceStatus.getState().setStatus("ok");
    } catch {
      usePersistenceStatus.getState().setStatus("write-error");
    }
  },
  removeItem: (name) => jsonStorage.removeItem(name),
};

const pushHistory = (
  s: Pick<ListStore, "items" | "focusedIndex" | "history">
) => [...s.history.slice(-(HISTORY_LIMIT - 1)), snapshot(s)];

const calcFocusIndex = (newItems: ListStore["items"], currentIndex: number) => {
  if (newItems.length === 0) return -1;
  if (currentIndex >= newItems.length) return newItems.length - 1;
  return currentIndex;
};

function toggleCompletion(item: Item): Item {
  return {
    ...item,
    completed: !item.completed,
    completedAt: item.completed ? undefined : new Date().toISOString(),
  };
}

export const useListStore = create<ListStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        focusedIndex: 0,
        history: [],
        filters: {
          search: "",
          showCompleted: true,
        },

        reset: () => {
          nextId = 1;
          set(
            {
              items: [],
              focusedIndex: 0,
              history: [],
              filters: { search: "", showCompleted: true },
            },
            false,
            "reset"
          );
        },
        addItem: (
          text,
          priority = "medium",
          category = "personal",
          dueDate?: string
        ) =>
          set(
            (s) => {
              const highestId = s.items.reduce(
                (max, item) => Math.max(max, item.id),
                0
              );
              nextId = Math.max(nextId, highestId + 1);

              return {
                history: pushHistory(s),
                items: [
                  ...s.items,
                  {
                    id: nextId++,
                    text,
                    selected: false,
                    priority,
                    category,
                    dueDate,
                    completed: false,
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
            },
            false,
            "addItem"
          ),

        toggleItem: (id) =>
          set(
            (s) => ({
              history: pushHistory(s),
              items: s.items.map((item) =>
                item.id === id ? { ...item, selected: !item.selected } : item
              ),
            }),
            false,
            "toggleItem"
          ),
        setItemsSelected: (ids, selected) => {
          const idSet = new Set(ids);

          set(
            (s) => {
              const hasChanges = s.items.some(
                (item) => idSet.has(item.id) && item.selected !== selected
              );

              if (!hasChanges) return s;

              return {
                history: pushHistory(s),
                items: s.items.map((item) =>
                  idSet.has(item.id) ? { ...item, selected } : item
                ),
              };
            },
            false,
            "setItemsSelected"
          );
        },
        completedItem: (id) =>
          set(
            (s) => ({
              history: pushHistory(s),
              items: s.items.map((item) =>
                item.id === id ? toggleCompletion(item) : item
              ),
            }),
            false,
            "completedItem"
          ),
        completeAfterSelectionClick: (id, firstSnapshot) => {
          let applied = false;

          set(
            (s) => {
              const previous = firstSnapshot.items.find(
                (item) => item.id === id
              );
              const current = s.items.find((item) => item.id === id);

              if (
                s.history.at(-1) !== firstSnapshot ||
                !previous ||
                !current ||
                current.selected === previous.selected
              ) {
                return s;
              }

              applied = true;

              return {
                items: s.items.map((item) =>
                  item.id === id
                    ? { ...toggleCompletion(item), selected: previous.selected }
                    : item
                ),
              };
            },
            false,
            "completeAfterSelectionClick"
          );

          return applied;
        },

        updateItem: (id, updates) =>
          set(
            (s) => ({
              history: pushHistory(s),
              items: s.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item
              ),
            }),
            false,
            "updateItem"
          ),

        setFilters: (newFilters) =>
          set(
            (s) => ({
              filters: { ...s.filters, ...newFilters },
            }),
            false,
            "setFilters"
          ),

        removeSelected: () =>
          set(
            (s) => {
              const newItems = s.items.filter((item) => !item.selected);
              return {
                history: pushHistory(s),
                items: newItems,
                focusedIndex: calcFocusIndex(newItems, s.focusedIndex),
              };
            },
            false,
            "removeSelected"
          ),

        setFocusIndex: (index) =>
          set(
            (s) => {
              if (index < 0 || index >= s.items.length) return s;
              return { focusedIndex: index };
            },
            false,
            "setFocusIndex"
          ),

        undo: () => {
          const { history } = get();
          if (!history.length) return false;
          const prev = history.at(-1)!;
          set({ ...prev, history: history.slice(0, -1) }, false, "undo");
          return true;
        },

        getSelectedItem: () => get().items.find((item) => item.selected),
      }),
      {
        name: "listStore",
        storage,
      }
    ),
    { name: "ListStore" }
  )
);
