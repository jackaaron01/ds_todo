"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { Todo } from "@/types";
import { getDateLabel } from "@/lib/utils";
import SubtaskSection from "./SubtaskSection";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateText: (id: number, text: string) => void;
  onTogglePin: (id: number) => void;
  onAddSubtask: (todoId: number, text: string) => void;
  onToggleSubtask: (todoId: number, subId: number) => void;
  onDeleteSubtask: (todoId: number, subId: number) => void;
  onUpdateNote: (todoId: number, note: string) => void;
  onDragStart: (id: number) => void;
  onDragOver: (id: number) => void;
  onDrop: (id: number) => void;
  index: number;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdateText,
  onTogglePin,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateNote,
  onDragStart,
  onDragOver,
  onDrop,
  index,
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const rippleCounter = useRef(0);

  const dateLabel = getDateLabel(todo.dueDate);
  const subDone = todo.subtasks.filter((s) => s.done).length;
  const subTotal = todo.subtasks.length;
  const hasExtra = subTotal > 0 || todo.note;

  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++rippleCounter.current;
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    setTimeout(
      () => setRipples((prev) => prev.filter((r) => r.id !== id)),
      600
    );
  }, []);

  const handleEditSubmit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      onDelete(todo.id);
    } else {
      onUpdateText(todo.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(todo.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(todo.id);
      }}
      className={`rounded-xl bg-[var(--surface)] shadow-sm
                  border-l-[3px] border-transparent
                  hover:shadow-md hover:-translate-y-px
                  transition-shadow duration-200 cursor-default
                  group overflow-hidden
                  ${todo.priority === "high" ? "!border-l-red-500" : ""}
                  ${todo.priority === "medium" ? "!border-l-orange-400" : ""}
                  ${todo.priority === "low" ? "!border-l-gray-400" : ""}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_0.6s_ease-out_forwards]"
            style={{
              left: r.x - 24,
              top: r.y - 24,
              width: 48,
              height: 48,
            }}
          />
        ))}

        {/* Drag handle */}
        <span className="text-[var(--text-muted)] cursor-grab active:cursor-grabbing select-none text-base tracking-[-2px] leading-none py-0.5 hover:text-[var(--accent)] transition-colors">
          ⋮⋮
        </span>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            addRipple(e);
            onToggle(todo.id);
          }}
          className={`w-[22px] h-[22px] rounded-full border-2 flex-shrink-0
                      flex items-center justify-center transition-all duration-200
                      ${
                        todo.done
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "border-[var(--border)] hover:border-[var(--accent)] hover:scale-110"
                      }`}
        >
          {todo.done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-white text-[13px] font-bold"
            >
              ✓
            </motion.span>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full text-[15px] px-1 py-0.5 rounded border-2 border-[var(--accent)] bg-[var(--surface)] text-[var(--text)] outline-none"
            />
          ) : (
            <span
              onDoubleClick={() => {
                setEditText(todo.text);
                setEditing(true);
              }}
              className={`text-[15px] break-all outline-none rounded px-1 py-0.5 select-none ${
                todo.done
                  ? "line-through text-[var(--text-muted)]"
                  : "text-[var(--text)]"
              }`}
            >
              {todo.text}
            </span>
          )}

          {/* Meta badges */}
          {(dateLabel || subTotal > 0 || todo.note) && (
            <div className="flex gap-1.5 mt-1 flex-wrap items-center">
              {dateLabel && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium
                    ${dateLabel.cls === "overdue" ? "bg-red-50 text-red-500 dark:bg-red-900/20" : ""}
                    ${dateLabel.cls === "today" ? "bg-orange-50 text-orange-500 dark:bg-orange-900/20" : ""}
                    ${dateLabel.cls === "upcoming" ? "bg-blue-50 text-blue-500 dark:bg-blue-900/20" : ""}`}
                >
                  {dateLabel.text}
                </span>
              )}
              {subTotal > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                    subDone === subTotal
                      ? "bg-green-50 text-green-500 dark:bg-green-900/20"
                      : "bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                  }`}
                >
                  📋 {subDone}/{subTotal}
                </button>
              )}
              {todo.note && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
                >
                  📝
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <button
          onClick={(e) => {
            addRipple(e);
            onTogglePin(todo.id);
          }}
          className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-all duration-200 text-sm
            ${todo.pinned ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]"}`}
          title="置顶"
        >
          📌
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-[26px] h-[26px] flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-bg)] transition-all duration-200 text-sm ${!hasExtra ? "invisible" : ""}`}
          title="展开"
        >
          {expanded ? "▾" : "▸"}
        </button>

        <button
          onClick={(e) => {
            addRipple(e);
            onDelete(todo.id);
          }}
          className="w-[30px] h-[30px] flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100 text-lg"
          aria-label="删除"
        >
          ×
        </button>
      </div>

      {/* Expanded section */}
      {expanded && hasExtra && (
        <SubtaskSection
          subtasks={todo.subtasks}
          note={todo.note}
          onAddSubtask={(text) => onAddSubtask(todo.id, text)}
          onToggleSubtask={(subId) => onToggleSubtask(todo.id, subId)}
          onDeleteSubtask={(subId) => onDeleteSubtask(todo.id, subId)}
          onUpdateNote={(note) => onUpdateNote(todo.id, note)}
        />
      )}
    </motion.div>
  );
}
