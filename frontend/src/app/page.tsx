"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, ContactShadows, AdaptiveDpr, Preload } from "@react-three/drei";
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
import ParkPavilions, { STATIONS } from "@/components/3d/nature/ParkPavilions";
import Navbar from "@/components/ui/Navbar";
import NatureHUD from "@/components/ui/NatureHUD";
import CustomCursor from "@/components/ui/CustomCursor";
import { useDayNightCycle } from "@/hooks/useDayNightCycle";
import { useHardwareStore, ModalId } from "@/store/hardwareStore";
import { useBlockchainEngine } from "@/store/blockchainEngine";
import { useWorldTelemetry } from "@/store/worldTelemetry";

// Web3 & blockchain interactive modals
import GPUInspectorModal from "@/components/modals/GPUInspectorModal";
import BlockchainVaultModal from "@/components/modals/BlockchainVaultModal";
import ServiceWorkshopModal from "@/components/modals/ServiceWorkshopModal";
import QRScannerModal from "@/components/modals/QRScannerModal";
import HardwareGalleryModal from "@/components/modals/HardwareGalleryModal";
import TutorialModal from "@/components/modals/TutorialModal";

/** Which pavilion opens which Web3 experience. */
const STATION_MODALS: Record<string, ModalId> = {
  gpu_lab: "gpu_inspector",
  blockchain_vault: "vault_mint",
  service_workshop: "service_workshop",
  qr_gate: "qr_scanner",
  showroom: "gallery",
};

export default function NatureIslandPage() {
  const dayNight = useDayNightCycle();
  const { isNight, isRaining, lampIntensityMultiplier } = dayNight;

  const [teleportTarget, setTeleportTarget] = useState<THREE.Vector3 | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const nearStationId = useWorldTelemetry((s) => s.nearStationId);
  const activeStation = useMemo(
    () => STATIONS.find((s) => s.id === nearStationId) ?? null,
    [nearStationId]
  );

  const { activeModal, setActiveModal, setActiveUnit, units } = useHardwareStore();

  const handleTeleport = useCallback((stationId: string) => {
    const station = STATIONS.find((s) => s.id === stationId);
    if (!station) return;
    setTeleportTarget(
      new THREE.Vector3(station.position[0] + 5.5, 0.5, station.position[2] + 5.5)
    );
  }, []);

  const handleTeleportDone = useCallback(() => setTeleportTarget(null), []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  }, []);

  // Quick reset buggy to central rotary spawn point
  const handleResetVehicle = useCallback(() => {
    setTeleportTarget(new THREE.Vector3(0, 0.5, 14.0));
    showToast("🏎️ Posisi Mobil Berhasil Direset ke Pusat Pulau!");
  }, [showToast]);

  // Full reset blockchain and hardware state
  const handleResetBlockchain = useCallback(() => {
    useBlockchainEngine.getState().resetChain();
    useHardwareStore.getState().resetRegistry();
    showToast("⚡ Seluruh Data Blockchain & Game Berhasil Direset!");
  }, [showToast]);

  // Open the pavilion's corresponding Web3 modal
  const handleStationInteract = useCallback(() => {
    if (!activeStation) return;

    if (activeStation.id === "gpu_lab") {
      const gpu = units.find((u) => u.category === "GPU");
      if (gpu) setActiveUnit(gpu);
    }

    const modal = STATION_MODALS[activeStation.id];
    if (modal) setActiveModal(modal);
  }, [activeStation, setActiveModal, setActiveUnit, units]);

  // 'E' opens station; 'R' resets buggy; 'Escape' closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeModal) setActiveModal(null);
        if (showTutorial) setShowTutorial(false);
        return;
      }
      const typing = (e.target as HTMLElement | null)?.tagName;
      if (typing === "INPUT" || typing === "TEXTAREA" || typing === "SELECT") return;

      if ((e.key === "e" || e.key === "E") && activeStation && !activeModal && !showTutorial) {
        handleStationInteract();
      }

      if ((e.key === "r" || e.key === "R") && !activeModal && !showTutorial) {
        handleResetVehicle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStation, activeModal, showTutorial, handleStationInteract, setActiveModal, handleResetVehicle]);

  // The static island only needs rebuilding when the lamps change brightness,
  // not on every clock tick, so it is memoized against that single value.
  const staticWorld = useMemo(
    () => (
      <>
        <NatureTerrain lampMultiplier={lampIntensityMultiplier} />
        <DistantIslands lampMultiplier={lampIntensityMultiplier} />
        <GrandOak />
        <InstancedGrass />
        <LowPolyProps lampMultiplier={lampIntensityMultiplier} />
        <ParkPavilions lampMultiplier={lampIntensityMultiplier} />
      </>
    ),
    [lampIntensityMultiplier]
  );

  return (
    <main
      className="w-screen h-screen overflow-hidden relative select-none transition-colors duration-1000"
      style={{ backgroundColor: isNight ? "#020617" : "#fde68a" }}
    >
      {/* Sleek custom indie-metaverse cursor */}
      <CustomCursor />

      {/* Header: logo & world clock on the left; tutorial, reset, controls, fast travel and wallet on the right */}
      <Navbar
        dayNight={dayNight}
        onTeleport={handleTeleport}
        onOpenTutorial={() => setShowTutorial(true)}
        onResetVehicle={handleResetVehicle}
      />

      {/* Speedometer, quick tutorial/reset pill, GPS radar mini-map and interactive station card */}
      <NatureHUD
        activeStation={activeStation}
        onTeleport={handleTeleport}
        onInteract={handleStationInteract}
        onOpenTutorial={() => setShowTutorial(true)}
        onResetVehicle={handleResetVehicle}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none select-none">
          <div className="px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-500/40 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 3D canvas world */}
      <Canvas
        shadows="percentage"
        camera={{ position: [0, 10.5, 15.5], fov: 48, near: 0.5, far: 3500 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNight ? 1.4 : 1.25,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Dynamic 10-min day/night lighting, sun, moon & stars */}
        <NatureLighting dayNight={dayNight} />

        <Suspense fallback={null}>
          {/* Terrain, horizon islands, world tree, meadow, props & pavilions */}
          {staticWorld}

          {/* Low-poly fluffy drifting clouds */}
          <LowPolyClouds dayNight={dayNight} />

          {/* Drifting leaves & atmospheric pollen */}
          <WindParticles isNight={isNight} />

          {/* Dynamic rain streaks & ground ripples */}
          <RainWeather isRaining={isRaining} />

          {/* Red off-road buggy with arcade controls & orbit camera */}
          <RedBuggy
            teleportTo={teleportTarget}
            onTeleportDone={handleTeleportDone}
            lampMultiplier={lampIntensityMultiplier}
            controlsEnabled={!activeModal && !showTutorial}
          />

          {/* Golden fireflies by day, starlight motes at night */}
          <Sparkles
            count={80}
            scale={45}
            size={isNight ? 4.5 : 3.0}
            speed={0.5}
            color={isNight ? "#38bdf8" : "#fbbf24"}
          />

          {/* Soft ground contact ambient occlusion */}
          <ContactShadows
            position={[0, 0.22, 0]}
            opacity={0.35}
            scale={65}
            blur={2.4}
            far={10}
            resolution={1024}
            color="#0f172a"
          />

          <Preload all />
        </Suspense>

        {/* Cinematic postprocessing */}
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={isNight ? 0.5 : 0.75}
            luminanceSmoothing={0.4}
            intensity={isNight ? 1.1 : 0.65}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={isNight ? 0.55 : 0.35} />
          <ToneMapping />
        </EffectComposer>

        {/* Drops resolution instead of frames when the GPU is under pressure */}
        <AdaptiveDpr pixelated />
      </Canvas>

      {/* ── 5 interactive Web3 & blockchain modals ── */}
      <GPUInspectorModal />
      <BlockchainVaultModal />
      <ServiceWorkshopModal />
      <QRScannerModal />
      <HardwareGalleryModal />

      {/* ── Interactive Tutorial & Reset Modal ── */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onResetVehicle={handleResetVehicle}
        onResetBlockchain={handleResetBlockchain}
      />
    </main>
  );
}
