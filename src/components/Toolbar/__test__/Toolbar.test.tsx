import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Toolbar } from "../Toolbar";
import { useListStore } from "../../../store/useListStore";
import App from "../../../App";

beforeEach(() => useListStore.getState().reset());

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Toolbar", () => {
  it("renders Add, Delete and Undo buttons", () => {
    render(<Toolbar />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("Delete is disabled when nothing is selected", () => {
    render(<Toolbar />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });

  it("Undo is disabled when history is empty", () => {
    render(<Toolbar />);
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
  });

  it("opens the modal on Add click", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Delete removes selected item", async () => {
    useListStore.setState({
      items: [
        {
          id: 1,
          text: "a",
          selected: true,
          priority: "medium",
          category: "personal",
          completed: false,
          createdAt: new Date(),
        },
      ],
      focusedIndex: 0,
      history: [{ items: [], focusedIndex: 0 }],
    });
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it("Undo restores previous state", async () => {
    useListStore.setState({
      items: [
        {
          id: 1,
          text: "a",
          selected: false,
          priority: "medium",
          category: "personal",
          completed: false,
          createdAt: new Date(),
        },
      ],
      focusedIndex: 0,
      history: [{ items: [], focusedIndex: 0 }],
    });
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it("confirms before deleting hidden selected tasks", async () => {
    const user = userEvent.setup();
    useListStore.getState().addItem("visible");
    useListStore.getState().addItem("hidden");

    const [visible, hidden] = useListStore.getState().items;
    useListStore.getState().toggleItem(visible.id);
    useListStore.getState().toggleItem(hidden.id);
    useListStore.getState().setFilters({ search: "visible" });

    render(<App />);
    const deleteButton = screen.getByRole("button", {
      name: /delete selected/i,
    });

    await user.click(deleteButton);
    expect(screen.getByRole("dialog")).toHaveTextContent("1 hidden by filters");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const confirmButton = screen.getByRole("button", { name: "Delete tasks" });

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(useListStore.getState().items).toHaveLength(2);
    expect(deleteButton).toHaveFocus();

    await user.click(deleteButton);
    await user.click(screen.getByRole("button", { name: "Delete tasks" }));
    expect(useListStore.getState().items).toHaveLength(0);
    expect(screen.getByRole("button", { name: /add item/i })).toHaveFocus();
  });
});
