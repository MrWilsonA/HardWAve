"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getTerrainHeight } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Pure Radial 360° Island & Infinite Ocean (With Carved East Lake Basin)
   – Green island ground: Pure Circular Subdivided Ring (radius 46.0, y: 0.20)
     * Carved Lake Basin: center (14, 0), radius 6.0, basin depth -0.6m
   – Shimmering East Lake Water: (y: 0.16) with rippling currents and bobbing lily pads
   – Wooden Bridge across the lake at y: 0.38
   – Connected Road Network: Elevated (y: 0.245) with polygonOffset depth bias
   – Unified Circular Ocean Disk: (radius 5000, y: 0.02)
   ─────────────────────────────────────────── */

function GreenIslandGround() {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(0.001, 46.0, 72, 54);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const distLake = Math.sqrt((x - 14) ** 2 + z ** 2);

      // 1. Carve East Lake Basin (center: 14, 0, radius: 6.2)
      if (distLake < 6.2) {
        const basin = Math.min(1.0, distLake / 6.2);
        // Basin drops down to -0.65m in center and slopes up to 0.20m at rim
        pos.setY(i, -0.65 + basin * 0.85);
      }
      // 2. Main flat green island lawn
      else if (dist <= 43) {
        pos.setY(i, 0.20);
      }
      // 3. Smooth slope down under beach sand into ocean bed
      else {
        const slope = (dist - 43) / 3.0;
        pos.setY(i, 0.20 - slope * 0.35);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#70a83b"
        flatShading
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  );
}

/* Sandy Beach smoothly sloping into the ocean */
function ShorelineBeach() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[42.5, 48.5, 64]} />
      <meshStandardMaterial
        color="#d4a373"
        flatShading
        roughness={0.95}
      />
    </mesh>
  );
}

/* Single Unified 360° Infinite Circular Ocean (Zero Square Planes!) */
function TrueInfiniteOcean() {
  const oceanMeshRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);

  const oceanDiskGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(46.0, 5000, 96, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const abyssalSkirtGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(5000, 5000, 150, 48, 1, true);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (oceanMeshRef.current) {
      const pos = oceanMeshRef.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);

        if (dist < 300) {
          const wave =
            Math.sin(x * 0.03 + t * 1.3) * 0.07 +
            Math.cos(z * 0.03 + t * 0.9) * 0.05 +
            Math.sin((x + z) * 0.02 + t * 1.1) * 0.03;
          pos.setY(i, 0.02 + wave);
        } else {
          pos.setY(i, 0.02);
        }
      }
      pos.needsUpdate = true;
    }

    if (foamRef.current) {
      const pulse = Math.sin(t * 2.2);
      foamRef.current.scale.set(1 + pulse * 0.012, 1, 1 + pulse * 0.012);
      const mat = foamRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = 0.5 + pulse * 0.25;
    }
  });

  return (
    <group>
      {/* 1. Unified 360° Infinite Circular Ocean Disk */}
      <mesh ref={oceanMeshRef} geometry={oceanDiskGeo} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#0284c7"
          transparent
          opacity={0.88}
          roughness={0.06}
          metalness={0.35}
          flatShading
        />
      </mesh>

      {/* 2. Deep Horizon Abyssal Skirt */}
      <mesh geometry={abyssalSkirtGeo} position={[0, -75, 0]}>
        <meshBasicMaterial color="#0284c7" side={THREE.BackSide} />
      </mesh>

      {/* 3. Shoreline Animated Wave Foam Ring */}
      <mesh ref={foamRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[46.5, 48.8, 64]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/* ───────────────────────────────────────────
   East Lake with Bridge Crossing & Flowing Water Currents
   ─────────────────────────────────────────── */
function PondsAndBridge() {
  const waterRef = useRef<THREE.Mesh>(null);
  const lilyPadsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (waterRef.current) {
      // Flowing ripple wave on lake surface
      waterRef.current.position.y = 0.15 + Math.sin(t * 1.8) * 0.012;
    }
    if (lilyPadsRef.current) {
      lilyPadsRef.current.children.forEach((pad, i) => {
        pad.position.y = 0.165 + Math.sin(t * 2.0 + i * 1.5) * 0.008;
      });
    }
  });

  return (
    <group>
      {/* Lake Sand & Cobblestone Rim (center: 14, 0, radius: 6.0) */}
      <mesh position={[14, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.6, 6.4, 48]} />
        <meshStandardMaterial color="#d4a373" flatShading roughness={0.9} />
      </mesh>

      {/* Shimmering Blue Lake Water (elevated at y = 0.15 filling the carved basin) */}
      <mesh
        ref={waterRef}
        position={[14, 0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6.0, 48]} />
        <meshStandardMaterial
          color="#0284c7"
          transparent
          opacity={0.88}
          roughness={0.04}
          metalness={0.45}
          flatShading
        />
      </mesh>

      {/* Floating Lily Pads bobbing with current */}
      <group ref={lilyPadsRef}>
        {[
          [11.5, 0.165, -3.5],
          [16.5, 0.165, -3.2],
          [12.0, 0.165, 3.6],
          [16.0, 0.165, 3.4],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, i * 1.4]}>
            <circleGeometry args={[0.55, 6]} />
            <meshStandardMaterial color="#3f6212" roughness={0.7} flatShading />
          </mesh>
        ))}
      </group>

      {/* ── Wooden Bridge directly on East Road (x: 9.5 to 18.5, z: 0) ── */}
      <group position={[14, 0.38, 0]}>
        {/* Main Deck Planks running East-West */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[9.0, 0.16, 3.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
        </mesh>
        {/* North Handrail */}
        <mesh position={[0, 0.48, -1.7]} castShadow>
          <boxGeometry args={[9.0, 0.75, 0.12]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} flatShading />
        </mesh>
        {/* South Handrail */}
        <mesh position={[0, 0.48, 1.7]} castShadow>
          <boxGeometry args={[9.0, 0.75, 0.12]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} flatShading />
        </mesh>

        {/* Underwater Wooden Pilings */}
        {[-3.2, 0, 3.2].map((px, i) => (
          <group key={i} position={[px, -0.6, 0]}>
            <mesh position={[0, 0, -1.5]} castShadow>
              <cylinderGeometry args={[0.14, 0.16, 1.4, 6]} />
              <meshStandardMaterial color="#451a03" flatShading />
            </mesh>
            <mesh position={[0, 0, 1.5]} castShadow>
              <cylinderGeometry args={[0.14, 0.16, 1.4, 6]} />
              <meshStandardMaterial color="#451a03" flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────────────────────────
   Elevated Solid Road Network (Zero Z-Fighting / Zero Flickering)
   ─────────────────────────────────────────── */
function ConnectedRoadNetwork({ lampMultiplier = 1 }: { lampMultiplier?: number }) {
  return (
    <group position={[0, 0.245, 0]}>
      {/* 1. Grand Ring Road Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[22, 28, 64]} />
        <meshStandardMaterial
          color="#c27848"
          flatShading
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>

      {/* Neon Border Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[23.2, 23.5, 64]} />
        <meshStandardMaterial
          color="#d946ef"
          emissive="#d946ef"
          emissiveIntensity={1.5 * lampMultiplier}
          roughness={0.3}
          polygonOffset
          polygonOffsetFactor={-2.0}
          polygonOffsetUnits={-6.0}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[26.5, 26.8, 64]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1.5 * lampMultiplier}
          roughness={0.3}
          polygonOffset
          polygonOffsetFactor={-2.0}
          polygonOffsetUnits={-6.0}
        />
      </mesh>

      {/* 2. Central Cross Roads (East-West & North-South) */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <boxGeometry args={[52, 0.04, 3.4]} />
        <meshStandardMaterial
          color="#c27848"
          flatShading
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[52, 0.04, 3.4]} />
        <meshStandardMaterial
          color="#c27848"
          flatShading
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>

      {/* Central Rotary Roundabout */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <circleGeometry args={[6.0, 32]} />
        <meshStandardMaterial
          color="#a85d34"
          flatShading
          roughness={0.8}
          polygonOffset
          polygonOffsetFactor={-1.5}
          polygonOffsetUnits={-5.0}
        />
      </mesh>

      {/* Diagonal Spoke Roads */}
      <mesh position={[0, 0.002, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
        <boxGeometry args={[46, 0.04, 3.0]} />
        <meshStandardMaterial
          color="#c27848"
          flatShading
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[0, -Math.PI / 4, 0]} receiveShadow>
        <boxGeometry args={[46, 0.04, 3.0]} />
        <meshStandardMaterial
          color="#c27848"
          flatShading
          roughness={0.85}
          polygonOffset
          polygonOffsetFactor={-1.0}
          polygonOffsetUnits={-4.0}
        />
      </mesh>
    </group>
  );
}

export default function NatureTerrain({ lampMultiplier = 1 }: { lampMultiplier?: number }) {
  return (
    <group>
      <TrueInfiniteOcean />
      <GreenIslandGround />
      <ShorelineBeach />
      <PondsAndBridge />
      <ConnectedRoadNetwork lampMultiplier={lampMultiplier} />
    </group>
  );
}
