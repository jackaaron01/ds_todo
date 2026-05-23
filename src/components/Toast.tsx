"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Todo } from "@/types";

interface ToastProps {
  visible: boolean;
  todo: Todo | null;
  onUndo: () => void;
}

export default function Toast({ visible, todo, onUndo }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && todo && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                     bg-[var(--toast-bg)] text-[var(--toast-text)]
                     px-5 py-3 rounded-full shadow-xl
                     flex items-center gap-3 text-sm"
        >
          <span>已删除「{todo.text}」</span>
          <button
            onClick={onUndo}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            撤销
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
