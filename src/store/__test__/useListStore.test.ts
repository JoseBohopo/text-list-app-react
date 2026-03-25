import { describe, it, expect, beforeEach } from "vitest";
import { useListStore } from "../useListStore";

beforeEach(() => useListStore.getState().reset());

describe("addItem", () => {
  it("adds an item to the list", () => {
    useListStore.getState().addItem("hello");
    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0].text).toBe("hello");
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
    useListStore.getState().saveToHistory();
    useListStore.getState().addItem("b");
    useListStore.getState().undo();
    expect(useListStore.getState().items).toHaveLength(1);
  });
});
