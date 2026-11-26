import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchFilter } from "../SearchFilter";
import { useListStore } from "../../../store/useListStore";

import { Toolbar } from "../../Toolbar/Toolbar";

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

  it("opens and closes the filters with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    const button = screen.getByRole("button", { name: "Filters" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by priority")).toBeInTheDocument();

    screen.getByLabelText("Filter by category").focus();
    await user.keyboard("{Escape}");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
    expect(
      screen.queryByLabelText("Filter by category")
    ).not.toBeInTheDocument();
  });

  it("shows active filters after closing the panel", async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    const button = screen.getByRole("button", { name: "Filters" });
    expect(button).toHaveAccessibleDescription("0 active filters");

    await user.click(button);
    await user.selectOptions(
      screen.getByLabelText("Filter by category"),
      "work"
    );
    await user.selectOptions(
      screen.getByLabelText("Filter by priority"),
      "high"
    );
    await user.click(button);

    expect(button).toHaveTextContent("2");
    expect(button).toHaveAccessibleDescription("2 active filters");

    await user.click(button);
    expect(screen.getByLabelText("Filter by category")).toHaveValue("work");
    expect(screen.getByLabelText("Filter by priority")).toHaveValue("high");
  });
  it("toggles completed checkbox", async () => {
    const user = userEvent.setup();
    render(<SearchFilter />);

    const checkbox = screen.getByRole("switch", {
      name: /show completed tasks/i,
    });
    await user.click(checkbox);

    expect(useListStore.getState().filters.showCompleted).toBe(false);
  });
});
