"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { getTerrainHeight } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Majestic Grand Oak – Ancient HardWAve World Tree
   – Massive ancient gnarly trunk with flared root buttresses
   – Grand multi-tiered sprawling canopy reaching ~18m height
   – Stone sanctuary plaza surround with ancient cyber rune inlays
   – Floating golden starlight spores & wind sway
   ─────────────────────────────────────────── */

function LeafCluster({
  position,
  scale = 1,
  color = "#3f6212",
  detail = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  detail?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Core foliage cluster */}
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1.5, detail]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
      {/* Sub-foliage clusters for lush volume */}
      <mesh position={[0.9, 0.35, 0.5]} castShadow>
        <dodecahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[-0.7, 0.45, -0.6]} castShadow>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0.4, -0.6, 0.8]} castShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}

export default function GrandOak() {
  const canopyRef = useRef<THREE.Group>(null);
  const baseY = getTerrainHeight(0, 0);

  // Gentle wind sway animation on the massive canopy
  useFrame((state) => {
    if (canopyRef.current) {
      const t = state.clock.elapsedTime;
      canopyRef.current.rotation.z = Math.sin(t * 0.45) * 0.018;
      canopyRef.current.rotation.x = Math.cos(t * 0.3) * 0.012;
    }
  });

  // Grand Canopy cluster positions (Sprawling, tiered crown reaching 18m height)
  const clusters = useMemo(
    () => [
      // 1. Lower Tier Sprawling Canopy (Height ~8m - 11m)
      { pos: [0, 8.5, 0] as [number, number, number], s: 3.6, color: "#2d5a08", d: 1 },
      { pos: [3.2, 8.2, 1.8] as [number, number, number], s: 2.6, color: "#3f6212", d: 1 },
      { pos: [-3.0, 8.4, 2.2] as [number, number, number], s: 2.5, color: "#4d7c0f", d: 0 },
      { pos: [2.2, 8.0, -3.0] as [number, number, number], s: 2.4, color: "#3f6212", d: 1 },
      { pos: [-2.6, 7.8, -2.4] as [number, number, number], s: 2.5, color: "#2d5a08", d: 0 },

      // 2. Middle Main Canopy Ring (Height ~11m - 14m)
      { pos: [0.8, 11.5, 0.6] as [number, number, number], s: 3.2, color: "#4d7c0f", d: 1 },
      { pos: [-1.4, 11.2, -0.9] as [number, number, number], s: 2.8, color: "#65a30d", d: 1 },
      { pos: [2.5, 11.0, -1.8] as [number, number, number], s: 2.4, color: "#3f6212", d: 0 },
      { pos: [-2.4, 10.8, 1.9] as [number, number, number], s: 2.5, color: "#4d7c0f", d: 0 },

      // 3. Sprawling Extended Outer Branches (Reaching 7m radius)
      { pos: [4.8, 8.8, 0.5] as [number, number, number], s: 2.2, color: "#65a30d", d: 0 },
      { pos: [-4.6, 9.0, 0.8] as [number, number, number], s: 2.1, color: "#3f6212", d: 0 },
      { pos: [0.4, 8.6, 4.5] as [number, number, number], s: 2.2, color: "#4d7c0f", d: 0 },
      { pos: [0.6, 9.2, -4.2] as [number, number, number], s: 2.0, color: "#65a30d", d: 0 },

      // 4. Upper Grand Crown & Summit (Height ~14m - 18m)
      { pos: [0.2, 14.5, 0.4] as [number, number, number], s: 2.8, color: "#65a30d", d: 1 },
      { pos: [-0.6, 15.2, -0.5] as [number, number, number], s: 2.2, color: "#84cc16", d: 1 },
      { pos: [0.4, 16.5, 0.0] as [number, number, number], s: 1.8, color: "#a3e635", d: 0 },

      // 5. Golden Autumn & Cyber Blossom Accents
      { pos: [3.4, 10.5, 2.5] as [number, number, number], s: 1.5, color: "#ea580c", d: 0 },
      { pos: [-3.2, 11.2, -2.8] as [number, number, number], s: 1.4, color: "#f97316", d: 0 },
      { pos: [1.5, 13.5, 2.0] as [number, number, number], s: 1.3, color: "#fbbf24", d: 0 },
      { pos: [-1.8, 14.0, 1.6] as [number, number, number], s: 1.2, color: "#f59e0b", d: 0 },
    ],
    []
  );

  return (
    <group position={[0, baseY, 0]}>
      {/* ── 1. Circular Stone Sanctuary Base Plinth ── */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[5.2, 5.6, 0.24, 12]} />
        <meshStandardMaterial color="#57534e" flatShading roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.28, 0]} receiveShadow>
        <cylinderGeometry args={[4.4, 4.8, 0.18, 12]} />
        <meshStandardMaterial color="#78716c" flatShading roughness={0.85} />
      </mesh>

      {/* Cyber Sanctuary Glowing Energy Inlay Ring */}
      <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.45, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>

      {/* ── 2. Ancient Flared Exposed Buttress Roots ── */}
      {[0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((angle, i) => (
        <mesh
          key={`root-${i}`}
          position={[Math.cos(angle) * 2.8, 0.45, Math.sin(angle) * 2.8]}
          rotation={[0.35, angle, 0.5]}
          castShadow
        >
          <cylinderGeometry args={[0.38, 0.12, 4.2, 6]} />
          <meshStandardMaterial color="#451a03" flatShading roughness={0.95} />
        </mesh>
      ))}

      {/* ── 3. Massive Gnarled Ancient Trunk (Height ~8m, base radius 2.0m) ── */}
      {/* Lower Trunk Base */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 2.2, 5.0, 8]} />
        <meshStandardMaterial color="#5c2c10" flatShading roughness={0.92} />
      </mesh>
      {/* Upper Trunk Transition */}
      <mesh position={[0, 5.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.45, 3.8, 8]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.92} />
      </mesh>

      {/* ── 4. Sprawling Heavy Branches ── */}
      {[
        { rot: [0.45, 0, 0.35], pos: [1.2, 6.2, 0.8], len: 4.8 },
        { rot: [0.35, 1.6, -0.35], pos: [-1.1, 6.0, 1.0], len: 4.6 },
        { rot: [-0.4, 0.8, 0.25], pos: [0.7, 5.8, -1.2], len: 4.5 },
        { rot: [-0.3, -1.1, -0.3], pos: [-0.9, 6.4, -0.8], len: 4.6 },
        { rot: [0.2, 3.0, 0.4], pos: [-0.3, 7.2, -1.2], len: 4.2 },
      ].map((branch, i) => (
        <mesh
          key={`branch-${i}`}
          position={branch.pos as [number, number, number]}
          rotation={branch.rot as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.22, 0.45, branch.len, 6]} />
          <meshStandardMaterial color="#5c2c10" flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* ── 5. Grand Multi-Tiered Canopy ── */}
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

        {/* Golden Starlight Spores floating around the Grand Oak canopy */}
        <Sparkles
          count={65}
          scale={[14, 12, 14]}
          position={[0, 12, 0]}
          size={4.0}
          speed={0.6}
          color="#fef08a"
          opacity={0.8}
        />
      </group>
    </group>
  );
}
