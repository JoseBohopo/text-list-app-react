import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ListStore } from "./types/useListStore.types";

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

        saveToHistory: () =>
          set(
            (s) => ({ history: [...s.history, snapshot(s)] }),
            false,
            "saveToHistory"
          ),

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
                    createdAt: new Date(),
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
        toggleItemState: (id) =>
          set(
            (s) => ({
              history: [...s.history, snapshot(s)],
              items: s.items.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      selected: !item.selected,
                      completed: !item.completed,
                      completedAt: item.completed ? undefined : new Date(),
                    }
                  : item
              ),
            }),
            false,
            "toggleItemState"
          ),
        completedItem: (id) =>
          set(
            (s) => ({
              history: [...s.history, snapshot(s)],
              items: s.items.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      completed: !item.completed,
                      completedAt: item.completed ? undefined : new Date(),
                    }
                  : item
              ),
            }),
            false,
            "completedItem"
          ),

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

        removeItem: (id: number) =>
          set(
            (s) => {
              const newItems = s.items.filter((item) => item.id !== id);
              return {
                history: [...s.history, snapshot(s)],
                items: newItems,
                focusedIndex: calcFocusIndex(newItems, s.focusedIndex),
              };
            },
            false,
            "removeItem"
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
