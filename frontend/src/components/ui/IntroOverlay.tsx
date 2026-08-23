"use client";

import React, { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import HardWAveLogo from "@/components/ui/HardWAveLogo";

/**
 * Boot overlay. The previous version faded out on a fixed 0.8 s timer, which
 * uncovered a black canvas while the 20 MB of GLTF pavilions were still
 * streaming in. It now tracks real loader progress and only dissolves once the
 * island is actually on screen.
 */
export default function IntroOverlay() {
  const { active, progress } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (active || progress < 100) return;
    // Hold one beat past 100% so the first rendered frame is composited.
    const timeoutId = window.setTimeout(() => setDismissed(true), 600);
    return () => window.clearTimeout(timeoutId);
  }, [active, progress]);

  // Never trap the user behind a stalled asset.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDismissed(true), 15000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 pointer-events-none bg-slate-950"
      style={{ transition: "opacity 700ms ease-out" }}
      role="status"
      aria-live="polite"
    >
      <div className="scale-125 mb-1">
        <HardWAveLogo size={56} />
      </div>

      <p className="text-sm font-mono tracking-widest text-emerald-400 font-bold uppercase">
        10-Minute Day &amp; Night Living World
      </p>

      <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(6, Math.round(progress))}%`,
            background: "linear-gradient(90deg, #10b981, #fbbf24)",
          }}
        />
      </div>

      <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
        Streaming island &amp; hardware digital twins • {Math.round(progress)}%
      </p>
    </div>
  );
}
