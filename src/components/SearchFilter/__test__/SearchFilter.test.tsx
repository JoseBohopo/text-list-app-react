import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchFilter } from "../SearchFilter";
import { useListStore } from "../../../store/useListStore";

import App from "../../../App";

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
    useListStore.getState().addItem("task");
    render(<SearchFilter />);

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
    useListStore.getState().addItem("task");
    render(<SearchFilter />);

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

  it("disables filters when there are no tasks and enables them after adding one", async () => {
    const user = userEvent.setup();
    render(<App />);

    const filters = screen.getByRole("button", { name: "Filters" });

    await user.click(filters);
    expect(screen.getByLabelText("Filter by category")).toBeDisabled();
    expect(screen.getByLabelText("Filter by priority")).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Show completed tasks" })
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Add item" }));
    await user.type(screen.getByLabelText("Item name"), "First task");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Add item",
      })
    );

    await user.click(filters);
    expect(screen.getByLabelText("Filter by category")).toBeEnabled();
    expect(screen.getByLabelText("Filter by priority")).toBeEnabled();
    expect(
      screen.getByRole("switch", { name: "Show completed tasks" })
    ).toBeEnabled();

    await user.click(
      screen.getByRole("checkbox", { name: "Select First task for deletion" })
    );
    await user.click(screen.getByRole("button", { name: /delete selected/i }));

    await user.click(filters);
    expect(screen.getByLabelText("Filter by category")).toBeDisabled();
    expect(screen.getByLabelText("Filter by priority")).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Show completed tasks" })
    ).toBeDisabled();
  });
  it("toggles completed checkbox", async () => {
    const user = userEvent.setup();
    useListStore.getState().addItem("task");
    render(<SearchFilter />);

    await user.click(screen.getByRole("button", { name: "Filters" }));
    const checkbox = screen.getByRole("switch", {
      name: /show completed tasks/i,
    });
    await user.click(checkbox);

    expect(useListStore.getState().filters.showCompleted).toBe(false);
  });

  it("closes filters on outside click but not on interaction inside", async () => {
    const user = userEvent.setup();
    useListStore.getState().addItem("task");
    render(<SearchFilter />);

    const button = screen.getByRole("button", { name: "Filters" });
    const search = screen.getByRole("textbox", { name: "Search tasks" });

    await user.click(button);
    await user.selectOptions(
      screen.getByLabelText("Filter by category"),
      "work"
    );

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();

    await user.click(search);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("group", { name: "Filters" })
    ).not.toBeInTheDocument();
    expect(search).toHaveFocus();

    await user.click(button);
    expect(screen.getByLabelText("Filter by category")).toHaveValue("work");
  });
});
