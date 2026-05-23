"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo, Priority } from "@/types";

const STORAGE_KEY = "todosV2";

let _nextId = Date.now();
function generateId(): number {
  const now = Date.now();
  _nextId = Math.max(now, _nextId + 1);
  return _nextId;
}

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(
      (t: Partial<Todo>): Todo => ({
        id: t.id ?? generateId(),
        text: t.text ?? "",
        done: t.done ?? false,
        priority: (t.priority || "") as Todo["priority"],
        dueDate: t.dueDate || "",
        order: t.order ?? generateId(),
        pinned: t.pinned ?? false,
        note: t.note || "",
        subtasks: t.subtasks || [],
      })
    );
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setMounted(true);
  }, []);

  const addTodo = useCallback(
    (text: string, priority: Priority, dueDate: string) => {
      setTodos((prev) => {
        const maxOrder = prev.reduce((max, t) => Math.max(max, t.order), -1);
        const next = [
          ...prev,
          {
            id: generateId(),
            text,
            done: false,
            priority,
            dueDate,
            order: maxOrder + 1,
            pinned: false,
            note: "",
            subtasks: [],
          },
        ];
        saveTodos(next);
        return next;
      });
    },
    []
  );

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      saveTodos(next);
      return next;
    });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTodos(next);
      return next;
    });
  }, []);

  const updateTodoText = useCallback((id: number, text: string) => {
    setTodos((prev) => {
      if (!text.trim()) {
        const next = prev.filter((t) => t.id !== id);
        saveTodos(next);
        return next;
      }
      const next = prev.map((t) => (t.id === id ? { ...t, text } : t));
      saveTodos(next);
      return next;
    });
  }, []);

  const togglePin = useCallback((id: number) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, pinned: !t.pinned } : t
      );
      saveTodos(next);
      return next;
    });
  }, []);

  const updateNote = useCallback((id: number, note: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, note } : t));
      saveTodos(next);
      return next;
    });
  }, []);

  // Subtask operations
  const addSubtask = useCallback((todoId: number, text: string) => {
    if (!text.trim()) return;
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: generateId(), text, done: false },
              ],
            }
          : t
      );
      saveTodos(next);
      return next;
    });
  }, []);

  const toggleSubtask = useCallback((todoId: number, subId: number) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subId ? { ...s, done: !s.done } : s
              ),
            }
          : t
      );
      saveTodos(next);
      return next;
    });
  }, []);

  const deleteSubtask = useCallback((todoId: number, subId: number) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subId) }
          : t
      );
      saveTodos(next);
      return next;
    });
  }, []);

  const reorder = useCallback((srcId: number, tgtId: number) => {
    setTodos((prev) => {
      const srcIdx = prev.findIndex((t) => t.id === srcId);
      const tgtIdx = prev.findIndex((t) => t.id === tgtId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, moved);
      const reordered = next.map((t, i) => ({ ...t, order: i }));
      saveTodos(reordered);
      return reordered;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => {
      const next = prev.filter((t) => !t.done);
      saveTodos(next);
      return next;
    });
  }, []);

  const restoreTodo = useCallback((todo: Todo) => {
    setTodos((prev) => {
      const next = [...prev, todo];
      saveTodos(next);
      return next;
    });
  }, []);

  const importTodos = useCallback((data: Todo[]) => {
    setTodos((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const merged = [...prev];
      data.forEach((t) => {
        t.order = t.order ?? generateId();
        t.priority = t.priority || "";
        t.dueDate = t.dueDate || "";
        t.pinned = t.pinned || false;
        t.note = t.note || "";
        t.subtasks = t.subtasks || [];
        const idx = merged.findIndex((ex) => ex.id === t.id);
        if (idx >= 0) merged[idx] = t;
        else merged.push(t);
      });
      saveTodos(merged);
      return merged;
    });
  }, []);

  return {
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
  };
}
