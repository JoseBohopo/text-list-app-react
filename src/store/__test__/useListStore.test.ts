import { describe, it, expect, beforeEach, vi } from "vitest";
import { useListStore } from "../useListStore";
import { usePersistenceStatus } from "../usePersistenceStatus";

beforeEach(() => useListStore.getState().reset());

it("keeps timestamps as strings after rehydration and undo", async () => {
  useListStore.getState().addItem("task");
  const { id } = useListStore.getState().items[0];
  useListStore.getState().completedItem(id);

  const { createdAt, completedAt } = useListStore.getState().items[0];
  expect(typeof createdAt).toBe("string");
  expect(typeof completedAt).toBe("string");

  const saved = localStorage.getItem("listStore");
  if (saved === null) throw new Error("Store was not saved");

  useListStore.getState().reset();
  localStorage.setItem("listStore", saved);
  await useListStore.persist.rehydrate();

  expect(useListStore.getState().items[0]).toMatchObject({
    createdAt,
    completedAt,
    completed: true,
  });

  expect(useListStore.getState().undo()).toBe(true);
  expect(useListStore.getState().items[0]).toMatchObject({
    createdAt,
    completed: false,
  });
  expect(useListStore.getState().items[0].completedAt).toBeUndefined();
});

describe("addItem", () => {
  it("adds an item to the list", () => {
    useListStore.getState().addItem("hello");
    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0].text).toBe("hello");
  });

  it("avoids duplicate ids after restoring saved items", () => {
    useListStore.getState().addItem("saved");
    const savedItems = useListStore.getState().items;

    useListStore.getState().reset();
    useListStore.setState({ items: savedItems });
    useListStore.getState().addItem("new");

    const ids = useListStore.getState().items.map((item) => item.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("toggleItem", () => {
  it("toggles selected state", () => {
    useListStore.getState().addItem("hello");
    const { id } = useListStore.getState().items[0];
    useListStore.getState().toggleItem(id);
    expect(useListStore.getState().items[0].selected).toBe(true);
    useListStore.getState().toggleItem(id);
    expect(useListStore.getState().items[0].selected).toBe(false);
  });
});

describe("updateItem", () => {
  it("updates a task and restores it with undo", () => {
    useListStore.getState().addItem("Original", "low", "work", "2026-12-01");
    const original = useListStore.getState().items[0];

    useListStore.getState().updateItem(original.id, {
      text: "Updated",
      priority: "high",
      category: "personal",
      dueDate: undefined,
    });

    expect(useListStore.getState().items[0]).toEqual({
      ...original,
      text: "Updated",
      priority: "high",
      category: "personal",
      dueDate: undefined,
    });

    expect(useListStore.getState().undo()).toBe(true);
    expect(useListStore.getState().items[0]).toEqual(original);
  });
});

describe("removeSelected", () => {
  it("removes selected items and resets focusedIndex", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().addItem("b");
    const { id } = useListStore.getState().items[0];
    useListStore.getState().toggleItem(id);
    useListStore.getState().removeSelected();
    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().focusedIndex).toBe(0);
  });
});

describe("removeSelected — focusedIndex", () => {
  it("sets focusedIndex to -1 when list is empty after removal", () => {
    useListStore.getState().addItem("a");
    const { id } = useListStore.getState().items[0];
    useListStore.getState().toggleItem(id);
    useListStore.getState().removeSelected();
    expect(useListStore.getState().focusedIndex).toBe(-1);
  });

  it("sets focusedIndex to last index when current index is out of bounds", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().addItem("b");
    useListStore.getState().addItem("c");
    useListStore.setState({ ...useListStore.getState(), focusedIndex: 2 });
    const { id } = useListStore.getState().items[2];
    useListStore.getState().toggleItem(id);
    useListStore.getState().removeSelected();
    expect(useListStore.getState().focusedIndex).toBe(1);
  });

  it("keeps focusedIndex when it is still within bounds", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().addItem("b");
    useListStore.getState().addItem("c");
    useListStore.setState({ ...useListStore.getState(), focusedIndex: 0 });
    const { id } = useListStore.getState().items[2];
    useListStore.getState().toggleItem(id);
    useListStore.getState().removeSelected();
    expect(useListStore.getState().focusedIndex).toBe(0);
  });
});

describe("setFocusIndex", () => {
  it("updates focusedIndex within bounds", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().addItem("b");
    useListStore.getState().setFocusIndex(1);
    expect(useListStore.getState().focusedIndex).toBe(1);
  });

  it("ignores out of bounds index", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().setFocusIndex(99);
    expect(useListStore.getState().focusedIndex).toBe(0);
  });
});

describe("undo", () => {
  it("returns false when history is empty", () => {
    expect(useListStore.getState().undo()).toBe(false);
  });

  it("restores previous snapshot", () => {
    useListStore.getState().addItem("a");
    useListStore.getState().addItem("b");
    useListStore.getState().undo();
    expect(useListStore.getState().items).toHaveLength(1);
  });

  it("keeps only the 20 most recent undo actions", () => {
    for (let i = 1; i <= 25; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }

    expect(useListStore.getState().history).toHaveLength(20);

    for (let i = 0; i < 20; i++) {
      expect(useListStore.getState().undo()).toBe(true);
    }

    expect(useListStore.getState().items.map((item) => item.text)).toEqual([
      "Task 1",
      "Task 2",
      "Task 3",
      "Task 4",
      "Task 5",
    ]);
    expect(useListStore.getState().undo()).toBe(false);
  });

  it("keeps tasks and the newest history when rehydrating older data", async () => {
    useListStore.getState().addItem("saved");
    const { items, filters } = useListStore.getState();
    const item = items[0];

    const history = Array.from({ length: 25 }, (_, i) => ({
      items: [{ ...item, text: `Snapshot ${i + 1}` }],
      focusedIndex: 0,
    }));

    localStorage.setItem(
      "listStore",
      JSON.stringify({
        state: { items, filters, focusedIndex: 0, history },
        version: 0,
      })
    );

    await useListStore.persist.rehydrate();

    const restored = useListStore.getState();
    expect(restored.items[0].text).toBe("saved");
    expect(restored.history).toHaveLength(20);
    expect(restored.history[0].items[0].text).toBe("Snapshot 6");
    expect(restored.history[19].items[0].text).toBe("Snapshot 25");
  });

  it("keeps changes in memory when saving fails and saves them on recovery", () => {
    const savedBefore = localStorage.getItem("listStore");
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementationOnce(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      });

    try {
      useListStore.getState().addItem("First task");

      expect(useListStore.getState().items[0].text).toBe("First task");
      expect(usePersistenceStatus.getState().status).toBe("write-error");
      expect(localStorage.getItem("listStore")).toBe(savedBefore);

      useListStore.getState().addItem("Second task");

      expect(usePersistenceStatus.getState().status).toBe("ok");
      const savedAfter = localStorage.getItem("listStore");
      if (savedAfter === null) throw new Error("Store was not saved");

      expect(JSON.parse(savedAfter)).toMatchObject({
        state: {
          items: [{ text: "First task" }, { text: "Second task" }],
        },
      });
    } finally {
      setItem.mockRestore();
    }
  });
});
