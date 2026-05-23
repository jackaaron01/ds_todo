import type { Todo, SortMode } from "@/types";
import { priorityWeight } from "@/lib/utils";

export function sortTodos(todos: Todo[], mode: SortMode): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

    if (mode === "priority") {
      const wa = priorityWeight(a.priority);
      const wb = priorityWeight(b.priority);
      if (wa !== wb) return wa - wb;
      return a.order - b.order;
    }

    if (mode === "date") {
      if (!a.dueDate && !b.dueDate) return a.order - b.order;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate) || a.order - b.order;
    }

    return a.order - b.order;
  });
}
