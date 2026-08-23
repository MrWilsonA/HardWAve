"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

export const DAY_NIGHT_DURATION_SECONDS = 600; // 10 minutes full cycle

export interface DayNightState {
  progress: number; // 0.0 to 1.0
  timeString: string; // e.g. "14:30"
  isNight: boolean;
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
  const [progress, setProgress] = useState<number>(0.2); // Start at morning ~10:48 AM
  const progressRef = useRef<number>(0.2);

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

  // Night is when sun is below horizon (sunY < 0, roughly progress between 0.5 and 1.0)
  const isNight = sunY < 2;

  // Day / Night interpolated parameters
  let sunIntensity = Math.max(0, (sunY / sunRadius) * 2.8);
  let ambientIntensity = 0.65;
  let ambientColor = "#fff1d6";
  let fogColor = "#fbd38d";
  let skyRayleigh = 2.2;
  let skyTurbidity = 8;
  let lampIntensityMultiplier = 0.3; // Dim during day

  if (sunY < 10 && sunY >= -5) {
    // Sunset / Golden Hour / Twilight
    sunIntensity = 1.2;
    ambientIntensity = 0.5;
    ambientColor = "#fca5a5";
    fogColor = "#d97706";
    skyRayleigh = 4.5;
    skyTurbidity = 12;
    lampIntensityMultiplier = 1.5;
  } else if (sunY < -5) {
    // Deep Night
    sunIntensity = 0;
    ambientIntensity = 0.22;
    ambientColor = "#1e1b4b";
    fogColor = "#0f172a";
    skyRayleigh = 0.3;
    skyTurbidity = 3;
    lampIntensityMultiplier = 3.5; // High emissive glow at night
  }

  return {
    progress,
    timeString,
    isNight,
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
