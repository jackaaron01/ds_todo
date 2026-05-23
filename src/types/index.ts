export interface SubTask {
  id: number;
  text: string;
  done: boolean;
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: "" | "high" | "medium" | "low";
  dueDate: string;
  order: number;
  pinned: boolean;
  note: string;
  subtasks: SubTask[];
}

export type SortMode = "manual" | "priority" | "date";
export type FilterMode = "all" | "active" | "completed";
export type Priority = "" | "high" | "medium" | "low";
