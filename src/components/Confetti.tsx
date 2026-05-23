"use client";

import { memo, useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
}

const COLORS = [
  "#e74c3c",
  "#f39c12",
  "#2ecc71",
  "#4f6ef7",
  "#9b59b6",
  "#1abc9c",
  "#e91e63",
  "#ff9800",
];
const SHAPES = ["■", "●", "▲", "★", "♦"];

const Confetti = memo(function Confetti({ active }: ConfettiProps) {
  const [pieces, setPieces] = useState<
    { id: number; left: string; top: string; size: number; color: string; shape: string; dur: number; delay: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      top: -(Math.random() * 20) + "px",
      size: 8 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      dur: 2 + Math.random() * 3,
      delay: Math.random() * 0.8,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="fixed z-[200] pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            color: p.color,
            animation: `confettiFall ${p.dur}s linear ${p.delay}s forwards`,
          }}
        >
          {p.shape}
        </span>
      ))}
    </>
  );
});

export default Confetti;
