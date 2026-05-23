"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Todo } from "@/types";

export function useUndo() {
  const [undoData, setUndoData] = useState<Todo | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showUndo = useCallback((todo: Todo) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setUndoData(todo);
    setVisible(true);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setUndoData(null);
    }, 4000);
  }, []);

  const popUndo = useCallback((): Todo | null => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const data = undoData;
    setUndoData(null);
    setVisible(false);
    return data;
  }, [undoData]);

  return { undoData, visible, showUndo, popUndo };
}
