import type { Item } from "../store/types/useListStore.types";

export function useWorkflowOrdering(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    // 1. Completed items al final
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // 2. Priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // 3. Due date (próximas primero)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // 4. Created (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
