# Accessible List Manager

## Deploy [Text List app](https://text-list-app.netlify.app/)

A accessible list manager built with React, TypeScript, and Zustand. Allows users to manage a list of text items with full keyboard navigation, undo history, and accessible UI patterns.

![Task list with priorities, categories and filters](<./public/Screenshot 2026-11-26 140222.png>)

### Empty state

![Empty task list in light mode](<./public/Screenshot 2026-11-26 135841.png>)

### Add task

![Add task dialog in dark mode](<./public/Screenshot 2026-11-26 135858.png>)

## Features

- **Add items** via a modal dialog — empty entries are rejected with inline validation
- **Select items** by clicking — multiple selections supported
- **Delete selected items** via the Delete button
- **Double-click to delete** a single item directly without selecting it first
- **Undo** any action (add, select, deselect, delete) with full history support
- **Keyboard navigation** — Arrow keys, Home, End, Enter, Space, all supported
- **Accessible** — ARIA roles, roving tabindex, focus management, live regions
- **Portal-based modal** — rendered at the document body level to avoid stacking context issues
- **Complete tasks** by clicking them; completed tasks remain visible by default
- **Organize tasks** by priority, category, and due date
- **Search and filter** by text, category, priority, and completion status
- **Persist tasks and filters** in browser local storage

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://zustand-demo.pmnd.rs/) — state management with devtools support
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Vitest](https://vitest.dev/) — unit and component testing
- [Testing Library](https://testing-library.com/) — component testing utilities
- CSS Modules — scoped styles

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── store/
│   ├── useListStore.ts          # Zustand store — all state and actions
│   └── types/
│       └── useListStore.types.ts
├── components/
│   ├── ui/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       └── Button.module.css
│   ├── ItemList/
│   │   ├── ItemList.tsx
│   │   ├── ItemList.module.css
│   │   └── ItemList.test.tsx
│   ├── AddItemModal/
│   │   ├── AddItemModal.tsx
│   │   ├── AddItemModal.module.css
│   │   └── AddItemModal.test.tsx
│   └── Toolbar/
│       ├── Toolbar.tsx
│       ├── Toolbar.module.css
│       └── Toolbar.test.tsx
├── hooks/
│   └── useKeyboardNavigation.ts
├── utils/
│   └── validation.ts
└── tests/
    └── setup.ts
```

## Getting Started

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- npm 9+

### Installation

```bash
git clone https://github.com/JoseBohopo/text-list-app-react.git
cd text-list-app-react
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`.

### Testing

```bash
npm test           # watch mode
npm run test:run   # single run (CI)
npm run test:ui    # visual UI
```

### Formatting

The `format` script formats project files using Prettier.

### Build

```bash
npm run build
```

### Continuous integration

GitHub Actions runs linting, tests and a production build on every push and pull request.

## State Management

All application state lives in a single Zustand store:

| State          | Type         | Description                       |
| -------------- | ------------ | --------------------------------- |
| `items`        | `Item[]`     | The list of text entries          |
| `focusedIndex` | `number`     | Which item has keyboard focus     |
| `history`      | `Snapshot[]` | Stack of previous states for undo |

Every action that mutates the list (`addItem`, `toggleItem`, `removeSelected`, `removeItem`) saves a snapshot to `history` before applying the change, enabling unlimited undo.

## Keyboard Shortcuts

| Key               | Action                                                        |
| ----------------- | ------------------------------------------------------------- |
| `Arrow Down`      | Move focus to next item                                       |
| `Arrow Up`        | Move focus to previous item                                   |
| `Home`            | Move focus to first item                                      |
| `End`             | Move focus to last item                                       |
| `Enter` / `Space` | Select and complete, or deselect and reopen, the focused item |

## Accessibility

- List uses `role="listbox"` with `role="option"` on each item
- Roving `tabindex` pattern for list navigation
- Modal uses `role="dialog"` with `aria-modal="true"`
- Input uses `aria-invalid` when validation fails
- Error messages use `role="alert"` for screen reader announcements
- Focus is returned to the trigger button when the modal closes
