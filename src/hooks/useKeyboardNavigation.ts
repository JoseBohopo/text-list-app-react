import { useEffect } from "react";
import { useListStore } from "../store/useListStore";

export function useKeyboardNavigation(
  listRef: React.RefObject<HTMLUListElement | null>,
) {
  const { items, focusedIndex, setFocusIndex, toggleItem, saveToHistory } =
    useListStore();

  useEffect(() => {
    const el = listRef?.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (!items.length) return;

      const actions: Record<string, () => void> = {
        ArrowDown: () => setFocusIndex(focusedIndex + 1),
        ArrowUp: () => setFocusIndex(focusedIndex - 1),
        Home: () => setFocusIndex(0),
        End: () => setFocusIndex(items.length - 1),
        Enter: () => toggleItem(items[focusedIndex].id),
        " ": () => toggleItem(items[focusedIndex].id),
      };

      if (actions[e.key]) {
        e.preventDefault();
        saveToHistory();
        actions[e.key]();
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [items, focusedIndex, setFocusIndex, toggleItem, saveToHistory, listRef]);
}
