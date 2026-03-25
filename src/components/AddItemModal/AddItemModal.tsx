import { useRef, useEffect, useState } from "react";
import { createPortal } from 'react-dom'
import { useListStore } from "../../store/useListStore";
import { validateInput } from "../../utils/validation";
import { Button } from "../ui/Button/Button";
import styles from "./styles/AddItemModal.module.css";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function AddItemModal({ isOpen, onClose, triggerRef }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useListStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOpen) {
      timeoutId = setTimeout(() => inputRef.current?.focus(), 50);
    }

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const value = inputRef.current?.value.trim() ?? "";
    const validationError = validateInput(value);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    addItem(value);

    if (inputRef.current) inputRef.current.value = "";

    onClose();
    triggerRef.current?.focus();
  }

  function handleCancel() {
    setError(null);
    onClose();
    triggerRef.current?.focus();
  }

  if (!isOpen) return null;

  return createPortal(
    <dialog
      className={`${styles.overlay} ${styles.overlayEnter}`}
      aria-modal="true"
      aria-labelledby="modalTitle"
      open
    >
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <h2 id="modalTitle">Add item to the list</h2>

        <label htmlFor="modalInput">New item text</label>

        <input
          id="modalInput"
          ref={inputRef}
          type="text"
          placeholder="New item..."
          aria-invalid={!!error}
          aria-describedby={error ? "inputError" : undefined}
          onChange={() => setError(null)}
          required
          autoComplete="off"
        />

        {error && (
          <p id="inputError" role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.modalActions}>
          <Button type="submit">Add</Button>

          <Button variant="secondary" type="button" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </dialog>, document.body
  );
}
