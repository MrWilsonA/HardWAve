"use client";

import React from "react";
import { Gauge, Zap, MapPin, Sparkles, BookOpen, RotateCcw } from "lucide-react";
import { STATIONS, StationDef, StationIcon } from "@/components/3d/nature/ParkPavilions";
import { THEME } from "@/theme/designSystem";
import { useWorldTelemetry } from "@/store/worldTelemetry";

interface NatureHUDProps {
  activeStation: StationDef | null;
  onTeleport: (stationId: string) => void;
  onInteract?: () => void;
  onOpenTutorial?: () => void;
  onResetVehicle?: () => void;
}

// Mini-map coordinate mapping (world radius 48m onto a 120px radar)
const MAP_SIZE = 120;
const MAP_RADIUS = MAP_SIZE / 2;
const MAP_SCALE = (MAP_RADIUS - 10) / 48;

export default function NatureHUD({
  activeStation,
  onTeleport,
  onInteract,
  onOpenTutorial,
  onResetVehicle,
}: NatureHUDProps) {
  // Telemetry is mirrored at ~10 Hz, so the HUD stays live without pulling the
  // whole page into the 60 fps render loop.
  const x = useWorldTelemetry((s) => s.x);
  const z = useWorldTelemetry((s) => s.z);
  const speed = useWorldTelemetry((s) => s.speed);

  const mapSize = MAP_SIZE;
  const mapRadius = MAP_RADIUS;
  const mapScale = MAP_SCALE;

  const playerRadarX = mapRadius + x * mapScale;
  const playerRadarY = mapRadius + z * mapScale;

  return (
    <>
      {/* ── Bottom Left: Speedometer, Telemetry & Quick Action Pill ── */}
      <div className="fixed bottom-6 left-4 z-30 select-none pointer-events-none flex flex-col gap-2">
        {/* Quick Tutorial & Reset Buttons Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer bg-black/60 hover:bg-black/80 text-amber-300 border-amber-500/40 hover:border-amber-400 backdrop-blur-xl"
              title="Buka Panduan Tutorial Lengkap"
            >
              <BookOpen size={13} className="text-amber-400" />
              <span>Tutorial</span>
            </button>
          )}

          {onResetVehicle && (
            <button
              onClick={onResetVehicle}
              className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all shadow-xl active:scale-95 cursor-pointer bg-black/60 hover:bg-black/80 text-purple-300 border-purple-500/40 hover:border-purple-400 backdrop-blur-xl"
              title="Reset Mobil ke Pusat (Shortcut: R)"
            >
              <RotateCcw size={13} className="text-purple-400" />
              <span>Reset (R)</span>
            </button>
          )}
        </div>

        {/* Speedometer Card */}
        <div
          className="rounded-2xl p-3 border flex items-center gap-3 shadow-2xl pointer-events-auto"
          style={{
            background: THEME.colors.glass.bgElevated,
            borderColor: THEME.colors.glass.border,
            backdropFilter: THEME.colors.glass.backdropBlur,
            boxShadow: THEME.colors.glass.shadow,
          }}
        >
          <div className="text-right">
            <span className="text-2xl font-mono font-black tracking-tighter text-amber-300">
              {Math.abs(Math.round(speed))}
            </span>
            <span className="block text-[8px] font-mono text-slate-400 -mt-1 tracking-widest font-bold">
              KM/H
            </span>
          </div>

          <div className="w-[1px] h-7 bg-white/10" />

          <div className="space-y-0.5 text-slate-400 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <Zap size={11} className="text-amber-400" />
              <span>RWD Buggy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={11} className="text-emerald-400" />
              <span className="text-[9px]">
                X: {x.toFixed(1)} Z: {z.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Right: Circular Mini-Map Radar ── */}
      <div className="fixed bottom-6 right-4 z-30 select-none pointer-events-auto">
        <div
          className="rounded-3xl p-2 border shadow-2xl relative overflow-hidden"
          style={{
            background: THEME.colors.glass.bgElevated,
            borderColor: THEME.colors.glass.border,
            backdropFilter: THEME.colors.glass.backdropBlur,
            boxShadow: THEME.colors.glass.shadow,
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{
              width: `${mapSize}px`,
              height: `${mapSize}px`,
              background: "radial-gradient(circle, #064e3b 0%, #022c22 75%, #0f172a 100%)",
            }}
          >
            {/* Grand Boulevard Ring */}
            <div
              className="absolute rounded-full border border-amber-400/25 pointer-events-none"
              style={{
                left: `${mapRadius - 25 * mapScale}px`,
                top: `${mapRadius - 25 * mapScale}px`,
                width: `${50 * mapScale}px`,
                height: `${50 * mapScale}px`,
              }}
            />

            {/* Central Rotary */}
            <div
              className="absolute rounded-full border border-amber-400/40 pointer-events-none"
              style={{
                left: `${mapRadius - 6.5 * mapScale}px`,
                top: `${mapRadius - 6.5 * mapScale}px`,
                width: `${13 * mapScale}px`,
                height: `${13 * mapScale}px`,
              }}
            />

            {/* Cross Roads */}
            <div
              className="absolute bg-amber-400/15 pointer-events-none"
              style={{
                left: `${mapRadius - 1.2}px`,
                top: "6px",
                width: "2.4px",
                height: `${mapSize - 12}px`,
              }}
            />
            <div
              className="absolute bg-amber-400/15 pointer-events-none"
              style={{
                top: `${mapRadius - 1.2}px`,
                left: "6px",
                height: "2.4px",
                width: `${mapSize - 12}px`,
              }}
            />

            {/* East Lake (center: 14, 0, radius: 6.0) */}
            <div
              className="absolute rounded-full bg-cyan-500/40 border border-cyan-400/50 pointer-events-none"
              style={{
                left: `${mapRadius + 14 * mapScale - 6 * mapScale}px`,
                top: `${mapRadius - 6 * mapScale}px`,
                width: `${12 * mapScale}px`,
                height: `${12 * mapScale}px`,
              }}
            />

            {/* 5 Hardware Pavilion Dots */}
            {STATIONS.map((s) => {
              const sx = mapRadius + s.position[0] * mapScale;
              const sy = mapRadius + s.position[2] * mapScale;
              return (
                <div
                  key={s.id}
                  onClick={() => onTeleport(s.id)}
                  className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-150"
                  style={{
                    left: `${sx}px`,
                    top: `${sy}px`,
                    backgroundColor: s.color,
                    boxShadow: `0 0 6px ${s.color}`,
                  }}
                  title={s.label}
                />
              );
            })}

            {/* Player Buggy Indicator */}
            <div
              className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${Math.max(6, Math.min(mapSize - 6, playerRadarX))}px`,
                top: `${Math.max(6, Math.min(mapSize - 6, playerRadarY))}px`,
                background: "#ef4444",
                border: "2px solid #ffffff",
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.9)",
                transition: "all 75ms",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Center: Station Interactive Banner ── */}
      {activeStation && (
        <div
          onClick={onInteract}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hw-slide-up cursor-pointer active:scale-95 transition-transform"
        >
          <div
            className="rounded-2xl px-6 py-4 border flex items-center gap-4 shadow-2xl hover:scale-102 transition-all"
            style={{
              background: THEME.colors.glass.bgElevated,
              borderColor: activeStation.color,
              backdropFilter: "blur(20px)",
              boxShadow: `0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px ${activeStation.color}40`,
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
              style={{
                background: `${activeStation.color}25`,
                border: `1px solid ${activeStation.color}60`,
              }}
            >
              <StationIcon name={activeStation.iconName} size={26} color={activeStation.color} />
            </div>

            <div>
              <p className="text-base font-black tracking-wide" style={{ color: activeStation.color }}>
                {activeStation.label}
              </p>
              <p className="text-xs font-medium text-slate-300">{activeStation.description}</p>
              <p className="text-[11px] mt-1.5 font-mono font-bold flex items-center gap-1.5 text-amber-300">
                <Sparkles size={12} className="text-amber-400" />
                <span>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">
                    E
                  </kbd>{" "}
                  or click to inspect
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
