import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ListStore } from './types/useListStore.types'

let nextId = 1

const snapshot = (s: { items: ListStore['items']; focusedIndex: number }) => ({
  items: s.items.map(item => ({ ...item })),
  focusedIndex: s.focusedIndex,
})

export const useListStore = create<ListStore>()(
  devtools(
    (set, get) => ({
      items: [],
      focusedIndex: 0,
      history: [],

      reset: () => {
        nextId = 1
        set({ items: [], focusedIndex: 0, history: [] }, false, 'reset')
      },

      saveToHistory: () =>
        set(
          (s) => ({ history: [...s.history, snapshot(s)] }),
          false,
          'saveToHistory'
        ),

      addItem: (text) =>
        set(
          (s) => ({
            history: [...s.history, snapshot(s)],
            items: [...s.items, { id: nextId++, text, selected: false }],
          }),
          false,
          'addItem'
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
          'toggleItem'
        ),

      removeSelected: () =>
        set(
          (s) => ({
            history: [...s.history, snapshot(s)],
            items: s.items.filter((item) => !item.selected),
            focusedIndex: 0,
          }),
          false,
          'removeSelected'
        ),

      removeItem: (id: number) =>
        set(
          (s) => ({
            history: [...s.history, snapshot(s)],
            items: s.items.filter((item) => item.id !== id),
            focusedIndex: 0,
          }),
          false,
          'removeItem'
        ),

      setFocusIndex: (index) =>
        set(
          (s) => {
            if (index < 0 || index >= s.items.length) return s
            return { focusedIndex: index }
          },
          false,
          'setFocusIndex'
        ),

      undo: () => {
        const { history } = get()
        if (!history.length) return false
        const prev = history.at(-1)!
        set({ ...prev, history: history.slice(0, -1) }, false, 'undo')
        return true
      },

      getSelectedItem: () => get().items.find((item) => item.selected),
    }),
    { name: 'ListStore' }
  )
)