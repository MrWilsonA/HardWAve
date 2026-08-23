"use client";

import React from "react";
import { Sky, Stars } from "@react-three/drei";
import { DayNightState } from "@/hooks/useDayNightCycle";

/* ───────────────────────────────────────────
   Atmospheric Day/Night Lighting & Celestial Bodies
   – Glowing 3D Sun & Luminous Moon in orbital trajectory
   – 5000+ Twinkling Night Starfield with deep parallax
   – Rich sunset/twilight hues and atmospheric horizon fog
   ─────────────────────────────────────────── */

interface NatureLightingProps {
  dayNight: DayNightState;
}

export default function NatureLighting({ dayNight }: NatureLightingProps) {
  const {
    isNight,
    sunPosition,
    moonPosition,
    sunIntensity,
    ambientIntensity,
    ambientColor,
    skyRayleigh,
    skyTurbidity,
  } = dayNight;

  return (
    <>
      {/* Sky with dynamic rayleigh and turbidity */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.5}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.82}
        rayleigh={skyRayleigh}
        turbidity={skyTurbidity}
      />

      {/* ── 3D Glowing Sun (Daytime) ── */}
      {!isNight && (
        <group position={sunPosition}>
          {/* Sun Core */}
          <mesh>
            <sphereGeometry args={[4.5, 16, 16]} />
            <meshBasicMaterial color="#fffbeb" />
          </mesh>
          {/* Sun Glowing Corona Aura */}
          <mesh scale={1.3}>
            <sphereGeometry args={[4.5, 16, 16]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.35} />
          </mesh>
        </group>
      )}

      {/* ── 3D Glowing Luminous Moon (Nighttime) ── */}
      {isNight && (
        <group position={moonPosition}>
          {/* Moon Core */}
          <mesh>
            <sphereGeometry args={[4.2, 16, 16]} />
            <meshBasicMaterial color="#f1f5f9" />
          </mesh>
          {/* Moon Blue Halo Glow */}
          <mesh scale={1.25}>
            <sphereGeometry args={[4.2, 16, 16]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
          </mesh>
        </group>
      )}

      {/* ── Deep Twinkling Starfield (Night) ── */}
      {isNight && (
        <>
          <Stars
            radius={140}
            depth={80}
            count={5000}
            factor={5.0}
            saturation={0.6}
            fade
            speed={1.8}
          />
          {/* Secondary dense nebula background layer */}
          <Stars
            radius={180}
            depth={50}
            count={2500}
            factor={3.5}
            saturation={0.8}
            fade
            speed={0.8}
          />
        </>
      )}

      {/* Dynamic Ambient Fill */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* Main Golden Sunlight (Daytime) */}
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color="#fff1d6"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={180}
        shadow-camera-left={-58}
        shadow-camera-right={58}
        shadow-camera-top={58}
        shadow-camera-bottom={-58}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
      />

      {/* Moonlight (Nighttime) */}
      {isNight && (
        <directionalLight
          position={moonPosition}
          intensity={0.75}
          color="#93c5fd"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={180}
          shadow-camera-left={-58}
          shadow-camera-right={58}
          shadow-camera-top={58}
          shadow-camera-bottom={-58}
          shadow-bias={-0.0003}
        />
      )}

      {/* Soft Horizon Fill Light */}
      <directionalLight
        position={[-30, 20, -30]}
        intensity={isNight ? 0.25 : 0.45}
        color={isNight ? "#60a5fa" : "#fed7aa"}
      />

      {/* Ground Bounce Light */}
      <hemisphereLight
        color={isNight ? "#1e293b" : "#fff1d6"}
        groundColor={isNight ? "#020617" : "#78350f"}
        intensity={isNight ? 0.35 : 0.65}
      />

      {/* Horizon Depth Fog – Crisp during clear days, thick & dense during rain */}
      <fog
        attach="fog"
        args={[
          dayNight.fogColor,
          dayNight.fogNear,
          dayNight.fogFar,
        ]}
      />

      {/* Dynamic Rain Overcast Sky Backdrop */}
      {dayNight.isRaining && (
        <color attach="background" args={[dayNight.fogColor]} />
      )}
    </>
  );
}
