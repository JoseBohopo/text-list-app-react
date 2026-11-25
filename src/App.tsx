import { Toolbar } from "./components/Toolbar/Toolbar";
import { ItemList } from "./components/ItemList/ItemList";
import styles from "./App.module.css";

export default function App() {
  return (
    <main className={styles.app}>
      <section className={styles.container} aria-labelledby="main-title">
        <h1 id="main-title">Stay Organized</h1>
        <p id="main-desc">
          Capture your ideas and tasks in one place. Simple, fast, and distraction-free.
        </p>
        <ItemList />
        <Toolbar />
        <div id="status" className="sr-only" aria-live="polite" />
      </section>
    </main>
  );
}