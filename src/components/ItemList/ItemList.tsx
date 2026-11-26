import { useRef, useState, useLayoutEffect, useEffect } from "react";

import type { Item } from "../../store/types/useListStore.types";
import { AddItemModal } from "../AddItemModal/AddItemModal";
import { Button } from "../ui/Button/Button";

import { useListStore } from "../../store/useListStore";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useWorkflowOrdering } from "../../hooks/useworkflowOrdering";
import { useFilterItems } from "../../hooks/useFilterItems";

import { EmptyState } from "../EmptyState/EmptyState";

import styles from "./styles/ItemList.module.css";

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

export function ItemList() {
  const {
    items,
    filters,
    focusedIndex,
    setFocusIndex,
    toggleItem,
    completedItem,
    removeItem,
  } = useListStore();

  const filteredItems = useFilterItems(items, filters);
  const orderedItems = useWorkflowOrdering(filteredItems);
  const activeIndex = Math.min(
    Math.max(focusedIndex, 0),
    orderedItems.length - 1
  );

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [today, setToday] = useState(getToday);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const noResultsRef = useRef<HTMLOutputElement>(null);
  const restoreEditFocus = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusId = useRef<number | null>(null);

  useKeyboardNavigation(listRef, orderedItems.length);

  useLayoutEffect(() => {
    const id = pendingFocusId.current;
    if (id === null) return;
    pendingFocusId.current = null;

    const index = orderedItems.findIndex((item) => item.id === id);

    if (index < 0) {
      if (orderedItems.length === 0) {
        noResultsRef.current?.focus();
      } else {
        const nextItem = orderedItems[activeIndex];
        listRef.current
          ?.querySelector<HTMLButtonElement>(`[data-id="${nextItem.id}"]`)
          ?.focus();
        setFocusIndex(activeIndex);
      }
      return;
    }

    listRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus();
    setFocusIndex(index);
  }, [orderedItems, setFocusIndex, activeIndex]);

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

  if (items.length === 0) {
    return <EmptyState />;
  }

  if (orderedItems.length === 0) {
    return (
      <output ref={noResultsRef} tabIndex={-1}>
        No tasks match the current filters.
      </output>
    );
  }

  return (
    <>
      <ul
        id="list"
        ref={listRef}
        className={styles.list}
        aria-label="List of elements"
      >
        {orderedItems.map((item, index) => {
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
                aria-pressed={item.completed}
                aria-label={`Complete ${item.text}`}
                aria-describedby={`task-status-${item.id} task-category-${item.id}${item.dueDate ? ` task-date-${item.id}` : ""}`}
                onFocus={() => setFocusIndex(index)}
                onClick={() => {
                  pendingFocusId.current = item.id;
                  completedItem(item.id);
                }}
                onDoubleClick={() => removeItem(item.id)}
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
