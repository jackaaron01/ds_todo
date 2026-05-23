import type { Todo } from "@/types";

export interface DateLabel {
  text: string;
  cls: "overdue" | "today" | "upcoming";
}

export function getDateLabel(dateStr: string): DateLabel | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  const rounded = Math.round(diff);
  if (diff < 0) return { text: `逾期${Math.abs(rounded)}天`, cls: "overdue" };
  if (diff === 0) return { text: "今天", cls: "today" };
  if (diff === 1) return { text: "明天", cls: "upcoming" };
  return { text: `${rounded}天后`, cls: "upcoming" };
}

export function priorityWeight(p: string): number {
  const w: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return p && w[p] !== undefined ? w[p] : 3;
}

export function exportTodos(todos: Todo[]): void {
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}
