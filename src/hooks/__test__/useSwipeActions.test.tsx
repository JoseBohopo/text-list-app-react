import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useSwipeActions } from "../useSwipeActions";

class TestPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(
    type: string,
    init: MouseEventInit & {
      pointerId?: number;
      pointerType?: string;
      isPrimary?: boolean;
    } = {}
  ) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? "touch";
    this.isPrimary = init.isPrimary ?? true;
  }
}

function SwipeHarness({
  onComplete,
  onDelete,
  onTaskClick,
}: {
  onComplete: () => void;
  onDelete: () => void;
  onTaskClick: () => void;
}) {
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
    offsetX,
    action,
  } = useSwipeActions({ onComplete, onDelete });

  return (
    <ul>
      <li
        data-testid="task"
        data-task-id="1"
        data-offset-x={offsetX}
        data-swipe-action={action ?? ""}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        <button type="button" data-task-control onClick={onTaskClick}>
          Swipe me
        </button>
      </li>
    </ul>
  );
}

function sendPointer(
  element: HTMLElement,
  type: string,
  clientX: number,
  clientY: number
) {
  fireEvent(
    element,
    new TestPointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
    })
  );
}

it("completes on a right swipe and suppresses the task click", () => {
  const onComplete = vi.fn();
  const onDelete = vi.fn();
  const onTaskClick = vi.fn();

  render(
    <SwipeHarness
      onComplete={onComplete}
      onDelete={onDelete}
      onTaskClick={onTaskClick}
    />
  );

  const task = screen.getByTestId("task");
  const button = screen.getByRole("button", { name: "Swipe me" });

  Object.defineProperty(task, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });

  sendPointer(button, "pointerdown", 100, 100);
  sendPointer(task, "pointermove", 190, 100);

  expect(task).toHaveAttribute("data-offset-x", "90");
  expect(task).toHaveAttribute("data-swipe-action", "complete");

  sendPointer(task, "pointerup", 190, 100);

  expect(onComplete).toHaveBeenCalledOnce();
  expect(onDelete).not.toHaveBeenCalled();
  expect(task).toHaveAttribute("data-offset-x", "0");

  fireEvent.click(button);
  expect(onTaskClick).not.toHaveBeenCalled();
});

it("deletes on a left swipe", () => {
  const onComplete = vi.fn();
  const onDelete = vi.fn();
  const onTaskClick = vi.fn();

  render(
    <SwipeHarness
      onComplete={onComplete}
      onDelete={onDelete}
      onTaskClick={onTaskClick}
    />
  );

  const task = screen.getByTestId("task");
  const button = screen.getByRole("button", { name: "Swipe me" });

  Object.defineProperty(task, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });

  sendPointer(button, "pointerdown", 200, 100);
  sendPointer(task, "pointermove", 100, 100);
  sendPointer(task, "pointerup", 100, 100);

  expect(onDelete).toHaveBeenCalledOnce();
  expect(onComplete).not.toHaveBeenCalled();
});

it("does not trigger an action for a short swipe or vertical scroll", () => {
  const onComplete = vi.fn();
  const onDelete = vi.fn();

  render(
    <SwipeHarness
      onComplete={onComplete}
      onDelete={onDelete}
      onTaskClick={vi.fn()}
    />
  );

  const task = screen.getByTestId("task");
  const button = screen.getByRole("button", { name: "Swipe me" });

  Object.defineProperty(task, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });

  sendPointer(button, "pointerdown", 100, 100);
  sendPointer(task, "pointermove", 140, 100);
  sendPointer(task, "pointerup", 140, 100);

  sendPointer(button, "pointerdown", 100, 100);
  sendPointer(task, "pointermove", 103, 140);
  sendPointer(task, "pointerup", 103, 140);

  expect(onComplete).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
});
