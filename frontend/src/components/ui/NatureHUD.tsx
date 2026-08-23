"use client";

import React from "react";
import * as THREE from "three";
import { Gauge, Zap, MapPin, Sparkles } from "lucide-react";
import { STATIONS, StationDef, StationIcon } from "@/components/3d/nature/ParkPavilions";
import { THEME } from "@/theme/designSystem";

interface NatureHUDProps {
  activeStation: StationDef | null;
  onTeleport: (stationId: string) => void;
  speed?: number;
  buggyPos?: THREE.Vector3;
}

export default function NatureHUD({
  activeStation,
  onTeleport,
  speed = 0,
  buggyPos = new THREE.Vector3(0, 0, 0),
}: NatureHUDProps) {
  // Mini-map coordinate mapping
  const mapSize = 120;
  const mapRadius = mapSize / 2;
  const mapScale = (mapRadius - 10) / 48;

  const playerRadarX = mapRadius + buggyPos.x * mapScale;
  const playerRadarY = mapRadius + buggyPos.z * mapScale;

  return (
    <>
      {/* ── Bottom Left: Speedometer & Telemetry ── */}
      <div className="fixed bottom-6 left-4 z-30 select-none pointer-events-none">
        <div
          className="rounded-2xl p-3 border flex items-center gap-3 shadow-2xl"
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
            <span className="block text-[9px] font-bold uppercase -mt-1 text-slate-400 font-mono">
              km/h
            </span>
          </div>

          <div className="h-8 w-px bg-white/15" />

          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-black font-mono px-2 py-0.5 rounded-md"
                style={{
                  background: speed > 0.5 ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 191, 36, 0.2)",
                  border: `1px solid ${speed > 0.5 ? "rgba(74, 222, 128, 0.4)" : "rgba(251, 191, 36, 0.4)"}`,
                  color: speed > 0.5 ? "#4ade80" : "#fbbf24",
                }}
              >
                {speed > 0.5 ? (
                  <>
                    <Zap size={11} /> DRIVE
                  </>
                ) : (
                  <>
                    <Gauge size={11} /> PARK
                  </>
                )}
              </span>
            </div>
            {/* Speed Bar */}
            <div className="w-18 h-1.5 rounded-full mt-1.5 overflow-hidden bg-black/40">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (Math.abs(speed) / 14) * 100)}%`,
                  background: "linear-gradient(90deg, #10b981, #fbbf24)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Right: GPS Radar Mini-Map ── */}
      <div className="fixed bottom-6 right-4 z-30 select-none">
        <div
          className="rounded-3xl p-3 border shadow-2xl relative"
          style={{
            background: THEME.colors.glass.bgElevated,
            borderColor: THEME.colors.glass.border,
            backdropFilter: THEME.colors.glass.backdropBlur,
            boxShadow: THEME.colors.glass.shadow,
          }}
        >
          <div className="text-[10px] font-mono font-bold mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <MapPin size={12} />
              <span>GPS Radar</span>
            </span>
            <span className="text-[9px] text-slate-400">Tap to Jump</span>
          </div>

          {/* Circular Radar Container */}
          <div
            className="w-[120px] h-[120px] rounded-full relative overflow-hidden shadow-inner cursor-pointer"
            style={{
              background: "radial-gradient(circle at center, #064e3b 0%, #022c22 80%, #0f172a 100%)",
              border: "2px solid rgba(74, 222, 128, 0.35)",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left - mapRadius;
              const clickY = e.clientY - rect.top - mapRadius;
              const worldX = clickX / mapScale;
              const worldZ = clickY / mapScale;
              let closest = STATIONS[0];
              let minDist = 999;
              STATIONS.forEach((s) => {
                const d = Math.sqrt((s.position[0] - worldX) ** 2 + (s.position[2] - worldZ) ** 2);
                if (d < minDist) {
                  minDist = d;
                  closest = s;
                }
              });
              onTeleport(closest.id);
            }}
          >
            {/* Radar sweep lines */}
            <div className="absolute inset-0 border border-emerald-500/15 rounded-full pointer-events-none" />
            <div className="absolute inset-4 border border-emerald-500/20 rounded-full pointer-events-none" />

            {/* Lake shape on radar */}
            <div
              className="absolute rounded-full"
              style={{
                left: `${mapRadius + 14 * mapScale - 10}px`,
                top: `${mapRadius + 0 * mapScale - 10}px`,
                width: "20px",
                height: "20px",
                background: "rgba(56, 189, 248, 0.35)",
                border: "1px solid rgba(56, 189, 248, 0.5)",
              }}
            />

            {/* Grand Ring Road indicator */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${mapRadius - 25 * mapScale}px`,
                top: `${mapRadius - 25 * mapScale}px`,
                width: `${50 * mapScale}px`,
                height: `${50 * mapScale}px`,
                border: "1px dashed rgba(251, 191, 36, 0.3)",
              }}
            />

            {/* Center Grand Oak tree node */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${mapRadius}px`,
                top: `${mapRadius}px`,
                background: "#4ade80",
                boxShadow: "0 0 6px #4ade80",
              }}
            />

            {/* Station Nodes */}
            {STATIONS.map((s) => {
              const sx = mapRadius + s.position[0] * mapScale;
              const sy = mapRadius + s.position[2] * mapScale;
              return (
                <div
                  key={s.id}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className="rounded-2xl px-6 py-4 border flex items-center gap-4 shadow-2xl"
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
