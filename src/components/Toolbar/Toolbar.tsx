import { useEffect, useRef, useState } from "react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

import { useListStore } from "../../store/useListStore";
import { useTheme } from "../../hooks/useTheme";
import { useFilterItems } from "../../hooks/useFilterItems";
import { Button } from "../ui/Button/Button";

import styles from "./styles/Toolbar.module.css";
import { FilterControls } from "../SearchFilter/SearchFilter";

export function Toolbar() {
  const {
    items,
    filters,
    getSelectedItem,
    removeSelected,
    undo,
    saveToHistory,
    history,
  } = useListStore();

  const { theme, toggle } = useTheme();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  const restoreDeleteFocus = useRef(false);

  useEffect(() => {
    if (isDeleteModalOpen || !restoreDeleteFocus.current) return;

    restoreDeleteFocus.current = false;
    if (deleteBtnRef.current && !deleteBtnRef.current.disabled) {
      deleteBtnRef.current.focus();
    } else {
      document.getElementById("addBtn")?.focus();
    }
  }, [isDeleteModalOpen]);

  const visibleItems = useFilterItems(items, filters);
  const activeFilterCount =
    Number(Boolean(filters.categoryFilter)) +
    Number(Boolean(filters.priorityFilter));
  const hiddenSelectedCount =
    items.filter((item) => item.selected).length -
    visibleItems.filter((item) => item.selected).length;

  function handleDelete() {
    if (!getSelectedItem()) return;

    if (hiddenSelectedCount > 0) {
      setIsDeleteModalOpen(true);
      return;
    }

    saveToHistory();
    removeSelected();
  }

  function closeDeleteModal() {
    restoreDeleteFocus.current = true;
    setIsDeleteModalOpen(false);
  }

  function confirmDelete() {
    saveToHistory();
    removeSelected();
    closeDeleteModal();
  }

  return (
    <>
      <article className={styles.actions} aria-label="List actions">
        <div className={styles.leftGroup}>
          <Button
            name="theme"
            variant="secondary"
            circle
            onClick={toggle}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`${theme === "light" ? "Dark" : "Light"} mode`}
            type="button"
          >
            {theme === "light" ? (
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="21"
                  x2="12"
                  y2="23"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="4.22"
                  y1="4.22"
                  x2="5.64"
                  y2="5.64"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="18.36"
                  y1="18.36"
                  x2="19.78"
                  y2="19.78"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="1"
                  y1="12"
                  x2="3"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="23"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="4.22"
                  y1="19.78"
                  x2="5.64"
                  y2="18.36"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="18.36"
                  y1="5.64"
                  x2="19.78"
                  y2="4.22"
                  stroke="currentColor"
                  strokeWidth="2"
                />
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
            ref={deleteBtnRef}
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
          <div
            className={styles.filters}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || !isFiltersOpen) return;
              event.preventDefault();
              setIsFiltersOpen(false);
              filterButtonRef.current?.focus();
            }}
          >
            <Button
              ref={filterButtonRef}
              className={styles.filterButton}
              type="button"
              variant="secondary"
              circle
              aria-label="Filters"
              aria-expanded={isFiltersOpen}
              aria-describedby="active-filter-count"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
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
                <path d="M4 7h16M7 12h10M10 17h4" />
              </svg>
              {activeFilterCount > 0 && (
                <span className={styles.filterCount} aria-hidden="true">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <span id="active-filter-count" className="sr-only">
              {activeFilterCount} active filters
            </span>

            {isFiltersOpen && (
              <div
                className={styles.filterPanel}
                role="group"
                aria-label="Filters"
              >
                <FilterControls />
              </div>
            )}
          </div>
        </div>
      </article>
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          selectedCount={items.filter((item) => item.selected).length}
          hiddenCount={hiddenSelectedCount}
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
