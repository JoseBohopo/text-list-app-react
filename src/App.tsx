import { useLayoutEffect, useRef, useState } from "react";
import { AddItemModal } from "./components/AddItemModal/AddItemModal";
import { Button } from "./components/ui/Button/Button";

import { Toolbar } from "./components/Toolbar/Toolbar";
import { SearchFilter } from "./components/SearchFilter/SearchFilter";
import { ItemList } from "./components/ItemList/ItemList";
import styles from "./App.module.css";

export default function App() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const addTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreAddFocus = useRef(false);

  function openAdd(trigger: HTMLButtonElement) {
    addTriggerRef.current = trigger;
    setIsAddOpen(true);
  }

  useLayoutEffect(() => {
    if (isAddOpen || !restoreAddFocus.current) return;

    restoreAddFocus.current = false;
    const target = addTriggerRef.current?.isConnected
      ? addTriggerRef.current
      : addButtonRef.current;
    target?.focus();
  }, [isAddOpen]);
  return (
    <main className={styles.app}>
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => {
          restoreAddFocus.current = true;
          setIsAddOpen(false);
        }}
        triggerRef={addTriggerRef}
      />
      <section className={styles.container} aria-labelledby="main-title">
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 id="main-title">Stay Organized</h1>
            <p id="main-desc">
              Capture your ideas and tasks in one place. Simple, fast, and
              distraction-free.
            </p>
          </div>
          <Button
            ref={addButtonRef}
            id="addBtn"
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => openAdd(event.currentTarget)}
          >
            Add item
          </Button>
        </header>
        <SearchFilter />
        <ItemList onAddItem={openAdd} />
        <Toolbar />
        <div id="status" className="sr-only" aria-live="polite" />
      </section>
    </main>
  );
}
