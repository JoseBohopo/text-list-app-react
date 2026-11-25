import { describe, it, expect } from "vitest";
import { useWorkflowOrdering } from "../useworkflowOrdering";
import type { Item } from "../../store/types/useListStore.types";

describe("useWorkflowOrdering", () => {
  const createItem = (overrides?: Partial<Item>): Item => ({
    id: Math.random(),
    text: "test",
    selected: false,
    priority: "medium",
    category: "personal",
    completed: false,
    createdAt: new Date(),
    ...overrides,
  });

  it("sorts by completed status (active first)", () => {
    const items = [
      createItem({ completed: true }),
      createItem({ completed: false }),
      createItem({ completed: true }),
    ];
    const sorted = useWorkflowOrdering(items);
    expect(sorted[0].completed).toBe(false);
    expect(sorted[1].completed).toBe(true);
  });

  it("sorts by priority (high > medium > low)", () => {
    const items = [
      createItem({ priority: "low" }),
      createItem({ priority: "high" }),
      createItem({ priority: "medium" }),
    ];
    const sorted = useWorkflowOrdering(items);
    expect(sorted[0].priority).toBe("high");
    expect(sorted[1].priority).toBe("medium");
    expect(sorted[2].priority).toBe("low");
  });

  it("sorts by dueDate (soonest first)", () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const nextWeek = new Date(today.getTime() + 604800000);

    const items = [
      createItem({ dueDate: nextWeek }),
      createItem({ dueDate: today }),
      createItem({ dueDate: tomorrow }),
    ];
    const sorted = useWorkflowOrdering(items);
    expect(sorted[0].dueDate).toEqual(today);
    expect(sorted[1].dueDate).toEqual(tomorrow);
  });

  it("prioritizes items with dueDate over without", () => {
    const dueDate = new Date();
    const items = [
      createItem(),
      createItem({ dueDate }),
    ];
    const sorted = useWorkflowOrdering(items);
    expect(sorted[0].dueDate).toEqual(dueDate);
  });

  it("sorts by createdAt when other criteria equal", () => {
    const early = new Date("2024-01-01");
    const late = new Date("2024-01-02");
    const items = [
      createItem({ createdAt: late }),
      createItem({ createdAt: early }),
    ];
    const sorted = useWorkflowOrdering(items);
    expect(sorted[0].createdAt).toEqual(early);
  });
});