"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo } from "@/types";

export function useUndo() {
  const [undoData, setUndoData] = useState<Todo | null>(null);
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const showUndo = useCallback(
    (todo: Todo) => {
      if (timeoutId) clearTimeout(timeoutId);
      setUndoData(todo);
      setVisible(true);
      const id = setTimeout(() => {
        setVisible(false);
        setUndoData(null);
      }, 4000);
      setTimeoutId(id);
    },
    [timeoutId]
  );

  const hideUndo = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
    setUndoData(null);
  }, [timeoutId]);

  const popUndo = useCallback((): Todo | null => {
    if (timeoutId) clearTimeout(timeoutId);
    const data = undoData;
    setUndoData(null);
    setVisible(false);
    return data;
  }, [undoData, timeoutId]);

  return { undoData, visible, showUndo, hideUndo, popUndo };
}
