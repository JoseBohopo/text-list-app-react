import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ItemList } from "../ItemList";
import { useListStore } from "../../../store/useListStore";

import { SearchFilter } from "../../SearchFilter/SearchFilter";

import styles from "../styles/ItemList.module.css";

beforeEach(() => {
  useListStore.getState().reset();
  useListStore.getState().addItem("first");
  useListStore.getState().addItem("second");
});

afterEach(() => vi.restoreAllMocks());

describe("ItemList", () => {
  it("renders all items", () => {
    render(<ItemList />);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("selects an item on single click", async () => {
    render(<ItemList />);
    await userEvent.click(screen.getByText("first"));
    expect(useListStore.getState().items[0].selected).toBe(true);
  });

  it("deletes an item on double click", async () => {
    render(<ItemList />);
    await userEvent.dblClick(screen.getByText("first"));
    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().items[0].text).toBe("second");
  });

  it("saves the item in history before double click delete", async () => {
    render(<ItemList />);
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

    render(<ItemList />);

    expect(
      within(screen.getByRole("option", { name: /new date/i })).getByText(
        "3/15/2026"
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("option", { name: /old date/i })).getByText(
        "3/15/2026"
      )
    ).toBeInTheDocument();
  });

  it("sets tabindex 0 on focused item", () => {
    useListStore.setState({ focusedIndex: 1 });
    render(<ItemList />);
    const lis = screen.getAllByRole("option");
    expect(lis[0]).toHaveAttribute("tabindex", "-1");
    expect(lis[1]).toHaveAttribute("tabindex", "0");
  });

  it("sets aria-selected on selected item", async () => {
    render(<ItemList />);
    await userEvent.click(screen.getByText("first"));

    expect(screen.getByRole("option", { name: /first/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("completes and uncompletes an item on click", async () => {
    render(<ItemList />);
    const task = screen.getByRole("option", { name: /first/i });

    await userEvent.click(screen.getByText("first"));
    expect(useListStore.getState().items[0].completed).toBe(true);
    expect(task).toHaveClass(styles.completed);

    await userEvent.click(screen.getByText("first"));
    expect(useListStore.getState().items[0].completed).toBe(false);
    expect(task).not.toHaveClass(styles.completed);
  });

  it("completes an item with Enter", async () => {
    render(<ItemList />);
    const task = screen.getByRole("option", { name: /first/i });

    task.focus();
    await userEvent.keyboard("{Enter}");

    expect(useListStore.getState().items[0].completed).toBe(true);
    expect(useListStore.getState().items[0].selected).toBe(true);
  });

  it("filters the list by search and shows an empty result", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchFilter />
        <ItemList />
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

    render(<ItemList />);
    const first = screen.getByRole("option", { name: /first/i });
    first.focus();

    await user.keyboard("{Enter}");
    expect(first).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: /third/i })).toHaveFocus();
  });

  it("hides and restores completed tasks through the filter", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchFilter />
        <ItemList />
      </>
    );

    await user.click(screen.getByText("first"));
    const checkbox = screen.getByRole("checkbox", {
      name: /show completed tasks/i,
    });

    await user.click(checkbox);
    expect(screen.queryByText("first")).not.toBeInTheDocument();

    await user.click(checkbox);
    expect(screen.getByText("first")).toBeInTheDocument();
  });

  it("combines category and priority filters", async () => {
    useListStore.getState().addItem("report", "high", "work");
    useListStore.getState().addItem("groceries", "low", "shopping");

    const user = userEvent.setup();
    render(
      <>
        <SearchFilter />
        <ItemList />
      </>
    );

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

  it("keeps keyboard navigation within filtered items", async () => {
    useListStore.getState().addItem("work one");
    useListStore.getState().addItem("work two");
    useListStore.getState().setFilters({ search: "work" });

    render(<ItemList />);
    screen.getByRole("option", { name: /work one/i }).focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /work two/i })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(useListStore.getState().focusedIndex).toBe(1);
    expect(screen.getByRole("option", { name: /work two/i })).toHaveFocus();
  });
});
