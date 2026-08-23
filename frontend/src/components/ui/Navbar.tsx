"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Compass, Sun, Moon, CloudRain, CloudSun, Coins } from "lucide-react";
import HardWAveLogo from "@/components/ui/HardWAveLogo";
import SoundController from "@/components/ui/SoundController";
import { STATIONS, StationIcon } from "@/components/3d/nature/ParkPavilions";
import { DayNightState } from "@/hooks/useDayNightCycle";
import { THEME } from "@/theme/designSystem";
import { useBlockchainEngine } from "@/store/blockchainEngine";
import { useHardwareStore } from "@/store/hardwareStore";

interface NavbarProps {
  dayNight: DayNightState;
  onTeleport: (stationId: string) => void;
}

export default function Navbar({ dayNight, onTeleport }: NavbarProps) {
  const [showControls, setShowControls] = useState(false);
  const [showFastTravel, setShowFastTravel] = useState(false);

  const { timeString, isNight } = dayNight;
  const userWallet = useBlockchainEngine((s) => s.userWallet);
  const setActiveModal = useHardwareStore((s) => s.setActiveModal);

  // Dismiss the popovers with Escape and on any outside interaction.
  useEffect(() => {
    if (!showControls && !showFastTravel) return;

    const close = () => {
      setShowControls(false);
      setShowFastTravel(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", close);
    };
  }, [showControls, showFastTravel]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none p-3 pointer-events-none">
      <div className="flex items-center justify-between gap-3">
        {/* ── Left Corner: HardWAve Logo + Live Real-Time Clock ── */}
        <div className="flex items-center gap-2.5 pointer-events-auto shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl border transition-all duration-300 shadow-xl group cursor-pointer active:scale-95"
            style={{
              background: THEME.colors.glass.bgElevated,
              borderColor: THEME.colors.glass.border,
              backdropFilter: THEME.colors.glass.backdropBlur,
              boxShadow: THEME.colors.glass.shadow,
            }}
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <HardWAveLogo size={36} variant="mark" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-wider text-white">HardWAve</span>
              <span className="block text-[8px] font-mono tracking-widest text-emerald-400 font-bold uppercase -mt-1">
                Hardware Provenance
              </span>
            </div>
          </Link>

          {/* 10-Minute Cycle Living World Clock */}
          <div
            className="px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl"
            style={{
              background: THEME.colors.glass.bgElevated,
              borderColor: isNight ? "rgba(147, 197, 253, 0.25)" : "rgba(251, 191, 36, 0.25)",
              backdropFilter: THEME.colors.glass.backdropBlur,
              boxShadow: THEME.colors.glass.shadow,
            }}
          >
            {isNight ? (
              <Moon className="w-4 h-4 text-blue-300 animate-pulse" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "20s" }} />
            )}
            <span
              className="text-xs font-mono font-black tracking-wider"
              style={{ color: isNight ? "#93c5fd" : "#fbbf24" }}
            >
              {timeString}
            </span>
          </div>
        </div>

        {/* ── Right Corner: Controls, Fast Travel, Weather, Audio & Sovereign Web3 Wallet ── */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          {/* 1. Minimized Controls Icon Button */}
          <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowControls(!showControls);
                setShowFastTravel(false);
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer text-slate-300 hover:text-white"
              style={{
                background: showControls
                  ? "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(180, 83, 9, 0.8))"
                  : THEME.colors.glass.bg,
                borderColor: showControls ? "#fbbf24" : THEME.colors.glass.border,
                backdropFilter: THEME.colors.glass.backdropBlur,
                color: showControls ? "#fbbf24" : "#cbd5e1",
              }}
              title="Controls & Instructions"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>

            {/* Controls Popover */}
            {showControls && (
              <div
                className="absolute top-12 right-0 w-72 p-4 rounded-3xl border shadow-2xl hw-popover z-50 select-none space-y-3"
                style={{
                  background: THEME.colors.glass.bgElevated,
                  borderColor: THEME.colors.glass.border,
                  backdropFilter: "blur(24px)",
                  boxShadow: THEME.colors.glass.shadow,
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Buggy Controls
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">ARCADE PHYSICS</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Drive Forward</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300 font-bold border border-white/15">
                      W / ↑
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Steer Left / Right</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300 font-bold border border-white/15">
                      A / D / ← →
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Reverse / Brake</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300 font-bold border border-white/15">
                      S / ↓
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Inspect Station</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-emerald-400 font-bold border border-white/15">
                      E
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Rotate Camera</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Left Drag
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">Zoom Camera</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Scroll Wheel
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Fast Travel Popover */}
          <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowFastTravel(!showFastTravel);
                setShowControls(false);
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer text-slate-300 hover:text-white"
              style={{
                background: showFastTravel
                  ? "linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(3, 105, 161, 0.8))"
                  : THEME.colors.glass.bg,
                borderColor: showFastTravel ? "#38bdf8" : THEME.colors.glass.border,
                backdropFilter: THEME.colors.glass.backdropBlur,
                color: showFastTravel ? "#38bdf8" : "#cbd5e1",
              }}
              title="Fast Travel to Pavilions"
            >
              <Compass className="w-5 h-5" />
            </button>

            {showFastTravel && (
              <div
                className="absolute top-12 right-0 w-72 p-3 rounded-3xl border shadow-2xl hw-popover z-50 select-none space-y-1.5"
                style={{
                  background: THEME.colors.glass.bgElevated,
                  borderColor: THEME.colors.glass.border,
                  backdropFilter: "blur(24px)",
                  boxShadow: THEME.colors.glass.shadow,
                }}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Fast Travel GPS
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">5 STATIONS</span>
                </div>

                {STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      onTeleport(station.id);
                      setShowFastTravel(false);
                    }}
                    className="w-full p-2.5 rounded-2xl text-left transition-all border flex items-center gap-2.5 group cursor-pointer hover:scale-102 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        background: `${station.color}20`,
                        border: `1px solid ${station.color}40`,
                      }}
                    >
                      <StationIcon name={station.iconName} size={14} color={station.color} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-[11px] leading-tight">{station.label}</p>
                      <p className="text-[9px] text-slate-400 truncate">{station.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Rain & Weather Toggle Quick Button */}
          <button
            onClick={dayNight.toggleRain}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer"
            style={{
              background: dayNight.isRaining
                ? "linear-gradient(135deg, rgba(2, 132, 199, 0.4), rgba(3, 105, 161, 0.9))"
                : THEME.colors.glass.bg,
              borderColor: dayNight.isRaining ? "#38bdf8" : THEME.colors.glass.border,
              backdropFilter: THEME.colors.glass.backdropBlur,
              color: dayNight.isRaining ? "#38bdf8" : "#cbd5e1",
            }}
            title={dayNight.isRaining ? "Rain Mode Active (Click for Clear Sky)" : "Make It Rain"}
          >
            {dayNight.isRaining ? (
              <CloudRain className="w-5 h-5 animate-bounce" />
            ) : (
              <CloudSun className="w-5 h-5" />
            )}
          </button>

          {/* 4. Sound & BGM Settings Icon Button */}
          <SoundController
            isNight={dayNight.isNight}
            isRaining={dayNight.isRaining}
            onToggleRain={dayNight.toggleRain}
          />

          {/* 5. Sovereign Web3 Wallet & Block Graph Button */}
          <button
            onClick={() => setActiveModal("vault_mint")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl active:scale-95 group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(79, 70, 229, 0.9))",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              color: "#f8fafc",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 24px rgba(147, 51, 234, 0.3)",
            }}
            title="Open Sovereign Blockchain Graph & Wallet"
          >
            <Coins className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-mono font-bold tracking-wide">
              {userWallet.balanceETH.toFixed(3)} ETH
            </span>
            <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-200">
              {userWallet.balanceHWAVE.toFixed(0)} HWAVE
            </span>
            <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-purple-200">
              {userWallet.ownedTokens.length} NFTs
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
