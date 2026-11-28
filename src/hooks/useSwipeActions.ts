import { useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

type SwipeAction = "complete" | "delete";

interface ActivePointer {
  id: number;
  startX: number;
  startY: number;
  claimed: boolean;
  taskId: number;
}

interface SwipeOptions {
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  threshold?: number;
}

export function useSwipeActions({
  onComplete,
  onDelete,
  threshold = 80,
}: SwipeOptions) {
  const activePointer = useRef<ActivePointer | null>(null);
  const suppressClick = useRef(false);
  const [offsetX, setOffsetX] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [action, setAction] = useState<SwipeAction | null>(null);

  function reset() {
    activePointer.current = null;
    setOffsetX(0);
    setAction(null);
    setActiveTaskId(null);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLLIElement>) {
    if (event.pointerType !== "touch" || !event.isPrimary) return;
    if (!(event.target instanceof Element)) return;
    const isOtherControl = event.target.closest(
      'input, select, textarea, a, button:not([data-task-control]), [contenteditable="true"]'
    );
    if (isOtherControl) return;

    const taskId = Number(event.currentTarget.dataset.taskId);
    if (!Number.isSafeInteger(taskId)) return;

    suppressClick.current = false;
    activePointer.current = {
      id: event.pointerId,
      taskId,
      startX: event.clientX,
      startY: event.clientY,
      claimed: false,
    };
    setActiveTaskId(taskId);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLLIElement>) {
    const pointer = activePointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;

    if (!pointer.claimed && Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) {
      return;
    }

    if (!pointer.claimed && Math.abs(deltaY) >= Math.abs(deltaX)) {
      reset();
      return;
    }

    pointer.claimed = true;
    setOffsetX(Math.max(-120, Math.min(120, deltaX)));
    setAction(deltaX < 0 ? "delete" : "complete");
  }

  function onPointerUp(event: ReactPointerEvent<HTMLLIElement>) {
    const pointer = activePointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const shouldTrigger = pointer.claimed && Math.abs(deltaX) >= threshold;

    if (shouldTrigger) {
      suppressClick.current = true;
      if (deltaX < 0) {
        onDelete(pointer.taskId);
      } else {
        onComplete(pointer.taskId);
      }
    }

    reset();
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLLIElement>) {
    if (activePointer.current?.id === event.pointerId) {
      reset();
    }
  }

  function onClickCapture(event: ReactMouseEvent<HTMLLIElement>) {
    if (!suppressClick.current) return;

    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
    offsetX,
    activeTaskId,
    action,
  };
}
