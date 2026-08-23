"use client";

import { create } from "zustand";
import * as THREE from "three";

/**
 * World telemetry — the bridge between the 60 fps render loop and React.
 *
 * The buggy's transform is needed by both the 3D scene (rain, pavilions,
 * camera) and the DOM HUD. Routing it through React state on every frame
 * re-rendered the whole page 60 times a second. Instead:
 *
 *   • `liveTelemetry` is a plain mutable object written every frame and read
 *     inside `useFrame` — zero React work, zero allocations.
 *   • The zustand store mirrors it at a throttled rate for the HUD, which
 *     cannot perceive updates faster than a few times per second anyway.
 */

/** Mutable per-frame state. Never read this during render — only in `useFrame`. */
export const liveTelemetry = {
  position: new THREE.Vector3(0, 0.38, 14.0),
  rotation: Math.PI,
  speed: 0,
};

/** HUD refresh rate for mirrored telemetry (ms). */
const HUD_SYNC_INTERVAL = 100;

export type StationProximity = { id: string } | null;

interface WorldTelemetryState {
  /** Buggy position, mirrored at ~10 Hz for DOM consumers. */
  x: number;
  z: number;
  /** Signed speed in km/h-ish arcade units. */
  speed: number;
  /** Id of the pavilion the buggy is currently parked inside, if any. */
  nearStationId: string | null;

  syncFromLive: () => void;
  setNearStation: (id: string | null) => void;
}

export const useWorldTelemetry = create<WorldTelemetryState>()((set, get) => ({
  x: liveTelemetry.position.x,
  z: liveTelemetry.position.z,
  speed: 0,
  nearStationId: null,

  syncFromLive: () => {
    const { x, z } = liveTelemetry.position;
    const speed = liveTelemetry.speed;
    const prev = get();

    // Skip the store write (and the HUD re-render) when nothing moved.
    if (
      Math.abs(prev.x - x) < 0.01 &&
      Math.abs(prev.z - z) < 0.01 &&
      Math.abs(prev.speed - speed) < 0.05
    ) {
      return;
    }
    set({ x, z, speed });
  },

  setNearStation: (id) => {
    if (get().nearStationId === id) return;
    set({ nearStationId: id });
  },
}));

/**
 * Drives the throttled mirror. Call once from a component inside the R3F
 * canvas; returns the elapsed-time gate used by `useFrame`.
 */
export function createHudSyncGate() {
  let last = 0;
  return (elapsedMs: number) => {
    if (elapsedMs - last < HUD_SYNC_INTERVAL) return false;
    last = elapsedMs;
    return true;
  };
}
