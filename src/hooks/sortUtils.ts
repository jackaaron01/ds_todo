import type { Todo, SortMode } from "@/types";
import { priorityWeight } from "@/lib/utils";

export function sortTodos(todos: Todo[], mode: SortMode): Todo[] {
  const list = [...todos];

  // Pinned always first
  list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  if (mode === "priority") {
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return 0;
      const wa = priorityWeight(a.priority);
      const wb = priorityWeight(b.priority);
      if (wa !== wb) return wa - wb;
      return a.order - b.order;
    });
  } else if (mode === "date") {
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return 0;
      if (!a.dueDate && !b.dueDate) return a.order - b.order;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate) || a.order - b.order;
    });
  } else {
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return 0;
      return a.order - b.order;
    });
  }

  return list;
}
