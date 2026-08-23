"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTerrainHeight } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Grand Oak – Majestic Centerpiece Tree
   – Thick gnarled trunk with exposed roots
   – Rich multi-layered canopy with individual leaf clusters
   – Gentle wind sway animation
   – Designed to NOT block isometric camera (max height ~9)
   ─────────────────────────────────────────── */

// Leaf cluster sub-component for richer canopy detail
function LeafCluster({
  position,
  scale = 1,
  color = "#4d7c0f",
  detail = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  detail?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Core cluster */}
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1.0, detail]} />
        <meshStandardMaterial color={color} flatShading roughness={0.88} />
      </mesh>
      {/* Sub-leaves for volume */}
      <mesh position={[0.55, 0.2, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.88} />
      </mesh>
      <mesh position={[-0.4, 0.3, -0.35]} castShadow>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.88} />
      </mesh>
      <mesh position={[0.2, -0.4, 0.5]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.88} />
      </mesh>
    </group>
  );
}

export default function GrandOak() {
  const canopyRef = useRef<THREE.Group>(null);
  const baseY = getTerrainHeight(0, 0);

  // Wind sway animation on the canopy
  useFrame((state) => {
    if (canopyRef.current) {
      const t = state.clock.elapsedTime;
      canopyRef.current.rotation.z = Math.sin(t * 0.5) * 0.015;
      canopyRef.current.rotation.x = Math.cos(t * 0.35) * 0.01;
    }
  });

  // Canopy cluster positions (spread radially to form a wide, non-blocking crown)
  const clusters = useMemo(
    () => [
      // Lower main canopy ring
      { pos: [0, 5.8, 0] as [number, number, number], s: 2.2, color: "#3f6212", d: 1 },
      { pos: [1.8, 5.5, 1.0] as [number, number, number], s: 1.6, color: "#4d7c0f", d: 1 },
      { pos: [-1.6, 5.6, 1.4] as [number, number, number], s: 1.5, color: "#65a30d", d: 0 },
      { pos: [1.2, 5.4, -1.6] as [number, number, number], s: 1.4, color: "#4d7c0f", d: 1 },
      { pos: [-1.4, 5.3, -1.2] as [number, number, number], s: 1.5, color: "#3f6212", d: 0 },

      // Upper crown
      { pos: [0.5, 6.8, 0.3] as [number, number, number], s: 1.8, color: "#65a30d", d: 1 },
      { pos: [-0.8, 6.6, -0.5] as [number, number, number], s: 1.5, color: "#4d7c0f", d: 1 },
      { pos: [0.3, 7.2, -0.4] as [number, number, number], s: 1.3, color: "#84cc16", d: 0 },

      // Wide reaching outer branches
      { pos: [2.8, 5.0, 0] as [number, number, number], s: 1.3, color: "#65a30d", d: 0 },
      { pos: [-2.6, 5.1, 0.5] as [number, number, number], s: 1.2, color: "#3f6212", d: 0 },
      { pos: [0, 5.0, 2.5] as [number, number, number], s: 1.3, color: "#4d7c0f", d: 0 },
      { pos: [0.3, 5.2, -2.4] as [number, number, number], s: 1.1, color: "#65a30d", d: 0 },

      // Autumn accent clusters
      { pos: [2.0, 6.0, 1.5] as [number, number, number], s: 0.9, color: "#ea580c", d: 0 },
      { pos: [-1.8, 6.2, -1.8] as [number, number, number], s: 0.8, color: "#f97316", d: 0 },
      { pos: [0.8, 7.0, 1.0] as [number, number, number], s: 0.7, color: "#fb923c", d: 0 },
    ],
    []
  );

  return (
    <group position={[0, baseY, 0]}>
      {/* ── Exposed Root System ── */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh
          key={`root-${i}`}
          position={[
            Math.cos(angle) * 1.8,
            0.15,
            Math.sin(angle) * 1.8,
          ]}
          rotation={[0.3, angle, 0.4]}
          castShadow
        >
          <cylinderGeometry args={[0.18, 0.06, 2.2, 5]} />
          <meshStandardMaterial color="#5c3a1e" flatShading roughness={0.95} />
        </mesh>
      ))}

      {/* ── Thick Gnarled Trunk ── */}
      {/* Main trunk */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 1.2, 4.0, 7]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.92} />
      </mesh>
      {/* Trunk bark texture detail */}
      <mesh position={[0.15, 2.2, 0.1]} castShadow>
        <cylinderGeometry args={[0.55, 1.0, 3.8, 6]} />
        <meshStandardMaterial color="#6b2f0a" flatShading roughness={0.95} />
      </mesh>

      {/* ── Primary Branching ── */}
      {[
        { rot: [0.4, 0, 0.3], pos: [0.6, 3.8, 0.3] },
        { rot: [0.3, 1.5, -0.3], pos: [-0.5, 3.6, 0.4] },
        { rot: [-0.3, 0.8, 0.2], pos: [0.3, 3.5, -0.5] },
        { rot: [-0.2, -0.7, -0.25], pos: [-0.3, 3.9, -0.3] },
      ].map((branch, i) => (
        <mesh
          key={`branch-${i}`}
          position={branch.pos as [number, number, number]}
          rotation={branch.rot as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.2, 2.5, 5]} />
          <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* ── Lush Multi-Layered Canopy ── */}
      <group ref={canopyRef}>
        {clusters.map((c, i) => (
          <LeafCluster
            key={`lc-${i}`}
            position={c.pos}
            scale={c.s}
            color={c.color}
            detail={c.d}
          />
        ))}
      </group>

      {/* ── Subtle Ground Shadow Circle ── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 24]} />
        <meshStandardMaterial
          color="#1a2e05"
          transparent
          opacity={0.3}
          roughness={1}
        />
      </mesh>
    </group>
  );
}
