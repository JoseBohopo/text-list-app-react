import type { Item, FilterState } from "../store/types/useListStore.types";

export function useFilterItems(items: Item[], filters: FilterState): Item[] {
  return items.filter((item) => {
    // Status filter
    if (!filters.showCompleted && item.completed) {
      return false;
    }

    // Search filter (case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!item.text.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.categoryFilter && item.category !== filters.categoryFilter) {
      return false;
    }

    // Priority filter
    if (filters.priorityFilter && item.priority !== filters.priorityFilter) {
      return false;
    }

    return true;
  });
}
