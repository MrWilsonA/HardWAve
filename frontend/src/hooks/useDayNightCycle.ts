"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * A full 24-hour in-world day compressed into 10 real minutes, as specified in
 * the HardWAve technical manual (Dawn → Noon → Sunset → Twilight → Midnight).
 */
export const DAY_NIGHT_DURATION_SECONDS = 10 * 60;

/**
 * The cycle advances continuously, but the scene is only re-rendered a few
 * times a second: over a 600 s cycle the sun moves 0.6° in 250 ms, far below
 * the perceptual threshold, while React does 1/15th of the work.
 */
const UI_TICK_MS = 250;

export interface DayNightState {
  progress: number; // 0.0 to 1.0
  timeString: string; // e.g. "14:30"
  isNight: boolean;
  isRaining: boolean;
  toggleRain: () => void;
  sunPosition: [number, number, number];
  moonPosition: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
  ambientColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  skyRayleigh: number;
  skyTurbidity: number;
  lampIntensityMultiplier: number;
}

export function useDayNightCycle(customSpeedMultiplier: number = 1): DayNightState {
  const [progress, setProgress] = useState<number>(0.25); // Start mid-morning
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const progressRef = useRef<number>(0.25);

  useEffect(() => {
    const startedAt = performance.now();
    const startProgress = progressRef.current;

    const advance = () => {
      const elapsedSeconds = (performance.now() - startedAt) / 1000;
      const cycles = (elapsedSeconds / DAY_NIGHT_DURATION_SECONDS) * customSpeedMultiplier;
      progressRef.current = (startProgress + cycles) % 1.0;
      setProgress(progressRef.current);
    };

    const intervalId = window.setInterval(advance, UI_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [customSpeedMultiplier]);

  const toggleRain = useCallback(() => setIsRaining((prev) => !prev), []);

  return useMemo(() => {
    // 24-hour clock derived from progress (0.0 = 06:00 AM)
    const totalHours = (progress * 24 + 6) % 24;
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    // Sun & moon orbital trajectory
    const sunAngle = progress * Math.PI * 2;
    const sunRadius = 60;
    const sunX = Math.cos(sunAngle) * sunRadius;
    const sunY = Math.sin(sunAngle) * sunRadius;
    const sunZ = Math.sin(sunAngle * 0.5) * 30 + 15;

    const isNight = sunY < 2;

    // Daylight defaults
    let sunIntensity = Math.max(0, (sunY / sunRadius) * (isRaining ? 1.2 : 2.8));
    let ambientIntensity = isRaining ? 0.45 : 0.65;
    let ambientColor = isRaining ? "#94a3b8" : "#fff1d6";
    let fogColor = isRaining ? "#475569" : "#cbd5e1";
    let fogNear = isRaining ? 5 : 20;
    let fogFar = isRaining ? 52 : 220;
    let skyRayleigh = isRaining ? 5.5 : 2.2;
    let skyTurbidity = isRaining ? 18 : 8;
    let lampIntensityMultiplier = isRaining ? 1.6 : 0.3;

    if (sunY < 10 && sunY >= -5) {
      // Golden hour & twilight
      sunIntensity = isRaining ? 0.5 : 1.2;
      ambientIntensity = isRaining ? 0.35 : 0.5;
      ambientColor = isRaining ? "#64748b" : "#fca5a5";
      fogColor = isRaining ? "#334155" : "#d97706";
      fogNear = isRaining ? 5 : 15;
      fogFar = isRaining ? 50 : 180;
      skyRayleigh = isRaining ? 6.0 : 4.5;
      skyTurbidity = 14;
      lampIntensityMultiplier = 2.0;
    } else if (sunY < -5) {
      // Deep midnight
      sunIntensity = 0;
      ambientIntensity = isRaining ? 0.16 : 0.22;
      ambientColor = isRaining ? "#0f172a" : "#1e1b4b";
      fogColor = isRaining ? "#090d16" : "#0f172a";
      fogNear = isRaining ? 5 : 15;
      fogFar = isRaining ? 48 : 170;
      skyRayleigh = 0.3;
      skyTurbidity = 4;
      lampIntensityMultiplier = 3.8;
    }

    return {
      progress,
      timeString,
      isNight,
      isRaining,
      toggleRain,
      sunPosition: [sunX, sunY, sunZ] as [number, number, number],
      moonPosition: [-sunX, -sunY, -sunZ] as [number, number, number],
      sunIntensity,
      ambientIntensity,
      ambientColor,
      fogColor,
      fogNear,
      fogFar,
      skyRayleigh,
      skyTurbidity,
      lampIntensityMultiplier,
    };
  }, [progress, isRaining, toggleRain]);
}
