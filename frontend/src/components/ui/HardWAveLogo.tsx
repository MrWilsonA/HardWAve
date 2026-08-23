"use client";

import React from "react";

export default function HardWAveLogo({ size = 38 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3 group select-none">
      {/* High-Tech Nature Vector Emblem */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 filter drop-shadow-[0_4px_12px_rgba(74,222,128,0.35)]"
        >
          <defs>
            <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="waveGrad" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="borderGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Hexagonal Chip Base */}
          <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoBg)" stroke="url(#borderGrad)" strokeWidth="1.8" />

          {/* Microchip Corner Traces */}
          <path d="M8 12H12V8" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M40 12H36V8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M8 36H12V40" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M40 36H36V40" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          {/* Central Stylized 'H' Wave Pulse */}
          <path
            d="M15 14V34M33 14V34M15 24C19 18 22 30 24 24C26 18 29 30 33 24"
            stroke="url(#waveGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Microchip Core Node */}
          <circle cx="24" cy="24" r="2.2" fill="#f8fafc" />
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight font-mono text-white drop-shadow-md">
            HARD<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">WAVE</span>
          </span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            PROVENANCE
          </span>
        </div>
        <span className="block text-[10px] font-medium tracking-wide text-slate-400">
          Decentralized Hardware Protocol
        </span>
      </div>
    </div>
  );
}
