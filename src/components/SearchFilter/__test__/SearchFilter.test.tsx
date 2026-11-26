import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchFilter } from "../SearchFilter";
import { useListStore } from "../../../store/useListStore";

beforeEach(() => useListStore.getState().reset());

describe("SearchFilter", () => {
  it("renders search input", () => {
    render(<SearchFilter />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("updates search filter on input change", async () => {
    const user = userEvent.setup();
    render(<SearchFilter />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "test");

    expect(useListStore.getState().filters.search).toBe("test");
  });

  it("renders category and priority selectors", () => {
    render(<SearchFilter />);
    expect(screen.getByDisplayValue(/all categories/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/all priorities/i)).toBeInTheDocument();
  });

  it("toggles completed checkbox", async () => {
    const user = userEvent.setup();
    render(<SearchFilter />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(useListStore.getState().filters.showCompleted).toBe(false);
  });
});
