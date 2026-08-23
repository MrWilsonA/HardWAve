"use client";

import React, { useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import * as THREE from "three";

import NatureLighting from "@/components/3d/nature/NatureLighting";
import NatureTerrain from "@/components/3d/nature/NatureTerrain";
import LowPolyClouds from "@/components/3d/nature/LowPolyClouds";
import DistantIslands from "@/components/3d/nature/DistantIslands";
import LowPolyProps from "@/components/3d/nature/LowPolyProps";
import InstancedGrass from "@/components/3d/nature/InstancedGrass";
import GrandOak from "@/components/3d/nature/GrandOak";
import WindParticles from "@/components/3d/nature/WindParticles";
import RainWeather from "@/components/3d/nature/RainWeather";
import RedBuggy from "@/components/3d/nature/RedBuggy";
import ParkPavilions, {
  STATIONS,
  StationDef,
} from "@/components/3d/nature/ParkPavilions";
import Navbar from "@/components/ui/Navbar";
import NatureHUD from "@/components/ui/NatureHUD";
import HardWAveLogo from "@/components/ui/HardWAveLogo";
import CustomCursor from "@/components/ui/CustomCursor";
import { useDayNightCycle } from "@/hooks/useDayNightCycle";

export default function Home() {
  const [buggyPos, setBuggyPos] = useState(new THREE.Vector3(0, 0.38, 14.0));
  const [activeStation, setActiveStation] = useState<StationDef | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<THREE.Vector3 | null>(null);
  const [speed, setSpeed] = useState(0);
  const [prevPos, setPrevPos] = useState(new THREE.Vector3());

  // 10-minute real-time day/night cycle
  const dayNight = useDayNightCycle(1.0);

  const handlePositionUpdate = useCallback(
    (pos: THREE.Vector3) => {
      setBuggyPos(pos);
      const dx = pos.x - prevPos.x;
      const dz = pos.z - prevPos.z;
      const spd = Math.sqrt(dx * dx + dz * dz) * 60;
      setSpeed(spd);
      setPrevPos(pos.clone());
    },
    [prevPos]
  );

  const handleTeleport = useCallback((stationId: string) => {
    const station = STATIONS.find((s) => s.id === stationId);
    if (station) {
      setTeleportTarget(
        new THREE.Vector3(
          station.position[0] + 5.5,
          0.5,
          station.position[2] + 5.5
        )
      );
    }
  }, []);

  return (
    <main
      className="w-screen h-screen overflow-hidden relative select-none transition-colors duration-1000"
      style={{
        backgroundColor: dayNight.isNight ? "#020617" : "#fde68a",
      }}
    >
      {/* Sleek Custom Indie Metaverse Mouse Cursor */}
      <CustomCursor />

      {/* Top Header: HardWAve Logo + Clock on Left | Minimized Controls, Fast Travel & Wallet on Right */}
      <Navbar
        dayNight={dayNight}
        activeStation={activeStation}
        onTeleport={handleTeleport}
        speed={speed}
      />

      {/* HUD: Bottom-Left Speedometer, Bottom-Right GPS Radar, Bottom-Center Station Interaction Card */}
      <NatureHUD
        activeStation={activeStation}
        onTeleport={handleTeleport}
        speed={speed}
        buggyPos={buggyPos}
      />

      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 10.5, 15.5], fov: 48, near: 0.5, far: 3500 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: dayNight.isNight ? 1.4 : 1.25,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Dynamic 10-min Day/Night Lighting, Sun, Moon & Stars */}
        <NatureLighting dayNight={dayNight} />

        <Suspense fallback={null}>
          {/* Nature Landscape Terrain with Endless Ocean, Lake & Bridge */}
          <NatureTerrain lampMultiplier={dayNight.lampIntensityMultiplier} />

          {/* Distant Horizon Mountain Ranges, Archipelago & Sea Stacks */}
          <DistantIslands lampMultiplier={dayNight.lampIntensityMultiplier} />

          {/* Low-Poly Fluffy Drifting Clouds */}
          <LowPolyClouds dayNight={dayNight} />

          {/* Grand Oak Centerpiece Tree */}
          <GrandOak />

          {/* 2000+ Dense Wildflower & Grass Meadow with Wind Sway */}
          <InstancedGrass grassCount={2200} flowerCount={350} />

          {/* Cottages, Workshops, Trees, Fences & Lanterns */}
          <LowPolyProps lampMultiplier={dayNight.lampIntensityMultiplier} />

          {/* Drifting Leaves & Atmospheric Pollen Particles */}
          <WindParticles isNight={dayNight.isNight} />

          {/* Dynamic Rain Weather Streaks & Ground Ripples */}
          <RainWeather isRaining={dayNight.isRaining} buggyPos={buggyPos} />

          {/* Red Off-Road Monster Buggy with Smooth Arcade Controls & Orbit Camera */}
          <RedBuggy
            onPositionUpdate={handlePositionUpdate}
            teleportTo={teleportTarget}
            onTeleportDone={() => setTeleportTarget(null)}
            lampMultiplier={dayNight.lampIntensityMultiplier}
          />

          {/* Outdoor Exhibition Pavilions */}
          <ParkPavilions
            buggyPosition={buggyPos}
            lampMultiplier={dayNight.lampIntensityMultiplier}
            onStationEnter={(station) => setActiveStation(station)}
            onStationLeave={() => setActiveStation(null)}
          />

          {/* Atmospheric Golden Fireflies / Starlight Particles */}
          <Sparkles
            count={80}
            scale={45}
            size={dayNight.isNight ? 4.5 : 3.0}
            speed={0.4}
            opacity={dayNight.isNight ? 0.9 : 0.6}
            color={dayNight.isNight ? "#67e8f9" : "#fbbf24"}
          />

          {/* Soft Ground Contact Shadow */}
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={dayNight.isNight ? 0.25 : 0.4}
            scale={90}
            blur={2.0}
            far={10}
            color={dayNight.isNight ? "#020617" : "#78350f"}
          />
        </Suspense>

        {/* Post-Processing Pipeline */}
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={dayNight.isNight ? 0.5 : 0.75}
            luminanceSmoothing={0.4}
            intensity={dayNight.isNight ? 1.1 : 0.65}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={dayNight.isNight ? 0.55 : 0.35} />
          <ToneMapping />
        </EffectComposer>
      </Canvas>

      {/* Intro Loading Overlay – Cyber-Nature Glass */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 pointer-events-none bg-slate-950/95"
        style={{
          animation: "fadeOut 1.2s ease-out 0.8s forwards",
        }}
      >
        <div className="scale-125 mb-2">
          <HardWAveLogo size={56} />
        </div>
        <p className="text-sm font-mono tracking-widest text-emerald-400 font-bold uppercase">
          10-Minute Day & Night Living World
        </p>
      </div>
    </main>
  );
}
