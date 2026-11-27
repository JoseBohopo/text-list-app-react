import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Item, ListStore } from "./types/useListStore.types";

let nextId = 1;

const snapshot = (s: { items: ListStore["items"]; focusedIndex: number }) => ({
  items: s.items.map((item) => ({ ...item })),
  focusedIndex: s.focusedIndex,
});

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
                history: [...s.history, snapshot(s)],
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
              history: [...s.history, snapshot(s)],
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
                history: [...s.history, snapshot(s)],
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
              history: [...s.history, snapshot(s)],
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
              history: [...s.history, snapshot(s)],
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
                history: [...s.history, snapshot(s)],
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
      }
    ),
    { name: "ListStore" }
  )
);
