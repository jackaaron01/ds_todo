"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Todo } from "@/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateText: (id: number, text: string) => void;
  onTogglePin: (id: number) => void;
  onAddSubtask: (todoId: number, text: string) => void;
  onToggleSubtask: (todoId: number, subId: number) => void;
  onDeleteSubtask: (todoId: number, subId: number) => void;
  onUpdateNote: (todoId: number, note: string) => void;
  onReorder: (srcId: number, tgtId: number) => void;
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onUpdateText,
  onTogglePin,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateNote,
  onReorder,
}: TodoListProps) {
  const dragSrcId = { current: null as number | null };

  const handleDragStart = (id: number) => {
    dragSrcId.current = id;
  };

  const handleDragOver = (_id: number) => {
    // Handled by browser DnD
  };

  const handleDrop = (tgtId: number) => {
    const srcId = dragSrcId.current;
    if (srcId && srcId !== tgtId) {
      onReorder(srcId, tgtId);
    }
    dragSrcId.current = null;
  };

  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center text-[var(--text-muted)] py-16 text-sm"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-6xl mb-3 opacity-40"
        >
          📋
        </motion.div>
        暂无任务
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence mode="popLayout">
        {todos.map((todo, idx) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            index={idx}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdateText={onUpdateText}
            onTogglePin={onTogglePin}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onUpdateNote={onUpdateNote}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
