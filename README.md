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
- **Select items** using their checkboxes or task buttons — multiple selections supported
- **Double-click a task** to complete or reopen it without changing its selection
- **Complete tasks** using the circle button; completed tasks remain visible by default
- **Delete selected items** via the Delete button
- **Undo** up to 20 recent actions, including adding, selecting, editing, completing, and deleting tasks- **Keyboard navigation** — Arrow keys, Home, End, Enter, Space, all supported
- **Accessible** — ARIA roles, Keyboard navigation with Tab and arrow keys, focus management, live regions
- **Portal-based modal** — rendered at the document body level to avoid stacking context issues
- **Organize tasks** by priority, category, and due date
- **Search and filter** by text, category, priority, and completion status. The filter panel closes when clicking outside or pressing Escape.
- **Persist tasks and filters** in browser local storage
- **Edit items** — change their text, priority, category, or due date
- **Task status** — pending, completed, or overdue based on the local date
- **Automatic loading** — tasks appear in batches of 20 while scrolling. If IntersectionObserver is unavailable, all tasks are shown.

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

The list and its filters use a Zustand store. A separate, non-persisted store tracks storage errors:

| State          | Type         | Description                       |
| -------------- | ------------ | --------------------------------- |
| `items`        | `Item[]`     | The list of text entries          |
| `focusedIndex` | `number`     | Which item has keyboard focus     |
| `history`      | `Snapshot[]` | Stack of previous states for undo |

List changes save snapshots for undo. The 20 most recent snapshots are kept, including after a reload. Older saved histories are trimmed in memory and saved on the next successful write.

Saved data is validated before loading. If it is invalid or uses an unsupported version, the app warns the user and disables saving for that session to avoid overwriting it.

If saving fails, changes remain in memory and the app shows a warning. A later successful save includes those changes. Copy any unsaved tasks before refreshing or closing the page.

## Keyboard Shortcuts

| Key                       | Action                                                       |
| ------------------------- | ------------------------------------------------------------ |
| `Arrow Down` / `Arrow Up` | Move between task buttons; Arrow Down loads more when needed |
| `Home` / `End`            | Move to the first or last task button                        |
| `Enter` / `Space`         | Select or deselect with the task button                      |
| `Enter` / `Space`         | Complete or reopen with the circle button                    |
| `Space`                   | Select or deselect the focused checkbox                      |
| `Tab`                     | Move between controls                                        |

## Accessibility

- Tasks use a semantic list with separate buttons for task actions and editing
- Keyboard navigation with Tab and arrow keys
- Modal uses `role="dialog"` with `aria-modal="true"`
- Input uses `aria-invalid` when validation fails
- Error messages use `role="alert"` for screen reader announcements
- Focus is returned to the trigger button when the modal closes
