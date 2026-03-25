import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { Toolbar } from "../Toolbar";
import { useListStore } from "../../../store/useListStore";

beforeEach(() =>
  useListStore.setState({ items: [], focusedIndex: 0, history: [] }),
);

describe("Toolbar", () => {
  it("renders Add, Delete and Undo buttons", () => {
    render(<Toolbar />);
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
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
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Delete removes selected item", async () => {
    useListStore.setState({
      items: [{ id: 1, text: "a", selected: true }],
      focusedIndex: 0,
      history: [{ items: [], focusedIndex: 0 }],
    });
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it("Undo restores previous state", async () => {
    useListStore.setState({
      items: [{ id: 1, text: "a", selected: false }],
      focusedIndex: 0,
      history: [{ items: [], focusedIndex: 0 }],
    });
    render(<Toolbar />);
    await userEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(useListStore.getState().items).toHaveLength(0);
  });
});
