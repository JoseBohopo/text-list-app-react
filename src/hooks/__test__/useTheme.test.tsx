import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useTheme } from "../useTheme";

it("keeps the theme usable when storage is unavailable", () => {
  const previousTheme = document.documentElement.dataset.theme;
  const getItem = vi
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
  const setItem = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    const { result, unmount } = renderHook(() => useTheme());
    const initialTheme = result.current.theme;

    expect(consoleError).toHaveBeenCalledWith(
      "Could not read the saved theme.",
      expect.any(Error)
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Could not save the theme.",
      expect.any(Error)
    );

    act(() => result.current.toggle());

    expect(result.current.theme).not.toBe(initialTheme);
    expect(document.documentElement.dataset.theme).toBe(result.current.theme);
    unmount();
  } finally {
    getItem.mockRestore();
    setItem.mockRestore();
    consoleError.mockRestore();

    if (previousTheme === undefined) {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = previousTheme;
    }
  }
});
