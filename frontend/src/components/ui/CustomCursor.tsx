"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animFrame = useRef<number | null>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentTrailing = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable custom cursor for fine pointer (mouse)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.closest("input") ||
          target.closest("kbd") ||
          target.tagName === "BUTTON" ||
          target.tagName === "A";
        setIsHovered(!!isClickable);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth trailing animation loop
    const loop = () => {
      currentTrailing.current.x += (targetPos.current.x - currentTrailing.current.x) * 0.22;
      currentTrailing.current.y += (targetPos.current.y - currentTrailing.current.y) * 0.22;
      setTrailingPos({ x: currentTrailing.current.x, y: currentTrailing.current.y });
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] select-none">
      {/* Outer Smooth Trailing Ring */}
      <div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) scale(${
            isMouseDown ? 0.75 : isHovered ? 1.45 : 1.0
          })`,
          width: "28px",
          height: "28px",
          border: isHovered
            ? "2px solid rgba(74, 222, 128, 0.9)"
            : isMouseDown
            ? "2px solid rgba(251, 191, 36, 0.9)"
            : "1.5px solid rgba(255, 255, 255, 0.45)",
          backgroundColor: isHovered
            ? "rgba(74, 222, 128, 0.12)"
            : isMouseDown
            ? "rgba(251, 191, 36, 0.15)"
            : "rgba(255, 255, 255, 0.05)",
          boxShadow: isHovered
            ? "0 0 12px rgba(74, 222, 128, 0.5)"
            : isMouseDown
            ? "0 0 10px rgba(251, 191, 36, 0.5)"
            : "0 0 6px rgba(0, 0, 0, 0.2)",
        }}
      />

      {/* Precision Center Dot */}
      <div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          width: isMouseDown ? "4px" : "6px",
          height: isMouseDown ? "4px" : "6px",
          backgroundColor: isHovered ? "#4ade80" : isMouseDown ? "#fbbf24" : "#ffffff",
          boxShadow: isHovered
            ? "0 0 8px #4ade80"
            : isMouseDown
            ? "0 0 8px #fbbf24"
            : "0 0 4px rgba(255, 255, 255, 0.8)",
        }}
      />
    </div>
  );
}
