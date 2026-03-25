import { Toolbar } from "./components/Toolbar/Toolbar";
import { ItemList } from "./components/ItemList/ItemList";
import styles from "./App.module.css";

export default function App() {
  return (
    <main className={styles.app}>
      <section className={styles.container} aria-labelledby="main-title">
        <h1 id="main-title">This is a technical proof</h1>
        <p id="main-desc">
          Lorem ipsum dolor sit amet consectetur adipiscing, elit mus primis nec
          inceptos. Lacinia habitasse arcu molestie maecenas cursus quam nunc.
        </p>
        <ItemList />
        <Toolbar />
        <div id="status" className="sr-only" aria-live="polite" />
      </section>
    </main>
  );
}
