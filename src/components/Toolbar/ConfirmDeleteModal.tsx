import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/Button/Button";
import styles from "./styles/ConfirmDeleteModal.module.css";

interface Props {
  selectedCount: number;
  hiddenCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  selectedCount,
  hiddenCount,
  onCancel,
  onConfirm,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    cancelRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="confirm-delete-title">Delete selected tasks?</h2>
      <p id="confirm-delete-description">
        You are about to delete {selectedCount} selected task(s), including{" "}
        {hiddenCount} hidden by filters.
      </p>
      <div className={styles.actions}>
        <Button ref={cancelRef} type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className={styles.danger} onClick={onConfirm}>
          Delete tasks
        </Button>
      </div>
    </dialog>,
    document.body
  );
}
