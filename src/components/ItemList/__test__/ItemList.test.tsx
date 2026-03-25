import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { ItemList } from "../ItemList";
import { useListStore } from "../../../store/useListStore";

beforeEach(() => {
  useListStore.getState().reset();
  useListStore.getState().addItem("first");
  useListStore.getState().addItem("second");
});

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

  it("saves to history before double click delete", async () => {
    render(<ItemList />);
    await userEvent.dblClick(screen.getByText("first"));
    expect(useListStore.getState().history).toHaveLength(5);
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
    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
