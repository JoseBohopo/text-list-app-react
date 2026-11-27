import { describe, it, expect, beforeEach } from "vitest";
import { useListStore } from "../useListStore";

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
});
