"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  Gamepad2,
  Compass,
  X,
  Sun,
  Moon,
  Navigation,
  Sparkles,
  CloudRain,
  CloudSun,
} from "lucide-react";
import HardWAveLogo from "@/components/ui/HardWAveLogo";
import SoundController from "@/components/ui/SoundController";
import { STATIONS, StationDef, StationIcon } from "@/components/3d/nature/ParkPavilions";
import { DayNightState } from "@/hooks/useDayNightCycle";
import { THEME } from "@/theme/designSystem";

interface NavbarProps {
  dayNight: DayNightState;
  activeStation: StationDef | null;
  onTeleport: (stationId: string) => void;
  speed?: number;
}

export default function Navbar({ dayNight, activeStation, onTeleport, speed = 0 }: NavbarProps) {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [showFastTravel, setShowFastTravel] = useState(false);

  const { timeString, isNight, progress } = dayNight;

  const toggleConnect = () => {
    if (!connected) {
      setConnected(true);
      setAccount("0x71C...4a9B");
    } else {
      setConnected(false);
      setAccount(null);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none p-3 pointer-events-none">
      <div className="w-full flex items-center justify-between pointer-events-auto px-1">
        {/* ── Top Left: HardWAve Logo + Compact Day/Night Clock (Directly in Corner) ── */}
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-transform active:scale-95">
            <HardWAveLogo size={40} />
          </Link>

          {/* Compact Minimal Clock Widget */}
          <div
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border shadow-xl transition-all"
            style={{
              background: THEME.colors.glass.bg,
              borderColor: isNight ? "rgba(167, 139, 250, 0.3)" : THEME.colors.glass.borderGold,
              backdropFilter: THEME.colors.glass.backdropBlur,
              boxShadow: THEME.colors.glass.shadow,
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: isNight
                  ? "linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(49, 46, 129, 0.9))"
                  : "linear-gradient(135deg, rgba(180, 83, 9, 0.8), rgba(245, 158, 11, 0.9))",
                border: `1px solid ${isNight ? "rgba(167, 139, 250, 0.4)" : "rgba(251, 191, 36, 0.5)"}`,
              }}
            >
              {isNight ? (
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black tracking-wider text-white">
                  {timeString}
                </span>
                <span
                  className="text-[9px] uppercase font-bold tracking-wider"
                  style={{ color: isNight ? "#a78bfa" : "#fbbf24" }}
                >
                  {isNight ? "Night" : "Day"}
                </span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-16 rounded-full h-1 overflow-hidden bg-black/40 mt-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress * 100).toFixed(0)}%`,
                    background: "linear-gradient(90deg, #10b981, #fbbf24, #8b5cf6)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Right: Minimized Icon Controls & Wallet ── */}
        <div className="flex items-center gap-2.5 relative">
          {/* 1. Controls Guide Icon Button (Left of Fast Travel) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowControls(!showControls);
                if (showFastTravel) setShowFastTravel(false);
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer"
              style={{
                background: showControls
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 78, 59, 0.95))"
                  : THEME.colors.glass.bg,
                borderColor: showControls ? "#4ade80" : THEME.colors.glass.border,
                backdropFilter: THEME.colors.glass.backdropBlur,
                color: showControls ? "#4ade80" : "#cbd5e1",
              }}
              title="Drive Controls Guide"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>

            {/* Controls Floating Card */}
            {showControls && (
              <div
                className="absolute top-12 right-0 w-[230px] p-4 rounded-3xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 select-none"
                style={{
                  background: THEME.colors.glass.bgElevated,
                  borderColor: THEME.colors.glass.border,
                  backdropFilter: "blur(24px)",
                  boxShadow: THEME.colors.glass.shadow,
                }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Controls Guide
                    </span>
                  </div>
                  <button
                    onClick={() => setShowControls(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-[96px] mx-auto my-2">
                  <div />
                  <kbd className="rounded-xl text-center text-xs py-1.5 font-mono font-bold bg-white/10 border border-white/20 text-white shadow-inner">
                    W
                  </kbd>
                  <div />
                  {["A", "S", "D"].map((key) => (
                    <kbd
                      key={key}
                      className="rounded-xl text-center text-xs py-1.5 font-mono font-bold bg-white/10 border border-white/20 text-white shadow-inner"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>

                <div className="space-y-1.5 text-[10px] font-mono text-slate-300 mt-3 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Handbrake</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-bold border border-white/15">
                      SPACE
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">360° Orbit</span>
                    <span className="text-emerald-400 font-bold">Hold Drag</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Zoom Cam</span>
                    <span className="text-emerald-400 font-bold">Scroll Wheel</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Fast Travel Icon Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFastTravel(!showFastTravel);
                if (showControls) setShowControls(false);
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer"
              style={{
                background: showFastTravel
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 78, 59, 0.95))"
                  : THEME.colors.glass.bg,
                borderColor: showFastTravel ? "#4ade80" : THEME.colors.glass.border,
                backdropFilter: THEME.colors.glass.backdropBlur,
                color: showFastTravel ? "#4ade80" : "#cbd5e1",
              }}
              title="Fast Travel Menu"
            >
              <Compass className="w-5 h-5" />
            </button>

            {/* Fast Travel Floating Drawer */}
            {showFastTravel && (
              <div
                className="absolute top-12 right-0 w-[240px] p-3 rounded-3xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 select-none space-y-1.5"
                style={{
                  background: THEME.colors.glass.bgElevated,
                  borderColor: THEME.colors.glass.border,
                  backdropFilter: "blur(24px)",
                  boxShadow: THEME.colors.glass.shadow,
                }}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Fast Travel
                    </span>
                  </div>
                  <button
                    onClick={() => setShowFastTravel(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {STATIONS.map((station) => {
                  const isActive = activeStation?.id === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => {
                        onTeleport(station.id);
                        setShowFastTravel(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all text-left active:scale-95 group cursor-pointer"
                      style={{
                        borderLeft: `3px solid ${station.color}`,
                        color: isActive ? station.color : "#e2e8f0",
                        background: isActive ? `${station.color}25` : "rgba(255, 255, 255, 0.03)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${station.color}15`)}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isActive
                          ? `${station.color}25`
                          : "rgba(255, 255, 255, 0.03)")
                      }
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
                  );
                })}
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
            speed={speed}
            isRaining={dayNight.isRaining}
            onToggleRain={dayNight.toggleRain}
          />

          {/* 5. Connect Wallet Button */}
          <button
            onClick={toggleConnect}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl active:scale-95 group cursor-pointer"
            style={{
              background: connected
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.9))"
                : "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))",
              border: `1px solid ${connected ? "rgba(74, 222, 128, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
              color: "#f8fafc",
              backdropFilter: "blur(16px)",
              boxShadow: THEME.colors.glass.shadow,
            }}
          >
            {connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Wallet className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            )}
            <span className="font-mono tracking-wide hidden md:inline">
              {connected ? account : "Connect"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
