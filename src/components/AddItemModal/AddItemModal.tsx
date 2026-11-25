
import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

import { useListStore } from "../../store/useListStore";
import { validateInput } from "../../utils/validation";
import { Button } from "../ui/Button/Button";

import styles from "./styles/AddItemModal.module.css";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function AddItemModal({
  isOpen,
  onClose,
  triggerRef,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const { addItem } = useListStore();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = useCallback(() => {
    setError(null);
    onClose();
    triggerRef.current?.focus();
  }, [onClose, triggerRef])

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleCancel();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleCancel]);

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
    addItem(value);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onClose();
    triggerRef.current?.focus();
  }



  function handleOverlayClick(
    e: React.MouseEvent<HTMLDialogElement>
  ) {
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
      open
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
          <h2 id="modalTitle">Add a new item</h2>

          <p id="modalDescription">
            Add something new to your list and
            keep everything organized.
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="modalInput">
            Item name
          </label>

          <input
            id="modalInput"
            ref={inputRef}
            type="text"
            placeholder="What would you like to add?"
            aria-invalid={!!error}
            aria-describedby={
              error ? "inputError" : "inputHelper"
            }
            onChange={() => setError(null)}
            required
            autoComplete="off"
          />

          {error ? (
            <p
              id="inputError"
              role="alert"
              className={styles.error}
            >
              {error}
            </p>
          ) : (
            <span
              id="inputHelper"
              className={styles.helperText}
            >
              Keep it short and descriptive.
            </span>
          )}
        </div>

        <div className={styles.modalActions}>
          <Button
            variant="secondary"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button type="submit">
            Add item
          </Button>
        </div>
      </form>
    </dialog>,
    document.body
  );
}
