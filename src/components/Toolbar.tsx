"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { SortMode, FilterMode } from "@/types";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filter: FilterMode;
  onFilterChange: (f: FilterMode) => void;
  sortMode: SortMode;
  onSortChange: (m: SortMode) => void;
  onClearCompleted: () => void;
  onExport: () => void;
  onImport: (data: any[]) => void;
  hasCompleted: boolean;
}

export default function Toolbar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortMode,
  onSortChange,
  onClearCompleted,
  onExport,
  onImport,
  hasCompleted,
}: ToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sortLabels: Record<SortMode, string> = {
    manual: "手动排序",
    priority: "按优先级",
    date: "按日期",
  };

  useEffect(() => {
    if (sortOpen) {
      const handler = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setSortOpen(false);
        }
      };
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [sortOpen]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (Array.isArray(data)) onImport(data);
        } catch {
          // Invalid file
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImport]
  );

  const filters: { value: FilterMode; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "active", label: "未完成" },
    { value: "completed", label: "已完成" },
  ];

  const sorts: { value: SortMode; label: string }[] = [
    { value: "manual", label: "手动排序" },
    { value: "priority", label: "按优先级" },
    { value: "date", label: "按日期" },
  ];

  return (
    <div className="flex gap-1.5 items-center mb-3 flex-wrap">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜索... (Ctrl+K)"
        className="flex-1 min-w-[120px] px-3 py-2 rounded-full text-xs
                   border-2 border-[var(--border)] bg-[var(--surface)]
                   text-[var(--text)] outline-none
                   focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]
                   transition-all duration-200"
      />

      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap
                      transition-all duration-200 relative overflow-hidden
                      ${
                        filter === f.value
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]"
                      }`}
        >
          {f.label}
        </button>
      ))}

      {/* Sort */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap
                     bg-[var(--surface)] text-[var(--text-secondary)]
                     hover:bg-[var(--hover-bg)] transition-all duration-200"
        >
          {sortLabels[sortMode]} ▾
        </button>
        {sortOpen && (
          <div
            className="absolute top-full mt-1 left-0 bg-[var(--surface)] rounded-lg
                        shadow-xl overflow-hidden z-50 min-w-[110px]
                        animate-[menuIn_0.2s_ease] origin-top-left"
          >
            {sorts.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  onSortChange(s.value);
                  setSortOpen(false);
                }}
                className={`block w-full px-4 py-2 text-xs text-left
                            hover:bg-[var(--hover-bg)] transition-colors
                            ${
                              sortMode === s.value
                                ? "text-[var(--accent)] font-semibold"
                                : "text-[var(--text)]"
                            }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onExport}
        className="px-2.5 py-2 rounded-full text-xs text-[var(--text-secondary)]
                   hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]
                   transition-all duration-200 whitespace-nowrap"
      >
        导出
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="px-2.5 py-2 rounded-full text-xs text-[var(--text-secondary)]
                   hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]
                   transition-all duration-200 whitespace-nowrap"
      >
        导入
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <button
        onClick={onClearCompleted}
        disabled={!hasCompleted}
        className={`px-2.5 py-2 rounded-full text-xs whitespace-nowrap
                    transition-all duration-200
                    ${
                      hasCompleted
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        : "text-[var(--text-muted)] cursor-not-allowed"
                    }`}
      >
        清除已完成
      </button>
    </div>
  );
}
