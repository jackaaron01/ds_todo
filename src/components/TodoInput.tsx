"use client";

import { memo, useState, useCallback } from "react";
import type { Priority } from "@/types";

interface TodoInputProps {
  onAdd: (text: string, priority: Priority, dueDate: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const PRIORITIES: { value: Priority; label: string; dot?: string }[] = [
  { value: "", label: "无优先级" },
  { value: "high", label: "高", dot: "🔴" },
  { value: "medium", label: "中", dot: "🟠" },
  { value: "low", label: "低", dot: "⚪" },
];

const TodoInput = memo(function TodoInput({ onAdd, inputRef }: TodoInputProps) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("");
  const [shake, setShake] = useState(false);

  const handleAdd = useCallback(() => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onAdd(text.trim(), priority, dueDate);
    setText("");
    setDueDate("");
    inputRef.current?.focus();
  }, [text, priority, dueDate, onAdd, inputRef]);

  return (
    <div className="space-y-2 mb-4">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="添加新任务... (Ctrl+N)"
          maxLength={200}
          className={`flex-1 px-4 py-3 rounded-xl text-sm
                      border-2 border-[var(--border)] bg-[var(--surface)]
                      text-[var(--text)] outline-none
                      focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]
                      transition-all duration-200
                      ${shake ? "animate-[shakeX_0.4s_ease]" : ""}`}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-3 rounded-xl text-sm w-[140px]
                     border-2 border-[var(--border)] bg-[var(--surface)]
                     text-[var(--text)] outline-none cursor-pointer
                     focus:border-[var(--accent)] transition-colors duration-200"
        />
        <button
          onClick={handleAdd}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-white
                     bg-[var(--accent)] hover:bg-[var(--accent-hover)]
                     hover:shadow-[0_4px_16px_var(--accent-glow)]
                     hover:-translate-y-px active:scale-[0.97]
                     transition-all duration-200 relative overflow-hidden"
        >
          添加
        </button>
      </div>

      <div className="flex gap-1.5">
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            onClick={() => setPriority(p.value)}
            aria-label={p.label}
            className={`px-3 py-1 rounded-full text-xs font-medium
                        border-[1.5px] transition-all duration-200
                        ${
                          priority === p.value
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white animate-[popIn_0.25s_ease]"
                            : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        }`}
          >
            {p.dot && <span className="mr-1 text-[10px]">{p.dot}</span>}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export default TodoInput;
