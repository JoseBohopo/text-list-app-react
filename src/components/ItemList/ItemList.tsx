import { useRef, useLayoutEffect } from "react";

import { useListStore } from "../../store/useListStore";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useWorkflowOrdering } from "../../hooks/useworkflowOrdering";
import { useFilterItems } from "../../hooks/useFilterItems";

import { EmptyState } from "../EmptyState/EmptyState";

import styles from "./styles/ItemList.module.css";

export function ItemList() {
  const {
    items,
    filters,
    focusedIndex,
    setFocusIndex,
    toggleItemState,
    removeItem,
  } = useListStore();

  const filteredItems = useFilterItems(items, filters);
  const orderedItems = useWorkflowOrdering(filteredItems);
  const activeIndex = Math.min(
    Math.max(focusedIndex, 0),
    orderedItems.length - 1
  );
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocusId = useRef<number | null>(null);

  useKeyboardNavigation(listRef, orderedItems.length);

  useLayoutEffect(() => {
    const id = pendingFocusId.current;
    if (id === null) return;
    pendingFocusId.current = null;

    const index = orderedItems.findIndex((item) => item.id === id);
    if (index < 0) return;

    listRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus();
    setFocusIndex(index);
  }, [orderedItems, setFocusIndex]);

  if (items.length === 0) {
    return <EmptyState />;
  }

  if (orderedItems.length === 0) {
    return <p role="status">No tasks match the current filters.</p>;
  }

  return (
    <ul
      id="list"
      ref={listRef}
      className={styles.list}
      role="listbox"
      aria-label="List of elements"
    >
      {orderedItems.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={item.selected}
          tabIndex={index === activeIndex ? 0 : -1}
          data-id={item.id}
          className={`
            ${styles.item}
            ${item.selected ? styles.selected : ""}
            ${styles[`priority-${item.priority}`]}
            ${item.completed ? styles.completed : ""}
          `}
          onFocus={() => setFocusIndex(index)}
          onClick={() => {
            pendingFocusId.current = item.id;
            toggleItemState(item.id);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;

            e.preventDefault();
            e.stopPropagation();
            pendingFocusId.current = item.id;
            toggleItemState(item.id);
          }}
          onDoubleClick={() => removeItem(item.id)}
        >
          <span className={styles.itemIndicator} aria-hidden="true" />

          <div className={styles.itemContent}>
            <span className={styles.itemText}>{item.text}</span>
            <div className={styles.itemMeta}>
              <span
                className={`${styles.badge} ${styles[`cat-${item.category}`]}`}
              >
                {item.category}
              </span>
              {item.dueDate && (
                <span className={styles.dueDate}>
                  {new Date(item.dueDate).toLocaleDateString(undefined, {
                    timeZone: "UTC",
                  })}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
