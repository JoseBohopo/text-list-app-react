
import { useRef, useEffect } from "react";

import { useListStore } from "../../store/useListStore";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { EmptyState } from "../EmptyState/EmptyState";

import styles from "./styles/ItemList.module.css";

export function ItemList() {
  const {
    items,
    focusedIndex,
    toggleItem,
    removeItem,
  } = useListStore();

  const listRef = useRef<HTMLUListElement>(null);

  useKeyboardNavigation(listRef);

  useEffect(() => {
    const listItems = listRef.current?.querySelectorAll("li");

    if (listItems?.[focusedIndex]) {
      (listItems[focusedIndex] as HTMLElement).focus();
    }
  }, [focusedIndex]);

    if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul
      id="list"
      ref={listRef}
      className={styles.list}
      role="listbox"
      aria-label="List of elements"
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={item.selected}
          tabIndex={index === focusedIndex ? 0 : -1}
          data-id={item.id}
          className={`
            ${styles.item}
            ${item.selected ? styles.selected : ""}
          `}
          onClick={() => toggleItem(item.id)}
          onDoubleClick={() => removeItem(item.id)}
        >
          <span className={styles.itemText}>
            {item.text}
          </span>

          <span
            className={styles.itemIndicator}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}
