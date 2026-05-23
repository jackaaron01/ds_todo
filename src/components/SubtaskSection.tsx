"use client";

import { useState, useRef, useCallback, memo } from "react";
import type { SubTask } from "@/types";

interface SubtaskSectionProps {
  subtasks: SubTask[];
  note: string;
  onAddSubtask: (text: string) => void;
  onToggleSubtask: (subId: number) => void;
  onDeleteSubtask: (subId: number) => void;
  onUpdateNote: (note: string) => void;
}

const SubtaskSection = memo(function SubtaskSection({
  subtasks,
  note,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateNote,
}: SubtaskSectionProps) {
  const [subInput, setSubInput] = useState("");
  const [localNote, setLocalNote] = useState(note);
  const subInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushNote = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onUpdateNote(value);
    },
    [onUpdateNote]
  );

  const handleNoteChange = useCallback(
    (value: string) => {
      setLocalNote(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onUpdateNote(value), 300);
    },
    [onUpdateNote]
  );

  const handleAddSub = useCallback(() => {
    if (!subInput.trim()) return;
    onAddSubtask(subInput.trim());
    setSubInput("");
    subInputRef.current?.focus();
  }, [subInput, onAddSubtask]);

  return (
    <div className="ml-8 mt-1.5 space-y-1 bg-[var(--bg)] rounded-lg p-2.5">
      {subtasks.map((s) => (
        <div
          key={s.id}
          className={`flex items-center gap-2 py-1 text-sm ${
            s.done ? "opacity-60" : ""
          }`}
        >
          <button
            role="checkbox"
            aria-checked={s.done}
            aria-label={`${s.done ? "取消完成" : "完成"} ${s.text}`}
            onClick={() => onToggleSubtask(s.id)}
            className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0
                        flex items-center justify-center transition-all duration-200
                        ${
                          s.done
                            ? "bg-[var(--accent)] border-[var(--accent)]"
                            : "border-[var(--border)] hover:border-[var(--accent)]"
                        }`}
          >
            {s.done && (
              <span className="text-white text-[10px] font-bold">✓</span>
            )}
          </button>
          <span
            className={`flex-1 break-all ${
              s.done
                ? "line-through text-[var(--text-muted)]"
                : "text-[var(--text)]"
            }`}
          >
            {s.text}
          </span>
          <button
            onClick={() => onDeleteSubtask(s.id)}
            aria-label={`删除子任务 ${s.text}`}
            className="w-5 h-5 flex items-center justify-center rounded-full
                       text-[var(--text-muted)] hover:text-red-500 hover:bg-red-100
                       dark:hover:bg-red-900/30 transition-colors"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex gap-1.5 mt-1.5">
        <input
          ref={subInputRef}
          type="text"
          value={subInput}
          onChange={(e) => setSubInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddSub();
          }}
          placeholder="添加子任务..."
          className="flex-1 px-2 py-1 text-xs rounded-md border border-[var(--border)]
                     bg-[var(--surface)] text-[var(--text)] outline-none
                     focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={handleAddSub}
          className="px-2 py-1 text-xs rounded-md bg-[var(--accent)] text-white
                     hover:bg-[var(--accent-hover)] transition-colors"
        >
          +
        </button>
      </div>

      <textarea
        value={localNote}
        onChange={(e) => handleNoteChange(e.target.value)}
        onBlur={(e) => flushNote(e.target.value)}
        placeholder="添加备注..."
        rows={1}
        className="w-full px-2 py-1 text-xs rounded-md border border-[var(--border)]
                   bg-[var(--surface)] text-[var(--text)] outline-none resize-none
                   focus:border-[var(--accent)] transition-colors mt-1 min-h-[32px]
                   font-sans field-sizing-content"
      />
    </div>
  );
});

export default SubtaskSection;
