"use client";

import { motion } from "framer-motion";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-6"
    >
      <h1 className="text-[28px] font-bold tracking-[-0.5px] text-[var(--text)]">
        Todo
      </h1>

      <motion.button
        onClick={onToggleTheme}
        whileTap={{ scale: 0.9 }}
        className="w-[38px] h-[38px] flex items-center justify-center
                   rounded-full bg-[var(--surface)] text-lg
                   text-[var(--text-secondary)] shadow-sm
                   hover:text-[var(--accent)] hover:shadow-md
                   hover:-translate-y-px transition-all duration-300"
        title="切换主题"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </motion.button>
    </motion.div>
  );
}
