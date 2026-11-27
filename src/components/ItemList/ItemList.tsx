import { useRef, useState, useLayoutEffect, useEffect } from "react";

import type { Item, Snapshot } from "../../store/types/useListStore.types";
import { AddItemModal } from "../AddItemModal/AddItemModal";
import { Button } from "../ui/Button/Button";

import { useListStore } from "../../store/useListStore";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useWorkflowOrdering } from "../../hooks/useworkflowOrdering";
import { useFilterItems } from "../../hooks/useFilterItems";

import { EmptyState } from "../EmptyState/EmptyState";

import styles from "./styles/ItemList.module.css";

interface Props {
  readonly onAddItem: (trigger: HTMLButtonElement) => void;
}

function getToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getTaskStatus(item: Item, today: string) {
  if (item.completed) return "Completed";
  if (item.dueDate && item.dueDate.slice(0, 10) < today) return "Overdue";
  return "Pending";
}

export function ItemList({ onAddItem }: Props) {
  const {
    items,
    filters,
    setFocusIndex,
    focusedIndex,
    toggleItem,
    completedItem,
    completeAfterSelectionClick,
  } = useListStore();

  const [visibleCount, setVisibleCount] = useState(20);
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [today, setToday] = useState(getToday);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  const firstClickRef = useRef<{
    id: number;
    snapshot: Snapshot;
  } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredItems = useFilterItems(items, filters);
  const orderedItems = useWorkflowOrdering(filteredItems);
  const supportsIntersectionObserver =
    typeof IntersectionObserver !== "undefined";

  const visibleItems = orderedItems.filter(
    (item, index) =>
      !supportsIntersectionObserver ||
      index < visibleCount ||
      item.id === pinnedId
  );
  const activeIndex = Math.min(
    Math.max(focusedIndex, 0),
    visibleItems.length - 1
  );

  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const noResultsRef = useRef<HTMLOutputElement>(null);
  const restoreEditFocus = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusId = useRef<number | null>(null);
  const pendingFocusTarget = useRef<"task" | "complete">("task");

  function handleLoadMoreFromKeyboard() {
    const nextItem = orderedItems
      .slice(visibleCount)
      .find((item) => !visibleItems.some((visible) => visible.id === item.id));

    if (!nextItem) return;

    pendingFocusId.current = nextItem.id;
    setVisibleCount((count) => count + 20);
  }

  useKeyboardNavigation(
    listRef,
    visibleItems.length,
    visibleItems.length < orderedItems.length
      ? handleLoadMoreFromKeyboard
      : undefined
  );

  useLayoutEffect(() => {
    const id = pendingFocusId.current;
    const target = pendingFocusTarget.current;
    pendingFocusTarget.current = "task";
    if (id === null) return;
    pendingFocusId.current = null;

    const index = visibleItems.findIndex((item) => item.id === id);

    if (index < 0) {
      if (visibleItems.length === 0) {
        noResultsRef.current?.focus();
      } else {
        const nextItem = visibleItems[activeIndex];
        listRef.current
          ?.querySelector<HTMLButtonElement>(`[data-id="${nextItem.id}"]`)
          ?.focus();
        setFocusIndex(activeIndex);
      }
      return;
    }

    const selector =
      target === "complete"
        ? `[data-complete-id="${id}"]`
        : `[data-id="${id}"]`;

    listRef.current?.querySelector<HTMLElement>(selector)?.focus();
    setFocusIndex(index);
  }, [visibleItems, setFocusIndex, activeIndex]);

  useLayoutEffect(() => {
    if (editingItem !== null || !restoreEditFocus.current) return;

    restoreEditFocus.current = false;

    if (editTriggerRef.current?.isConnected) {
      editTriggerRef.current.focus();
    } else if (noResultsRef.current) {
      noResultsRef.current.focus();
    } else {
      document.getElementById("addBtn")?.focus();
    }
  }, [editingItem]);

  useEffect(() => {
    let timer: number;

    function scheduleUpdate() {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      timer = window.setTimeout(() => {
        setToday(getToday());
        scheduleUpdate();
      }, tomorrow.getTime() - now.getTime());
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      setToday(getToday());
      scheduleUpdate();
    }

    scheduleUpdate();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (
      !sentinel ||
      visibleCount >= orderedItems.length ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let active = true;
    let loaded = false;

    const observer = new IntersectionObserver((entries) => {
      if (!active || loaded || !entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      loaded = true;
      setVisibleCount((count) => count + 20);
    });

    observer.observe(sentinel);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [visibleCount, orderedItems.length]);

  if (items.length === 0) {
    return <EmptyState onAddItem={onAddItem} />;
  }

  if (orderedItems.length === 0) {
    return (
      <output ref={noResultsRef} tabIndex={-1}>
        No tasks match the current filters.
      </output>
    );
  }

  function handleTaskClick(id: number, detail: number) {
    setInteractionError(null);

    if (detail > 0 && detail % 2 === 0) {
      const firstClick = firstClickRef.current;

      if (
        firstClick?.id === id &&
        useListStore.getState().history.at(-1) === firstClick.snapshot
      ) {
        return;
      }

      firstClickRef.current = null;
      toggleItem(id);
      return;
    }

    firstClickRef.current = null;
    toggleItem(id);

    if (detail > 0) {
      const snapshot = useListStore.getState().history.at(-1);

      if (snapshot) {
        firstClickRef.current = { id, snapshot };
      } else {
        setInteractionError("Could not track the selection. Please try again.");
      }
    }
  }

  function handleTaskDoubleClick(id: number) {
    const firstClick = firstClickRef.current;
    firstClickRef.current = null;

    if (
      !firstClick ||
      firstClick.id !== id ||
      !completeAfterSelectionClick(id, firstClick.snapshot)
    ) {
      setInteractionError("Could not complete the task. Please try again.");
      return;
    }

    pendingFocusId.current = id;
    setPinnedId(id);
  }

  function handleCompleteClick(id: number) {
    setInteractionError(null);
    pendingFocusId.current = id;
    pendingFocusTarget.current = "complete";
    setPinnedId(id);
    completedItem(id);
  }

  return (
    <>
      {interactionError && <p role="alert">{interactionError}</p>}
      <ul
        id="list"
        ref={listRef}
        className={styles.list}
        aria-label="List of elements"
      >
        {visibleItems.map((item, index) => {
          const status = getTaskStatus(item, today);

          return (
            <li
              key={item.id}
              className={`${status === "Overdue" ? styles.overdue : ""}
          ${styles.item}
          ${item.selected ? styles.selected : ""}
          ${styles[`priority-${item.priority}`]}
          ${item.completed ? styles.completed : ""}
        `}
            >
              <input
                type="checkbox"
                className={styles.selectControl}
                aria-label={`Select ${item.text} for deletion`}
                checked={item.selected}
                onChange={() => toggleItem(item.id)}
              />
              <button
                type="button"
                className={styles.taskControl}
                data-task-control
                data-id={item.id}
                aria-pressed={item.selected}
                aria-label={`Select ${item.text}`}
                aria-describedby={`task-status-${item.id} task-category-${item.id}${item.dueDate ? ` task-date-${item.id}` : ""}`}
                onFocus={() => {
                  setFocusIndex(index);
                  if (pinnedId !== null && pinnedId !== item.id) {
                    setPinnedId(null);
                  }
                }}
                onClick={(event) => handleTaskClick(item.id, event.detail)}
                onDoubleClick={() => handleTaskDoubleClick(item.id)}
              >
                <span className={styles.itemContent}>
                  <span className={styles.itemText}>{item.text}</span>
                  <span className={styles.itemMeta}>
                    <span
                      id={`task-status-${item.id}`}
                      className={styles.taskStatus}
                    >
                      {status}
                    </span>
                    <span
                      id={`task-category-${item.id}`}
                      className={`${styles.badge} ${styles[`cat-${item.category}`]}`}
                    >
                      {item.category}
                    </span>
                    {item.dueDate && (
                      <span
                        id={`task-date-${item.id}`}
                        className={styles.dueDate}
                      >
                        {new Date(item.dueDate).toLocaleDateString(undefined, {
                          timeZone: "UTC",
                        })}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={styles.completeControl}
                data-complete-id={item.id}
                aria-label={`Complete ${item.text}`}
                aria-pressed={item.completed}
                onFocus={() => setFocusIndex(index)}
                onClick={() => handleCompleteClick(item.id)}
              >
                <span className={styles.itemIndicator} aria-hidden="true" />
              </button>
              <Button
                type="button"
                variant="secondary"
                aria-label={`Edit ${item.text}`}
                onClick={(event) => {
                  editTriggerRef.current = event.currentTarget;
                  setEditingItem(item);
                }}
              >
                Edit
              </Button>
            </li>
          );
        })}
      </ul>
      <output className={styles.srOnly}>
        Showing {visibleItems.length} of {orderedItems.length} tasks
      </output>
      {supportsIntersectionObserver && visibleCount < orderedItems.length && (
        <div
          ref={loadMoreRef}
          className={styles.loadSentinel}
          aria-hidden="true"
        />
      )}
      {editingItem && (
        <AddItemModal
          isOpen
          item={editingItem}
          triggerRef={editTriggerRef}
          onClose={() => {
            restoreEditFocus.current = true;
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
}
