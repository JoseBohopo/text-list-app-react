import type { Item } from "./types/useListStore.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPriority(value: unknown): boolean {
  return value === "low" || value === "medium" || value === "high";
}

function isCategory(value: unknown): boolean {
  return (
    value === "work" ||
    value === "personal" ||
    value === "shopping" ||
    value === "health" ||
    value === "other"
  );
}

function isDateString(value: unknown): boolean {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.text === "string" &&
    typeof value.selected === "boolean" &&
    isPriority(value.priority) &&
    isCategory(value.category) &&
    typeof value.completed === "boolean" &&
    isDateString(value.createdAt) &&
    (value.dueDate === undefined || isDateString(value.dueDate)) &&
    (value.completedAt === undefined || isDateString(value.completedAt)) &&
    (value.timeEstimate === undefined ||
      value.timeEstimate === "5min" ||
      value.timeEstimate === "30min" ||
      value.timeEstimate === "1h" ||
      value.timeEstimate === "2h+")
  );
}

function isItemList(value: unknown): boolean {
  if (!Array.isArray(value) || !value.every(isItem)) return false;
  return new Set(value.map((item) => item.id)).size === value.length;
}

function isSnapshot(value: unknown): boolean {
  return (
    isRecord(value) &&
    isItemList(value.items) &&
    typeof value.focusedIndex === "number" &&
    Number.isSafeInteger(value.focusedIndex) &&
    value.focusedIndex >= -1
  );
}

function isFilters(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.search === "string" &&
    typeof value.showCompleted === "boolean" &&
    (value.priorityFilter === undefined || isPriority(value.priorityFilter)) &&
    (value.categoryFilter === undefined || isCategory(value.categoryFilter))
  );
}

export function isValidPersistedState(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.state)) return false;
  if (value.version !== undefined && value.version !== 0) return false;

  const state = value.state;
  const allowedKeys = new Set(["items", "focusedIndex", "history", "filters"]);

  return (
    Object.keys(state).every((key) => allowedKeys.has(key)) &&
    isItemList(state.items) &&
    typeof state.focusedIndex === "number" &&
    Number.isSafeInteger(state.focusedIndex) &&
    state.focusedIndex >= -1 &&
    Array.isArray(state.history) &&
    state.history.every(isSnapshot) &&
    isFilters(state.filters)
  );
}
