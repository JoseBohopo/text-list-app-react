export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "shopping" | "health" | "other";

export interface Item {
  id: number;
  text: string;
  selected: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  timeEstimate?: "5min" | "30min" | "1h" | "2h+";
}

export interface FilterState {
  search: string;
  categoryFilter?: Category;
  priorityFilter?: Priority;
  showCompleted: boolean;
}

export interface Snapshot {
  items: Item[];
  focusedIndex: number;
}

export interface ListStore {
  items: Item[];
  focusedIndex: number;
  history: Snapshot[];
  filters: FilterState;

  reset: () => void;
  addItem: (
    text: string,
    priority?: Priority,
    category?: Category,
    dueDate?: string
  ) => void;
  toggleItem: (id: number) => void;
  setItemsSelected: (ids: number[], selected: boolean) => void;
  removeSelected: () => void;
  setFocusIndex: (index: number) => void;
  updateItem: (
    id: number,
    updates: Partial<Pick<Item, "text" | "priority" | "category" | "dueDate">>
  ) => void;
  completedItem: (id: number) => void;
  completeAfterSelectionClick: (id: number, firstSnapshot: Snapshot) => boolean;
  setFilters: (filters: Partial<FilterState>) => void;
  undo: () => boolean;
  getSelectedItem: () => Item | undefined;
}
