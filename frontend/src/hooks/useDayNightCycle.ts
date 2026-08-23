"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// 1 Real Minute = 1 In-Game Hour (Full 24-hour cycle = 24 minutes = 1440 seconds)
export const DAY_NIGHT_DURATION_SECONDS = 24 * 60;

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
  skyRayleigh: number;
  skyTurbidity: number;
  lampIntensityMultiplier: number;
}

export function useDayNightCycle(customSpeedMultiplier: number = 1): DayNightState {
  const [progress, setProgress] = useState<number>(0.25); // Start at morning ~12:00 PM
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const progressRef = useRef<number>(0.25);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      const deltaSeconds = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const increment = (deltaSeconds / DAY_NIGHT_DURATION_SECONDS) * customSpeedMultiplier;
      progressRef.current = (progressRef.current + increment) % 1.0;
      setProgress(progressRef.current);

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [customSpeedMultiplier]);

  const toggleRain = useCallback(() => {
    setIsRaining((prev) => !prev);
  }, []);

  // Calculate 24-hour time from progress (0 = 06:00 AM)
  const totalHours = (progress * 24 + 6) % 24;
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

  // Sun & Moon orbital trajectory (circular orbit around X & Y axes)
  const sunAngle = progress * Math.PI * 2;
  const sunRadius = 60;
  const sunX = Math.cos(sunAngle) * sunRadius;
  const sunY = Math.sin(sunAngle) * sunRadius;
  const sunZ = Math.sin(sunAngle * 0.5) * 30 + 15;

  const sunPosition: [number, number, number] = [sunX, sunY, sunZ];
  const moonPosition: [number, number, number] = [-sunX, -sunY, -sunZ];

  // Night is when sun is below horizon (sunY < 2)
  const isNight = sunY < 2;

  // Day / Night interpolated parameters
  let sunIntensity = Math.max(0, (sunY / sunRadius) * (isRaining ? 1.4 : 2.8));
  let ambientIntensity = isRaining ? 0.45 : 0.65;
  let ambientColor = isRaining ? "#cbd5e1" : "#fff1d6";
  let fogColor = isRaining ? "#64748b" : "#fbd38d";
  let skyRayleigh = isRaining ? 5.5 : 2.2;
  let skyTurbidity = isRaining ? 18 : 8;
  let lampIntensityMultiplier = isRaining ? 1.6 : 0.3;

  if (sunY < 10 && sunY >= -5) {
    // Sunset / Golden Hour / Twilight
    sunIntensity = isRaining ? 0.6 : 1.2;
    ambientIntensity = isRaining ? 0.35 : 0.5;
    ambientColor = isRaining ? "#94a3b8" : "#fca5a5";
    fogColor = isRaining ? "#475569" : "#d97706";
    skyRayleigh = isRaining ? 6.0 : 4.5;
    skyTurbidity = 14;
    lampIntensityMultiplier = 2.0;
  } else if (sunY < -5) {
    // Deep Night
    sunIntensity = 0;
    ambientIntensity = isRaining ? 0.16 : 0.22;
    ambientColor = isRaining ? "#0f172a" : "#1e1b4b";
    fogColor = isRaining ? "#020617" : "#0f172a";
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
    sunPosition,
    moonPosition,
    sunIntensity,
    ambientIntensity,
    ambientColor,
    fogColor,
    skyRayleigh,
    skyTurbidity,
    lampIntensityMultiplier,
  };
}
