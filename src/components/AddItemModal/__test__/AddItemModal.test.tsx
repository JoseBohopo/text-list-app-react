import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddItemModal } from "../AddItemModal";
import { useListStore } from "../../../store/useListStore";
import { createRef } from "react";
import App from "../../../App";

beforeEach(() =>
  useListStore.setState({ items: [], focusedIndex: 0, history: [] })
);

function setup(isOpen = true) {
  const triggerRef = createRef<HTMLButtonElement>();
  const onClose = vi.fn();
  render(
    <AddItemModal isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
  );
  return { onClose };
}

describe("AddItemModal", () => {
  it("renders nothing when closed", () => {
    setup(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the form when open", () => {
    setup();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows error for empty submission", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("adds item with default priority and category", async () => {
    const { onClose } = setup();
    await userEvent.type(
      screen.getByPlaceholderText("What would you like to add?"),
      "Buy milk"
    );
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    const item = useListStore.getState().items[0];
    expect(item.text).toBe("Buy milk");
    expect(item.priority).toBe("medium");
    expect(item.category).toBe("personal");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("adds item with custom priority and category", async () => {
    setup();
    await userEvent.type(
      screen.getByPlaceholderText("What would you like to add?"),
      "Work task"
    );
    await userEvent.selectOptions(screen.getByLabelText("Priority"), "high");
    await userEvent.selectOptions(screen.getByLabelText("Category"), "work");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    const item = useListStore.getState().items[0];
    expect(item.priority).toBe("high");
    expect(item.category).toBe("work");
  });

  it("adds a dated task in one undoable action and clears the date", async () => {
    const user = userEvent.setup();
    setup();

    await user.type(screen.getByLabelText("Item name"), "Report");
    await user.type(screen.getByLabelText(/due date/i), "2026-03-15");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(useListStore.getState().items[0].dueDate).toBeDefined();
    expect(screen.getByLabelText(/due date/i)).toHaveValue("");

    act(() => {
      useListStore.getState().undo();
    });
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it("edits an existing item and supports undo", async () => {
    const user = userEvent.setup();
    useListStore.getState().addItem("Original", "low", "work", "2026-12-01");

    const original = useListStore.getState().items[0];

    render(
      <AddItemModal
        isOpen
        item={original}
        onClose={vi.fn()}
        triggerRef={createRef<HTMLButtonElement>()}
      />
    );

    const name = screen.getByLabelText("Item name");
    expect(name).toHaveValue("Original");
    expect(screen.getByLabelText("Priority")).toHaveValue("low");
    expect(screen.getByLabelText(/due date/i)).toHaveValue("2026-12-01");

    await user.clear(name);
    await user.type(name, "Updated");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.clear(screen.getByLabelText(/due date/i));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0]).toMatchObject({
      id: original.id,
      text: "Updated",
      priority: "high",
      category: "work",
      dueDate: undefined,
    });

    expect(useListStore.getState().undo()).toBe(true);
    expect(useListStore.getState().items[0]).toEqual(original);
  });

  it("keeps Tab navigation inside the dialog", async () => {
    const user = userEvent.setup();
    setup();

    const first = screen.getByLabelText("Item name");
    const last = screen.getByRole("button", { name: "Add item" });

    expect(first).toHaveFocus();

    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    await user.tab();
    expect(first).toHaveFocus();
  });

  it("closes the add dialog and returns focus on cancel", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole("button", { name: /add item/i });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(dialog).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes without adding on cancel", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it("clears error on input change", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.type(
      screen.getByPlaceholderText("What would you like to add?"),
      "x"
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
