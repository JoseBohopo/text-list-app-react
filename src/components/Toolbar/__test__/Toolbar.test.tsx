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

  it("disables select all when no tasks match", () => {
    render(<Toolbar />);

    expect(
      screen.getByRole("checkbox", { name: "Select all filtered tasks" })
    ).toBeDisabled();
  });

  it("selects filtered tasks, including unloaded ones, without changing hidden tasks", async () => {
    const user = userEvent.setup();

    for (let i = 1; i <= 25; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }
    useListStore.getState().addItem("Hidden");

    const items = useListStore.getState().items;
    useListStore.getState().toggleItem(items[0].id);
    useListStore.getState().toggleItem(items[25].id);
    useListStore.getState().setFilters({ search: "Task" });

    render(<Toolbar />);

    const selectAll = screen.getByRole("checkbox", {
      name: "Select all filtered tasks",
    });
    expect(selectAll).toBePartiallyChecked();

    await user.click(selectAll);
    expect(useListStore.getState().items.every((item) => item.selected)).toBe(
      true
    );

    await user.click(screen.getByRole("button", { name: "Undo last action" }));
    expect(selectAll).toBePartiallyChecked();
    expect(
      useListStore.getState().items.filter((item) => item.selected)
    ).toHaveLength(2);

    await user.click(selectAll);
    await user.click(selectAll);

    expect(
      useListStore
        .getState()
        .items.slice(0, 25)
        .every((item) => !item.selected)
    ).toBe(true);
    expect(useListStore.getState().items[25].selected).toBe(true);
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
          createdAt: new Date().toISOString(),
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
          createdAt: new Date().toISOString(),
        },
      ],
      focusedIndex: 0,
      history: [{ items: [], focusedIndex: 0 }],
    });
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it.each([false, true])(
    "undoes deletion and then selection (hidden=%s)",
    async (hidden) => {
      const user = userEvent.setup();
      const store = useListStore.getState();

      store.addItem("task");
      store.addItem("other");
      const id = useListStore.getState().items[0].id;
      store.toggleItem(id);

      if (hidden) {
        store.setFilters({ search: "other" });
      }

      render(<Toolbar />);

      await user.click(
        screen.getByRole("button", { name: "Delete selected item" })
      );

      if (hidden) {
        await user.click(screen.getByRole("button", { name: "Delete tasks" }));
      }

      expect(useListStore.getState().items).toHaveLength(1);

      await user.click(
        screen.getByRole("button", { name: "Undo last action" })
      );
      expect(useListStore.getState().items[0]).toMatchObject({
        text: "task",
        selected: true,
      });

      await user.click(
        screen.getByRole("button", { name: "Undo last action" })
      );
      expect(useListStore.getState().items[0]).toMatchObject({
        text: "task",
        selected: false,
      });
    }
  );

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
