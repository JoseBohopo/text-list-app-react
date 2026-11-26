import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

import { useListStore } from "../../store/useListStore";
import { validateInput } from "../../utils/validation";
import { Button } from "../ui/Button/Button";
import type {
  Item,
  Priority,
  Category,
} from "../../store/types/useListStore.types";

import styles from "./styles/AddItemModal.module.css";

interface Props {
  readonly item?: Item;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function AddItemModal({ item, isOpen, onClose, triggerRef }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const { addItem, updateItem } = useListStore();
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(
    item?.priority ?? "medium"
  );
  const [category, setCategory] = useState<Category>(
    item?.category ?? "personal"
  );
  const [dueDate, setDueDate] = useState<string>(
    item?.dueDate?.slice(0, 10) ?? ""
  );

  const handleCancel = useCallback(() => {
    setError(null);
    setPriority("medium");
    setCategory("personal");
    setDueDate("");
    modalRef.current?.close();
    onClose();
    triggerRef.current?.focus();
  }, [onClose, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const dialog = modalRef.current;
    if (!dialog) return;

    dialog.showModal();
    inputRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = inputRef.current?.value.trim() ?? "";
    const validationError = validateInput(value);

    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    if (item) {
      updateItem(item.id, {
        text: value,
        priority,
        category,
        dueDate: dueDate || undefined,
      });
    } else {
      addItem(value, priority, category, dueDate || undefined);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setPriority("medium");
    setCategory("personal");
    setDueDate("");
    modalRef.current?.close();
    onClose();
    triggerRef.current?.focus();
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;

    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      "input:not(:disabled), select:not(:disabled), button:not(:disabled)"
    );
    const first = controls[0];
    const last = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === modalRef.current) {
      handleCancel();
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={modalRef}
      className={`${styles.overlay} ${styles.overlayEnter}`}
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="modalDescription"
      onClick={handleOverlayClick}
      onKeyDown={handleDialogKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        handleCancel();
      }}
    >
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <div className={styles.modalIcon} aria-hidden="true">
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
            <path d="M16 3h5v5" />
            <path d="m10 14 11-11" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
        </div>

        <div className={styles.modalHeader}>
          <h2 id="modalTitle">{item ? "Edit item" : "Add a new item"}</h2>
          <p id="modalDescription">
            {item
              ? "Edit your item and keep everything organized."
              : "Add something new to your list and keep everything organized."}
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="modalInput">Item name</label>
          <input
            id="modalInput"
            ref={inputRef}
            type="text"
            placeholder="What would you like to add?"
            aria-invalid={!!error}
            aria-describedby={error ? "inputError" : "inputHelper"}
            defaultValue={item?.text ?? ""}
            onChange={() => setError(null)}
            required
            autoComplete="off"
          />

          {error ? (
            <p id="inputError" role="alert" className={styles.error}>
              {error}
            </p>
          ) : (
            <span id="inputHelper" className={styles.helperText}>
              Keep it short and descriptive.
            </span>
          )}
        </div>

        <div className={styles.selectGroup}>
          <div className={styles.select}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className={styles.select}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.select}>
            <label htmlFor="dueDate">Due date (optional)</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="secondary" type="button" onClick={handleCancel}>
            Cancel
          </Button>

          <Button type="submit">{item ? "Save changes" : "Add item"}</Button>
        </div>
      </form>
    </dialog>,
    document.body
  );
}
