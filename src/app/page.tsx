"use client";

import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { SortMode, FilterMode, Todo } from "@/types";
import { useTodos } from "@/hooks/useTodos";
import { useTheme } from "@/hooks/useTheme";
import { useUndo } from "@/hooks/useUndo";
import { sortTodos } from "@/hooks/sortUtils";
import { exportTodos } from "@/lib/utils";
import Header from "@/components/Header";
import TodoInput from "@/components/TodoInput";
import Toolbar from "@/components/Toolbar";
import ProgressBar from "@/components/ProgressBar";
import TodoList from "@/components/TodoList";
import Toast from "@/components/Toast";
import Confetti from "@/components/Confetti";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const {
    todos,
    mounted,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoText,
    togglePin,
    updateNote,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorder,
    clearCompleted,
    restoreTodo,
    importTodos,
  } = useTodos();

  const { theme, toggleTheme } = useTheme();
  const { undoData, visible, showUndo, popUndo } = useUndo();
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const searchRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sortMode") as SortMode) || "manual";
    }
    return "manual";
  });
  const [confettiKey, setConfettiKey] = useState(0);

  // Filtered + sorted todos
  const displayedTodos = useMemo(() => {
    let list = sortTodos(todos, sortMode);

    if (filter === "active") list = list.filter((t) => !t.done);
    if (filter === "completed") list = list.filter((t) => t.done);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.text.toLowerCase().includes(q));
    }

    return list;
  }, [todos, sortMode, filter, searchQuery]);

  // Progress stats
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const allDone = total > 0 && done === total;

  // Confetti trigger
  const [prevAllDone, setPrevAllDone] = useState(false);
  useEffect(() => {
    if (allDone && !prevAllDone) {
      setConfettiKey((k) => k + 1);
    }
    setPrevAllDone(allDone);
  }, [allDone, prevAllDone]);

  // Handle delete with undo
  const handleDelete = useCallback(
    (id: number) => {
      const todo = todosRef.current.find((t) => t.id === id);
      if (todo) {
        deleteTodo(id);
        showUndo(todo);
      }
    },
    [deleteTodo, showUndo]
  );

  // Handle undo
  const handleUndo = useCallback(() => {
    const todo = popUndo();
    if (todo) restoreTodo(todo);
  }, [popUndo, restoreTodo]);

  // Handle sorting
  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode);
    localStorage.setItem("sortMode", mode);
  }, []);

  // Handle import
  const handleImport = useCallback(
    (data: Todo[]) => {
      importTodos(data);
    },
    [importTodos]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (mod && e.key === "n") {
        e.preventDefault();
        addInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        const active = document.activeElement;
        if (active === searchRef.current || active === addInputRef.current) {
          (active as HTMLInputElement).blur();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const hasCompleted = todos.some((t) => t.done);

  if (!mounted) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-full max-w-[560px] px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-20 bg-[var(--hover-bg)] rounded" />
            <div className="h-12 bg-[var(--hover-bg)] rounded-xl" />
            <div className="h-8 bg-[var(--hover-bg)] rounded-full w-3/4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-[var(--hover-bg)] rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex justify-center pt-10 pb-24 px-4 relative min-h-screen">
        <div className="w-full max-w-[560px] relative z-10">
          <Header theme={theme} onToggleTheme={toggleTheme} />

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <TodoInput onAdd={addTodo} inputRef={addInputRef} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              sortMode={sortMode}
              onSortChange={handleSortChange}
              onClearCompleted={clearCompleted}
              onExport={() => exportTodos(todos)}
              onImport={handleImport}
              hasCompleted={hasCompleted}
              searchRef={searchRef}
            />
          </motion.div>

          <ProgressBar total={total} done={done} allDone={allDone} />

          <TodoList
            todos={displayedTodos}
            onToggle={toggleTodo}
            onDelete={handleDelete}
            onUpdateText={updateTodoText}
            onTogglePin={togglePin}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onUpdateNote={updateNote}
            onReorder={reorder}
          />
        </div>

        <Toast visible={visible} todo={undoData} onUndo={handleUndo} />
        <Confetti key={confettiKey} active={allDone} />
      </div>
    </ErrorBoundary>
  );
}
