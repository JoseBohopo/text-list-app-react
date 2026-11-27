import { expect, it, vi } from "vitest";

it("protects saved data when reading fails", async () => {
  vi.resetModules();

  const previous = localStorage.getItem("listStore");
  const saved = JSON.stringify({
    state: { items: [] },
    version: 0,
  });
  localStorage.setItem("listStore", saved);

  const getItem = vi
    .spyOn(Storage.prototype, "getItem")
    .mockImplementationOnce(() => {
      throw new Error("Storage unavailable");
    });

  try {
    const { useListStore } = await import("../useListStore");
    const { usePersistenceStatus } = await import("../usePersistenceStatus");

    getItem.mockRestore();

    expect(usePersistenceStatus.getState().status).toBe("read-error");

    useListStore.getState().addItem("New task");

    expect(useListStore.getState().items[0].text).toBe("New task");
    expect(usePersistenceStatus.getState().status).toBe("read-error");
    expect(localStorage.getItem("listStore")).toBe(saved);
  } finally {
    getItem.mockRestore();
    if (previous === null) {
      localStorage.removeItem("listStore");
    } else {
      localStorage.setItem("listStore", previous);
    }
    vi.resetModules();
  }
});

const validItem = {
  id: 1,
  text: "Saved task",
  selected: false,
  priority: "medium",
  category: "personal",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const validState = {
  items: [validItem],
  focusedIndex: 0,
  history: [],
  filters: { search: "", showCompleted: true },
};

it.each([
  {
    description: "items is null",
    saved: JSON.stringify({
      state: { ...validState, items: null },
      version: 0,
    }),
  },
  {
    description: "task text is invalid",
    saved: JSON.stringify({
      state: { ...validState, items: [{ ...validItem, text: null }] },
      version: 0,
    }),
  },
  {
    description: "history is invalid",
    saved: JSON.stringify({
      state: { ...validState, history: [{ items: null, focusedIndex: 0 }] },
      version: 0,
    }),
  },
  {
    description: "filters are invalid",
    saved: JSON.stringify({
      state: { ...validState, filters: { search: null, showCompleted: true } },
      version: 0,
    }),
  },
  {
    description: "the version is unsupported",
    saved: JSON.stringify({ state: validState, version: 1 }),
  },
  { description: "the JSON is null", saved: "null" },
  {
    description: "the JSON is malformed",
    saved: "{",
  },
  {
    description: "task IDs are duplicated",
    saved: JSON.stringify({
      state: { ...validState, items: [validItem, validItem] },
      version: 0,
    }),
  },
  {
    description: "a task has an invalid priority",
    saved: JSON.stringify({
      state: { ...validState, items: [{ ...validItem, priority: "urgent" }] },
      version: 0,
    }),
  },
  {
    description: "the state contains an unexpected action",
    saved: JSON.stringify({
      state: { ...validState, addItem: "invalid" },
      version: 0,
    }),
  },
])("protects saved data when $description", async ({ saved }) => {
  vi.resetModules();

  const previous = localStorage.getItem("listStore");
  localStorage.setItem("listStore", saved);

  try {
    const { useListStore } = await import("../useListStore");
    const { usePersistenceStatus } = await import("../usePersistenceStatus");

    expect(usePersistenceStatus.getState().status).toBe("read-error");
    expect(useListStore.getState().items).toEqual([]);

    useListStore.getState().addItem("New task");

    expect(localStorage.getItem("listStore")).toBe(saved);
  } finally {
    if (previous === null) {
      localStorage.removeItem("listStore");
    } else {
      localStorage.setItem("listStore", previous);
    }
    vi.resetModules();
  }
});

it("loads valid saved tasks and allows further changes", async () => {
  vi.resetModules();

  const previous = localStorage.getItem("listStore");
  localStorage.setItem(
    "listStore",
    JSON.stringify({ state: validState, version: 0 })
  );

  try {
    const { useListStore } = await import("../useListStore");
    const { usePersistenceStatus } = await import("../usePersistenceStatus");

    expect(usePersistenceStatus.getState().status).toBe("ok");
    expect(useListStore.getState().items).toEqual([validItem]);

    useListStore.getState().addItem("New task");

    expect(usePersistenceStatus.getState().status).toBe("ok");
    const saved = localStorage.getItem("listStore");
    if (saved === null) throw new Error("Store was not saved");

    expect(JSON.parse(saved)).toMatchObject({
      state: {
        items: [{ text: "Saved task" }, { text: "New task" }],
      },
    });
  } finally {
    if (previous === null) {
      localStorage.removeItem("listStore");
    } else {
      localStorage.setItem("listStore", previous);
    }
    vi.resetModules();
  }
});
