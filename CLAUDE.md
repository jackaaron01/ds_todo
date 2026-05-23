# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript type check (not in package.json scripts)
```

## Architecture

Next.js 16 App Router application — a full-featured todo list with subtasks, priorities, due dates, drag-and-drop, dark mode, undo, and import/export. All state is client-side via React hooks; data persists to `localStorage` under key `todosV2`.

### Rendering & state flow

- `app/page.tsx` is the sole `"use client"` page. It owns all state via three custom hooks and passes callbacks + data down to components as props.
- `app/layout.tsx` is a server component that injects an inline `<script>` to apply the saved theme before paint (prevents FOUC).
- The `!mounted` guard in `page.tsx` renders a Tailwind skeleton while waiting for client hydration; this prevents localStorage/server mismatches.

### Custom hooks (`src/hooks/`)

| Hook | Responsibility |
|------|---------------|
| `useTodos` | CRUD on `Todo[]`, localStorage persistence, sorting via `sortUtils.ts` |
| `useTheme` | Reads/writes `localStorage.theme`, applies `data-theme` attribute on `<html>`, respects `prefers-color-scheme` |
| `useUndo` | Manages a single-item undo stack with a 4-second auto-dismiss timeout |

### Component tree

```
page.tsx
├── Header            ← title + theme toggle (framer-motion fade-in)
├── TodoInput         ← text input, date picker, priority buttons
├── Toolbar           ← search, filter tabs, sort dropdown, export/import, clear completed
├── ProgressBar       ← animated progress bar (pulse on change, green on 100%)
├── TodoList          ← AnimatePresence wrapper + empty state
│   └── TodoItem      ← drag handle, checkbox, inline edit (double-click), meta badges,
│   |                    pin/expand/delete buttons, ripple effect
│   └── SubtaskSection ← subtask list + add-subtask input + note textarea
├── Toast             ← framer-motion spring-animated undo toast
└── Confetti          ← 60-particle celebration on all-done
```

### Data model (`src/types/index.ts`)

```ts
interface SubTask { id: number; text: string; done: boolean }
interface Todo {
  id: number; text: string; done: boolean;
  priority: "" | "high" | "medium" | "low";
  dueDate: string; order: number;
  pinned: boolean; note: string;
  subtasks: SubTask[];
}
type SortMode = "manual" | "priority" | "date";
type FilterMode = "all" | "active" | "completed";
```

### Theme system

CSS custom properties defined on `:root` and `[data-theme="dark"]` in `globals.css`. Components reference colors as `bg-[var(--surface)]`, `text-[var(--text-secondary)]`, etc. Tailwind v4's `light-dark()` function is not used — theme switching is entirely attribute-based via `useTheme.ts`.

### Styling

Tailwind CSS v4 (`@import "tailwindcss"` in globals.css) — no `tailwind.config.ts` file. Custom keyframes (`shakeX`, `popIn`, `menuIn`, `confettiFall`, `ripple`) are defined as raw CSS `@keyframes` and referenced via arbitrary animation classes like `animate-[ripple_0.6s_ease-out_forwards]`.

### Drag & drop

HTML5 native DnD in `TodoItem.tsx` (draggable attribute + dragStart/dragOver/drop events). The `dragSrcId` ref in `TodoList.tsx` tracks the source item across drag events. `useTodos.reorder()` moves the item and reassigns `order` fields.

### Legacy reference

The original single-file HTML implementation is at `.backup/index.html`. It contains the same feature set and can be referenced for comparison or behavior queries.
