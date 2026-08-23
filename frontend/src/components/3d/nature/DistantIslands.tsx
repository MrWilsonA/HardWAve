"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ───────────────────────────────────────────
   Distant Mountains, Archipelago Islands & Sea Stacks
   – Grand mountain peaks & snow-capped massifs on distant horizon (r: 120 to 280)
   – Distant lush tropical islands with pine silhouettes
   – Misty sea stacks & rock pillars jutting out of the ocean
   – Animated distant lighthouse with rotating beacon
   ─────────────────────────────────────────── */

interface MountainData {
  pos: [number, number, number];
  radius: number;
  height: number;
  segments: number;
  color: string;
  hasSnow?: boolean;
}

interface IslandData {
  pos: [number, number, number];
  radius: number;
  height: number;
  trees: [number, number, number][];
}

export default function DistantIslands({ lampMultiplier = 1 }: { lampMultiplier?: number }) {
  const beaconRef = useRef<THREE.SpotLight>(null);

  // Distant majestic mountain massifs on the horizon
  const mountains = useMemo<MountainData[]>(
    () => [
      // North-West Grand Mountain Range (Backdrop)
      { pos: [-160, 0, -180], radius: 45, height: 95, segments: 7, color: "#334155", hasSnow: true },
      { pos: [-120, 0, -220], radius: 38, height: 80, segments: 6, color: "#475569", hasSnow: true },
      { pos: [-200, 0, -140], radius: 40, height: 75, segments: 6, color: "#334155", hasSnow: false },
      { pos: [-90, 0, -190], radius: 28, height: 55, segments: 5, color: "#475569", hasSnow: false },

      // North-East Mountain Peaks
      { pos: [150, 0, -170], radius: 42, height: 88, segments: 6, color: "#334155", hasSnow: true },
      { pos: [190, 0, -140], radius: 35, height: 70, segments: 5, color: "#475569", hasSnow: false },
      { pos: [110, 0, -210], radius: 32, height: 62, segments: 6, color: "#334155", hasSnow: false },

      // South-East Distant Volcanic Range
      { pos: [180, 0, 160], radius: 40, height: 78, segments: 6, color: "#334155", hasSnow: true },
      { pos: [220, 0, 120], radius: 36, height: 65, segments: 5, color: "#475569", hasSnow: false },
      { pos: [140, 0, 200], radius: 30, height: 52, segments: 6, color: "#475569", hasSnow: false },

      // South-West Rugged Massifs
      { pos: [-170, 0, 160], radius: 38, height: 72, segments: 6, color: "#334155", hasSnow: false },
      { pos: [-210, 0, 110], radius: 32, height: 58, segments: 5, color: "#475569", hasSnow: false },
    ],
    []
  );

  // Distant green archipelago islands with tree silhouettes
  const islands = useMemo<IslandData[]>(
    () => [
      // East Island (Past the lake)
      {
        pos: [130, 0, 10],
        radius: 22,
        height: 8,
        trees: [
          [0, 8, 0],
          [-6, 6, 4],
          [5, 6, -3],
          [-4, 5, -5],
          [6, 5, 4],
        ],
      },
      // North Island
      {
        pos: [10, 0, -140],
        radius: 25,
        height: 10,
        trees: [
          [0, 10, 0],
          [7, 8, 3],
          [-8, 7, -2],
          [3, 8, -6],
          [-5, 7, 5],
        ],
      },
      // South-West Island
      {
        pos: [-120, 0, 90],
        radius: 20,
        height: 7,
        trees: [
          [0, 7, 0],
          [-5, 6, 2],
          [4, 6, -4],
          [2, 5, 5],
        ],
      },
    ],
    []
  );

  // Distant Sea Stacks / Rock Pillars
  const seaStacks = useMemo<[number, number, number, number, number][]>(
    () => [
      [85, 0, -85, 4.5, 18],
      [92, 0, -78, 3.2, 14],
      [-95, 0, -75, 5.0, 22],
      [-88, 0, -82, 3.5, 16],
      [-80, 0, 85, 4.2, 19],
      [90, 0, 80, 4.0, 17],
      [145, 0, -60, 6.0, 26],
      [-135, 0, -40, 5.5, 24],
    ],
    []
  );

  // Rotate distant lighthouse beacon
  useFrame(() => {
    if (beaconRef.current) {
      beaconRef.current.target.position.x = -130 + Math.cos(Date.now() * 0.001) * 80;
      beaconRef.current.target.position.z = -140 + Math.sin(Date.now() * 0.001) * 80;
    }
  });

  return (
    <group>
      {/* ── Distant Mountains ── */}
      {mountains.map((m, i) => (
        <group key={`mountain-${i}`} position={m.pos}>
          {/* Main Rock Mountain Body */}
          <mesh position={[0, m.height / 2, 0]}>
            <coneGeometry args={[m.radius, m.height, m.segments]} />
            <meshStandardMaterial
              color={m.color}
              flatShading
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>

          {/* Snow Cap Peak */}
          {m.hasSnow && (
            <mesh position={[0, m.height * 0.78, 0]}>
              <coneGeometry
                args={[m.radius * 0.35, m.height * 0.35, m.segments]}
              />
              <meshStandardMaterial
                color="#f8fafc"
                flatShading
                roughness={0.8}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* ── Distant Archipelago Islands ── */}
      {islands.map((isl, i) => (
        <group key={`island-${i}`} position={isl.pos}>
          {/* Sandy Beach Shore */}
          <mesh position={[0, isl.height * 0.25, 0]}>
            <cylinderGeometry args={[isl.radius * 1.15, isl.radius * 1.3, isl.height * 0.5, 12]} />
            <meshStandardMaterial color="#d4a373" flatShading roughness={0.95} />
          </mesh>

          {/* Lush Green Island Hill */}
          <mesh position={[0, isl.height * 0.55, 0]}>
            <cylinderGeometry args={[isl.radius * 0.75, isl.radius * 1.05, isl.height * 0.7, 10]} />
            <meshStandardMaterial color="#15803d" flatShading roughness={0.9} />
          </mesh>

          {/* Tiny Distant Pine Trees */}
          {isl.trees.map(([tx, ty, tz], ti) => (
            <group key={`itree-${ti}`} position={[tx, ty, tz]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 3, 5]} />
                <meshStandardMaterial color="#78350f" flatShading />
              </mesh>
              <mesh position={[0, 4.5, 0]}>
                <coneGeometry args={[2.2, 5.0, 5]} />
                <meshStandardMaterial color="#166534" flatShading roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ── Distant Sea Stacks (Ocean Rock Pillars) ── */}
      {seaStacks.map(([sx, , sz, rad, h], i) => (
        <mesh key={`stack-${i}`} position={[sx, h / 2 - 0.5, sz]}>
          <cylinderGeometry args={[rad * 0.65, rad * 1.1, h, 6]} />
          <meshStandardMaterial color="#475569" flatShading roughness={0.95} />
        </mesh>
      ))}

      {/* ── Distant Lighthouse on Far North-West Sea Stack ── */}
      <group position={[-130, 0, -140]}>
        {/* Foundation Rock */}
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[7, 11, 20, 6]} />
          <meshStandardMaterial color="#334155" flatShading roughness={0.95} />
        </mesh>
        {/* Lighthouse Tower */}
        <mesh position={[0, 25, 0]}>
          <cylinderGeometry args={[1.6, 2.6, 12, 8]} />
          <meshStandardMaterial color="#f8fafc" flatShading roughness={0.7} />
        </mesh>
        {/* Red Stripes on Tower */}
        <mesh position={[0, 26, 0]}>
          <cylinderGeometry args={[1.9, 2.3, 3.5, 8]} />
          <meshStandardMaterial color="#dc2626" flatShading roughness={0.7} />
        </mesh>
        {/* Lantern Room */}
        <mesh position={[0, 32, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 2.2, 8]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={4 * lampMultiplier}
          />
        </mesh>
        {/* Lighthouse Beacon Spotlight */}
        <spotLight
          ref={beaconRef}
          position={[0, 32, 0]}
          angle={0.4}
          penumbra={0.6}
          intensity={12 * lampMultiplier}
          color="#fef08a"
          distance={280}
        />
      </group>
    </group>
  );
}
