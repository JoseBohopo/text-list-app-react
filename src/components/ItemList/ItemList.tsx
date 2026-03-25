import { useRef, useEffect } from 'react'
import { useListStore } from '../../store/useListStore'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import styles from './styles/ItemList.module.css'

export function ItemList() {
  const { items, focusedIndex, toggleItem, removeItem } = useListStore()
  const listRef = useRef<HTMLUListElement>(null)
  useKeyboardNavigation(listRef)

  useEffect(() => {
    const lis = listRef.current?.querySelectorAll('li')
    if (lis?.[focusedIndex]) {
      (lis[focusedIndex] as HTMLElement).focus()
    }
  }, [focusedIndex])

  return (
    <ul
      id="list"
      ref={listRef}
      className={styles.list}
      role="listbox"
      aria-label="List of elements"
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={item.selected}
          tabIndex={index === focusedIndex ? 0 : -1}
          data-id={item.id}
          className={`${styles.item} ${item.selected ? styles.selected : ''}`}
          onClick={() => toggleItem(item.id)}
          onDoubleClick={() => removeItem(item.id)}
        >
          {item.text}
        </li>
      ))}
    </ul>
  )
}