import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ItemList } from "../ItemList";
import { useListStore } from "../../../store/useListStore";

import App from "../../../App";
import { SearchFilter } from "../../SearchFilter/SearchFilter";
import { Toolbar } from "../../Toolbar/Toolbar";

import styles from "../styles/ItemList.module.css";

beforeEach(() => {
  useListStore.getState().reset();
  useListStore.getState().addItem("first");
  useListStore.getState().addItem("second");
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ItemList", () => {
  it("renders all items", () => {
    render(<ItemList onAddItem={vi.fn()} />);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("opens the add dialog from the empty state and restores focus", async () => {
    const user = userEvent.setup();
    useListStore.getState().reset();
    render(<App />);

    const emptyButton = screen.getByRole("button", {
      name: "Add your first item",
    });

    await user.click(emptyButton);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(emptyButton).toHaveFocus();

    await user.click(emptyButton);
    await user.type(screen.getByLabelText("Item name"), "First task");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Add item",
      })
    );

    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toHaveFocus();
  });

  it("selects an item without completing it", async () => {
    render(<ItemList onAddItem={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Select first for deletion",
    });
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(useListStore.getState().items[0]).toMatchObject({
      selected: true,
      completed: false,
    });
  });

  it("shows the task status based on completion and due date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 12));

    const store = useListStore.getState();
    store.addItem("Past", "medium", "work", "2026-11-25");
    store.addItem("Today", "medium", "work", "2026-11-26");
    store.addItem("No date");
    store.addItem("Done", "medium", "work", "2026-11-25");

    const done = useListStore
      .getState()
      .items.find((item) => item.text === "Done");
    expect(done).toBeDefined();
    useListStore.getState().completedItem(done!.id);

    render(<ItemList onAddItem={vi.fn()} />);

    expect(
      within(screen.getByRole("button", { name: "Complete Past" })).getByText(
        "Overdue"
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("button", { name: "Complete Today" })).getByText(
        "Pending"
      )
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("button", { name: "Complete No date" })
      ).getByText("Pending")
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("button", { name: "Complete Done" })).getByText(
        "Completed"
      )
    ).toBeInTheDocument();
  });

  it("marks a task overdue at local midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 23, 59, 59));
    useListStore.getState().addItem("Deadline", "medium", "work", "2026-11-26");

    render(<ItemList onAddItem={vi.fn()} />);
    const task = screen.getByRole("button", { name: "Complete Deadline" });
    expect(within(task).getByText("Pending")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(within(task).getByText("Overdue")).toBeInTheDocument();
    expect(task).toHaveAccessibleDescription(/^Overdue\b/);
    expect(task.closest("li")).toHaveClass(styles.overdue);
  });

  it("deletes an item on double click", async () => {
    render(<ItemList onAddItem={vi.fn()} />);
    await userEvent.dblClick(screen.getByText("first"));
    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0].text).toBe("second");
  });

  it("deletes only selected tasks and restores them with undo", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toolbar />
        <ItemList onAddItem={vi.fn()} />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Complete first" }));
    await user.click(
      screen.getByRole("checkbox", { name: "Select second for deletion" })
    );
    await user.click(screen.getByRole("button", { name: /delete selected/i }));

    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0]).toMatchObject({
      text: "first",
      completed: true,
      selected: false,
    });

    await user.click(screen.getByRole("button", { name: /undo last action/i }));
    expect(useListStore.getState().items).toHaveLength(2);
    expect(useListStore.getState().items[1]).toMatchObject({
      text: "second",
      selected: true,
      completed: false,
    });
  });

  it("saves the item in history before double click delete", async () => {
    render(<ItemList onAddItem={vi.fn()} />);
    await userEvent.dblClick(screen.getByText("first"));

    const lastSnapshot = useListStore.getState().history.at(-1);
    expect(lastSnapshot?.items.map((item) => item.text)).toContain("first");
    expect(
      useListStore.getState().items.map((item) => item.text)
    ).not.toContain("first");
  });

  it("shows new and previously saved dates on the correct day", () => {
    vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(function (
      this: Date,
      _locales,
      options
    ) {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: options?.timeZone ?? "America/Los_Angeles",
      }).format(this);
    });

    useListStore.getState().addItem("new date", "medium", "work", "2026-03-15");
    useListStore
      .getState()
      .addItem("old date", "medium", "work", "2026-03-15T00:00:00.000Z");

    render(<ItemList onAddItem={vi.fn()} />);

    expect(
      within(
        screen.getByRole("button", { name: /^complete new date\b/i })
      ).getByText("3/15/2026")
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("button", { name: /^complete old date\b/i })
      ).getByText("3/15/2026")
    ).toBeInTheDocument();
  });

  it("reaches and completes each task with the keyboard", async () => {
    const user = userEvent.setup();
    render(<ItemList onAddItem={vi.fn()} />);

    await user.tab();
    expect(
      screen.getByRole("checkbox", {
        name: "Select first for deletion",
      })
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Complete first" })
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Edit first" })).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("checkbox", {
        name: "Select second for deletion",
      })
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Complete second" })
    ).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(useListStore.getState().items[1].completed).toBe(true);
  });

  it("sets aria-pressed on completed item", async () => {
    render(<ItemList onAddItem={vi.fn()} />);
    await userEvent.click(screen.getByText("first"));

    expect(
      screen.getByRole("button", { name: /^complete first\b/i })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("completes and uncompletes an item on click", async () => {
    render(<ItemList onAddItem={vi.fn()} />);
    const task = screen.getByRole("button", { name: /^complete first\b/i });

    await userEvent.click(screen.getByText("first"));
    expect(useListStore.getState().items[0].completed).toBe(true);
    expect(task.closest("li")).toHaveClass(styles.completed);

    await userEvent.click(screen.getByText("first"));
    expect(useListStore.getState().items[0].completed).toBe(false);
    expect(task.closest("li")).not.toHaveClass(styles.completed);
  });

  it("completes an item with Enter", async () => {
    render(<ItemList onAddItem={vi.fn()} />);
    const task = screen.getByRole("button", { name: /^complete first\b/i });

    task.focus();
    await userEvent.keyboard("{Enter}");

    expect(useListStore.getState().items[0].completed).toBe(true);
    expect(useListStore.getState().items[0].selected).toBe(false);
  });

  it("keeps selection and completion independent", async () => {
    const user = userEvent.setup();
    render(<ItemList onAddItem={vi.fn()} />);

    const task = screen.getByRole("button", { name: /^complete first\b/i });
    const checkbox = screen.getByRole("checkbox", {
      name: "Select first for deletion",
    });

    await user.click(task);
    await user.click(checkbox);
    expect(useListStore.getState().items[0]).toMatchObject({
      completed: true,
      selected: true,
    });

    await user.click(task);
    expect(useListStore.getState().items[0]).toMatchObject({
      completed: false,
      selected: true,
    });
  });

  it("filters the list by search and shows an empty result", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchFilter />
        <ItemList onAddItem={vi.fn()} />
      </>
    );

    const search = screen.getByRole("textbox", { name: /search tasks/i });
    await user.type(search, "first");
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.queryByText("second")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "missing");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No tasks match the current filters."
    );

    await user.clear(search);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("navigates from the focused task after it is reordered", async () => {
    useListStore.getState().addItem("third");
    const user = userEvent.setup();

    render(<ItemList onAddItem={vi.fn()} />);
    const first = screen.getByRole("button", { name: /^complete first\b/i });
    first.focus();

    await user.keyboard("{Enter}");
    expect(first).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(
      screen.getByRole("button", { name: /^complete third\b/i })
    ).toHaveFocus();
  });

  it("hides and restores completed tasks through the filter", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchFilter />
        <ItemList onAddItem={vi.fn()} />
      </>
    );

    await user.click(screen.getByText("first"));
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const checkbox = screen.getByRole("switch", {
      name: /show completed tasks/i,
    });

    await user.click(checkbox);
    expect(screen.queryByText("first")).not.toBeInTheDocument();

    await user.click(checkbox);
    expect(screen.getByText("first")).toBeInTheDocument();
  });

  it("loads more tasks without hiding existing ones", async () => {
    const user = userEvent.setup();
    useListStore.getState().reset();

    for (let i = 1; i <= 25; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }

    render(<ItemList onAddItem={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(20);
    expect(screen.queryByText("Task 25")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more tasks" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(25);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 25")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Load more tasks" })
    ).not.toBeInTheDocument();
  });

  it("filters tasks beyond the initially visible batch", () => {
    useListStore.getState().reset();

    for (let i = 1; i <= 25; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }

    useListStore.getState().setFilters({ search: "Task 25" });
    render(<ItemList onAddItem={vi.fn()} />);

    expect(screen.getByText("Task 25")).toBeInTheDocument();
  });

  it("keeps focus on a task reordered beyond the visible batch", async () => {
    const user = userEvent.setup();
    useListStore.getState().reset();

    for (let i = 1; i <= 25; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }

    render(<ItemList onAddItem={vi.fn()} />);

    const task = screen.getByRole("button", { name: "Complete Task 1" });
    task.focus();
    await user.keyboard("{Enter}");

    expect(task).toHaveFocus();
    expect(task).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps focus when the last task was already visible", async () => {
    const user = userEvent.setup();
    useListStore.getState().reset();

    for (let i = 1; i <= 21; i++) {
      useListStore.getState().addItem(`Task ${i}`);
    }

    render(<ItemList onAddItem={vi.fn()} />);

    const task = screen.getByRole("button", { name: "Complete Task 1" });
    await user.click(task);
    await user.click(screen.getByRole("button", { name: "Load more tasks" }));

    expect(task).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Load more tasks" })
    ).not.toBeInTheDocument();
  });

  it("combines category and priority filters", async () => {
    useListStore.getState().addItem("report", "high", "work");
    useListStore.getState().addItem("groceries", "low", "shopping");

    const user = userEvent.setup();
    render(
      <>
        <Toolbar />
        <SearchFilter />
        <ItemList onAddItem={vi.fn()} />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Filters" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: /filter by category/i }),
      "work"
    );
    expect(screen.getByText("report")).toBeInTheDocument();
    expect(screen.queryByText("groceries")).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /filter by priority/i }),
      "low"
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No tasks match the current filters."
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: /filter by priority/i }),
      "high"
    );
    expect(screen.getByText("report")).toBeInTheDocument();
  });

  it("edits a task without completing it and reloads values on reopening", async () => {
    const user = userEvent.setup();
    render(<ItemList onAddItem={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Edit first" }));
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Edit first" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Edit second" }));
    expect(screen.getByLabelText("Item name")).toHaveValue("second");
    expect(screen.getByLabelText("Priority")).toHaveValue("medium");

    await user.clear(screen.getByLabelText("Item name"));
    await user.type(screen.getByLabelText("Item name"), "Updated");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(useListStore.getState().items[1]).toMatchObject({
      text: "Updated",
      completed: false,
      selected: false,
    });
    expect(screen.getByRole("button", { name: "Edit Updated" })).toHaveFocus();
  });

  it("focuses the empty result when editing hides the task", async () => {
    const user = userEvent.setup();
    useListStore.getState().setFilters({ search: "first" });
    render(<ItemList onAddItem={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Edit first" }));
    await user.clear(screen.getByLabelText("Item name"));
    await user.type(screen.getByLabelText("Item name"), "Updated");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("moves focus to another task when completion hides the current one", async () => {
    const user = userEvent.setup();
    useListStore.getState().setFilters({ showCompleted: false });
    render(<ItemList onAddItem={vi.fn()} />);

    screen.getByRole("button", { name: "Complete first" }).focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("button", { name: "Complete second" })
    ).toHaveFocus();
  });

  it("focuses the empty result when completion hides the last visible task", async () => {
    const user = userEvent.setup();
    useListStore.getState().setFilters({
      showCompleted: false,
      search: "first",
    });
    render(<ItemList onAddItem={vi.fn()} />);

    screen.getByRole("button", { name: "Complete first" }).focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("keeps keyboard navigation within filtered items", async () => {
    useListStore.getState().addItem("work one");
    useListStore.getState().addItem("work two");
    useListStore.getState().setFilters({ search: "work" });

    render(<ItemList onAddItem={vi.fn()} />);
    screen.getByRole("button", { name: /^complete work one\b/i }).focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("button", { name: /^complete work two\b/i })
    ).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(useListStore.getState().focusedIndex).toBe(1);
    expect(
      screen.getByRole("button", { name: /^complete work two\b/i })
    ).toHaveFocus();
  });
});
