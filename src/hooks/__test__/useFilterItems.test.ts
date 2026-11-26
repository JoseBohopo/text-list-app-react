import { describe, expect, it } from "vitest";
import { useFilterItems } from "../useFilterItems";
import type { Item } from "../../store/types/useListStore.types";

const items: Item[] = [
  {
    id: 1,
    text: "Work report",
    selected: false,
    completed: false,
    priority: "high",
    category: "work",
    createdAt: new Date(),
  },
  {
    id: 2,
    text: "Buy groceries",
    selected: false,
    completed: true,
    priority: "low",
    category: "shopping",
    createdAt: new Date(),
  },
];

describe("useFilterItems", () => {
  it("combines search, category and priority filters", () => {
    const result = useFilterItems(items, {
      search: "REPORT",
      categoryFilter: "work",
      priorityFilter: "high",
      showCompleted: true,
    });

    expect(result.map((item) => item.id)).toEqual([1]);
    expect(useFilterItems(items, {
      search: "REPORT",
      categoryFilter: "shopping",
      priorityFilter: "high",
      showCompleted: true,
    })).toHaveLength(0);
  });

  it("hides completed items only when requested", () => {
    expect(useFilterItems(items, { search: "", showCompleted: false }))
      .toHaveLength(1);
    expect(useFilterItems(items, { search: "", showCompleted: true }))
      .toHaveLength(2);
  });
});