export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export interface Item {
  id: number;
  text: string;
  selected: boolean;
  priority: Priority;
  category: Category;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  timeEstimate?:  '5min' | '30min' | '1h' | '2h+';
}

export interface Snapshot {
  items: Item[];
  focusedIndex: number;
}

export interface ListStore {
  items: Item[];
  focusedIndex: number;
  history: Snapshot[];

  reset: () => void;
  saveToHistory: () => void;
  addItem: (text: string, priority?: Priority, category?: Category) => void;
  toggleItem: (id: number) => void;
  removeSelected: () => void;
  removeItem: (id: number) => void;
  setFocusIndex: (index: number) => void;
  updateItem: (id: number, updates: Partial<Item>) => void;
  completedItem: (id: number) => void;
  undo: () => boolean;
  getSelectedItem: () => Item | undefined;
}
