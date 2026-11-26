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
  createdAt: Date;
  completedAt?: Date;
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
  saveToHistory: () => void;
  addItem: (
    text: string,
    priority?: Priority,
    category?: Category,
    dueDate?: string
  ) => void;
  toggleItem: (id: number) => void;
  toggleItemState: (id: number) => void;
  removeSelected: () => void;
  removeItem: (id: number) => void;
  setFocusIndex: (index: number) => void;
  updateItem: (
    id: number,
    updates: Partial<Pick<Item, "text" | "priority" | "category" | "dueDate">>
  ) => void;
  completedItem: (id: number) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  undo: () => boolean;
  getSelectedItem: () => Item | undefined;
}
