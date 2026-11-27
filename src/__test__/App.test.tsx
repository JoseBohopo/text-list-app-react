import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import App from "../App";
import { useListStore } from "../store/useListStore";
import { usePersistenceStatus } from "../store/usePersistenceStatus";

it("shows a warning when tasks cannot be saved and hides it after recovery", () => {
  useListStore.getState().reset();
  const { unmount } = render(<App />);

  const setItem = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

  try {
    act(() => {
      useListStore.getState().addItem("First task");
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your changes could not be saved"
    );
    expect(screen.getByText("First task")).toBeInTheDocument();

    setItem.mockRestore();

    act(() => {
      useListStore.getState().addItem("Second task");
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
  } finally {
    setItem.mockRestore();
    unmount();
    useListStore.getState().reset();
  }
});

it("explains that saving is disabled after a read error", () => {
  const { unmount } = render(<App />);

  try {
    act(() => {
      usePersistenceStatus.getState().setStatus("read-error");
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Saving is disabled to protect existing data"
    );
  } finally {
    unmount();
    usePersistenceStatus.getState().setStatus("ok");
  }
});
