# Accessible List Manager

## Deploy [Text List app](https://text-list-app.netlify.app/)

A accessible list manager built with React, TypeScript, and Zustand. Allows users to manage a list of text items with full keyboard navigation, undo history, and accessible UI patterns.

## Features

- **Add items** via a modal dialog — empty entries are rejected with inline validation
- **Select items** by clicking — multiple selections supported
- **Delete selected items** via the Delete button
- **Double-click to delete** a single item directly without selecting it first
- **Undo** any action (add, select, deselect, delete) with full history support
- **Keyboard navigation** — Arrow keys, Home, End, Enter, Space, all supported
- **Accessible** — ARIA roles, roving tabindex, focus management, live regions
- **Portal-based modal** — rendered at the document body level to avoid stacking context issues

## Tech Stack

- [React 18](https://react.dev/)
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

- Node.js 18+
- npm 9+

### Installation
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
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

### Build
```bash
npm run build
```

## State Management

All application state lives in a single Zustand store:

| State | Type | Description |
|---|---|---|
| `items` | `Item[]` | The list of text entries |
| `focusedIndex` | `number` | Which item has keyboard focus |
| `history` | `Snapshot[]` | Stack of previous states for undo |

Every action that mutates the list (`addItem`, `toggleItem`, `removeSelected`, `removeItem`) saves a snapshot to `history` before applying the change, enabling unlimited undo.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Arrow Down` | Move focus to next item |
| `Arrow Up` | Move focus to previous item |
| `Home` | Move focus to first item |
| `End` | Move focus to last item |
| `Enter` / `Space` | Select or deselect focused item |

## Accessibility

- List uses `role="listbox"` with `role="option"` on each item
- Roving `tabindex` pattern for list navigation
- Modal uses `role="dialog"` with `aria-modal="true"`
- Input uses `aria-invalid` when validation fails
- Error messages use `role="alert"` for screen reader announcements
- Focus is returned to the trigger button when the modal closes
