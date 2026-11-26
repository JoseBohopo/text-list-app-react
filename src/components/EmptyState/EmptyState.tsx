import styles from "./styles/EmptyState.module.css";

import { Button } from "../ui/Button/Button";

interface Props {
  readonly onAddItem: (trigger: HTMLButtonElement) => void;
}

export function EmptyState({ onAddItem }: Props) {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
      <h2>No items yet</h2>
      <p>Start by adding your first item to get organized</p>
      <Button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => onAddItem(event.currentTarget)}
      >
        Add your first item
      </Button>
    </div>
  );
}
