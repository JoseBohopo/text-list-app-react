
import { useRef, useState } from "react";

import { useListStore } from "../../store/useListStore";
import { useTheme } from "../../hooks/useTheme";
import { AddItemModal } from "../AddItemModal/AddItemModal";
import { Button } from "../ui/Button/Button";

import styles from "./styles/Toolbar.module.css";

export function Toolbar() {
  const {
    getSelectedItem,
    removeSelected,
    undo,
    saveToHistory,
    history,
  } = useListStore();

  const { theme, toggle } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  function handleDelete() {
    if (!getSelectedItem()) return;
    saveToHistory();
    removeSelected();
  }

  return (
    <>
      <article
        className={styles.actions}
        aria-label="List actions"
      >
        <div className={styles.leftGroup}>
           <Button
            name="theme"
            variant="secondary"
            circle
            onClick={toggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`${theme === 'light' ? 'Dark' : 'Light'} mode`}
            type="button"
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </Button>
          <Button
            name="undo"
            variant="secondary"
            circle
            id="undoBtn"
            onClick={undo}
            disabled={!history.length}
            aria-label="Undo last action"
            title="Undo"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7v6h6" />
              <path d="M3.5 13a9 9 0 1 0 2.6-6.4L3 10" />
            </svg>
          </Button>

          <Button
            name="delete"
            variant="secondary"
            id="deleteBtn"
            onClick={handleDelete}
            disabled={!getSelectedItem()}
            aria-label="Delete selected item"
            title="Delete selected item"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="m19 6-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>

            Delete
          </Button>
        </div>

        <Button
          ref={addBtnRef}
          id="addBtn"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Add item
        </Button>
      </article>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        triggerRef={addBtnRef}
      />
    </>
  );
}
