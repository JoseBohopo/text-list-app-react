import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button/Button";

import { useListStore } from "../../store/useListStore";
import type { Category, Priority } from "../../store/types/useListStore.types";
import styles from "./styles/SearchFilter.module.css";

export function SearchFilter() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters } = useListStore();

  const activeFilterCount =
    Number(Boolean(filters.categoryFilter)) +
    Number(Boolean(filters.priorityFilter));

  useEffect(() => {
    if (!isFiltersOpen) return;

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !filterContainerRef.current?.contains(event.target)
      ) {
        setIsFiltersOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isFiltersOpen]);

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className={styles.searchInput}
          aria-label="Search tasks"
        />
        <div
          ref={filterContainerRef}
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
    </div>
  );
}

export function FilterControls() {
  const { items, filters, setFilters } = useListStore();

  return (
    <>
      <select
        disabled={items.length === 0}
        value={filters.categoryFilter || ""}
        onChange={(e) =>
          setFilters({
            categoryFilter: e.target.value
              ? (e.target.value as Category)
              : undefined,
          })
        }
        className={styles.select}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="shopping">Shopping</option>
        <option value="health">Health</option>
        <option value="other">Other</option>
      </select>

      <select
        disabled={items.length === 0}
        value={filters.priorityFilter || ""}
        onChange={(e) =>
          setFilters({
            priorityFilter: e.target.value
              ? (e.target.value as Priority)
              : undefined,
          })
        }
        className={styles.select}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <label
        className={`${styles.switchLabel} ${items.length === 0 ? styles.disabled : ""}`}
      >
        <input
          disabled={items.length === 0}
          className={styles.switchInput}
          type="checkbox"
          role="switch"
          checked={filters.showCompleted}
          onChange={(e) => setFilters({ showCompleted: e.target.checked })}
          aria-label="Show completed tasks"
        />
        <span className={styles.switchTrack} aria-hidden="true" />
        Show completed
      </label>
    </>
  );
}
