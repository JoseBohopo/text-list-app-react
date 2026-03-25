export interface Item {
  id: number;
  text: string;
  selected: boolean;
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
  addItem: (text: string) => void;
  toggleItem: (id: number) => void;
  removeSelected: () => void;
  removeItem: (id: number) => void;
  setFocusIndex: (index: number) => void;
  undo: () => boolean;
  getSelectedItem: () => Item | undefined;
}
