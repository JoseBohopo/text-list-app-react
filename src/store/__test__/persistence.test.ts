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
