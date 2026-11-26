import { useListStore } from '../../store/useListStore';
import type { Category, Priority } from '../../store/types/useListStore.types';
import styles from './styles/SearchFilter.module.css';

export function SearchFilter() {
  const { filters, setFilters } = useListStore();

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search tasks..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className={styles.searchInput}
        aria-label="Search tasks"
      />

      <div className={styles.filterGroup}>
        <select
          value={filters.categoryFilter || ''}
          onChange={(e) =>
            setFilters({ categoryFilter: e.target.value ? (e.target.value as Category) : undefined })
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
          value={filters.priorityFilter || ''}
          onChange={(e) =>
            setFilters({ priorityFilter: e.target.value ? (e.target.value as Priority) : undefined })
          }
          className={styles.select}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.showCompleted}
            onChange={(e) => setFilters({ showCompleted: e.target.checked })}
            aria-label="Show completed tasks"
          />
          Show completed
        </label>
      </div>
    </div>
  );
}