"use client";

import { memo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  total: number;
  done: number;
  allDone: boolean;
}

const ProgressBar = memo(function ProgressBar({ total, done, allDone }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const [pulse, setPulse] = useState(false);
  const prevPct = useRef(pct);

  useEffect(() => {
    if (pct !== prevPct.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      prevPct.current = pct;
      return () => clearTimeout(t);
    }
  }, [pct]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="flex items-center gap-3 mb-3.5"
    >
      <div className="flex-1 h-1.5 rounded-full bg-[var(--progress-bg)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            allDone
              ? "bg-gradient-to-r from-green-400 to-green-500"
              : "bg-[var(--accent)]"
          } ${pulse ? "shadow-[0_0_8px_2px_var(--accent-glow)]" : ""}`}
          style={{ width: pct + "%" }}
          layout
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap min-w-[70px] text-right">
        {done}/{total} 已完成
      </span>
    </motion.div>
  );
});

export default ProgressBar;
