import { useRef, useState } from "react";
import { useListStore } from "../../store/useListStore";
import { AddItemModal } from "../AddItemModal/AddItemModal";
import { Button } from "../ui/Button/Button";
import styles from "./styles/Toolbar.module.css";

export function Toolbar() {
  const { getSelectedItem, removeSelected, undo, saveToHistory, history } =
    useListStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  function handleDelete() {
    saveToHistory();
    removeSelected();
  }

  return (
    <>
      <article className={styles.actions}>
        <div className={styles.leftGroup}>
          <Button
            name="undo"
            variant="secondary"
            circle
            id="undoBtn"
            onClick={undo}
            disabled={!history.length}
            aria-label="Undo"
            type="button"
          >
            <span aria-hidden="true">↺</span>
          </Button>
          <Button
            name="delete"
            variant="secondary"
            id="deleteBtn"
            onClick={handleDelete}
            disabled={!getSelectedItem()}
            aria-label="Delete selected item"
            type="button"
          >
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
          Add
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
