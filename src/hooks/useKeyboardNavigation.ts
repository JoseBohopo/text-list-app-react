import { useEffect } from "react";
import { useListStore } from "../store/useListStore";

export function useKeyboardNavigation(
  listRef: React.RefObject<HTMLUListElement | null>,
  itemCount: number,
  onLoadMore?: () => void
) {
  const { setFocusIndex } = useListStore();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function handleKeyDown(event: KeyboardEvent) {
      const options = Array.from(
        list!.querySelectorAll<HTMLElement>("[data-task-control]")
      );
      const index = options.indexOf(document.activeElement as HTMLElement);
      if (index < 0) return;

      if (
        event.key === "ArrowDown" &&
        index === options.length - 1 &&
        onLoadMore
      ) {
        event.preventDefault();
        onLoadMore();
        return;
      }

      const positions: Record<string, number> = {
        ArrowDown: Math.min(index + 1, options.length - 1),
        ArrowUp: Math.max(index - 1, 0),
        Home: 0,
        End: options.length - 1,
      };

      const nextIndex = positions[event.key];
      if (nextIndex === undefined) return;

      event.preventDefault();
      options[nextIndex].focus();
      setFocusIndex(nextIndex);
    }

    list.addEventListener("keydown", handleKeyDown);
    return () => list.removeEventListener("keydown", handleKeyDown);
  }, [listRef, itemCount, setFocusIndex, onLoadMore]);
}
