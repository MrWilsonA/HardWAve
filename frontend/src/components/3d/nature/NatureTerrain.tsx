"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getTerrainHeight } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Pure Radial 360° Island & Infinite Ocean (Zero Z-Fighting & Zero Squares)
   – Green island ground: Pure Circular Subdivided Ring (radius 46.0, y: 0.20)
   – Connected Road Network: Elevated (y: 0.245) with polygonOffset depth bias (Zero flickering)
   – Unified Circular Ocean Disk: (radius 5000, y: 0.02)
   – Shoreline Beach & East Lake with ripples and bridge
   ─────────────────────────────────────────── */

function GreenIslandGround() {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(0.001, 46.0, 64, 48);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);

      if (dist <= 43) {
        pos.setY(i, 0.20);
      } else {
        // Smoothly slope down under beach sand into ocean bed
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

/* Lake with Bridge Crossing & Animated Water Current */
function PondsAndBridge() {
  const waterRef = useRef<THREE.Mesh>(null);
  const lilyPadsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (waterRef.current) {
      waterRef.current.position.y = 0.04 + Math.sin(t * 1.8) * 0.014;
    }
    if (lilyPadsRef.current) {
      lilyPadsRef.current.children.forEach((pad, i) => {
        pad.position.y = 0.055 + Math.sin(t * 2.0 + i * 1.5) * 0.008;
      });
    }
  });

  return (
    <group>
      {/* Lake Rim */}
      <mesh position={[14, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 6.5, 32]} />
        <meshStandardMaterial color="#d4a373" flatShading roughness={0.9} />
      </mesh>

      {/* Shimmering Blue Lake Water */}
      <mesh
        ref={waterRef}
        position={[14, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6.0, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          transparent
          opacity={0.88}
          roughness={0.05}
          metalness={0.4}
          flatShading
        />
      </mesh>

      {/* Floating Lily Pads */}
      <group ref={lilyPadsRef}>
        {[
          [11.5, 0.06, -3.5],
          [16.5, 0.06, -3.2],
          [12.0, 0.06, 3.6],
          [16.0, 0.06, 3.4],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, i * 1.4]}>
            <circleGeometry args={[0.55, 6]} />
            <meshStandardMaterial color="#3f6212" roughness={0.7} flatShading />
          </mesh>
        ))}
      </group>

      {/* Wooden Bridge (x: 10 to 18, z: 0) */}
      <group position={[14, 0.38, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[8.5, 0.16, 3.4]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 0.45, -1.6]} castShadow>
          <boxGeometry args={[8.5, 0.7, 0.1]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 0.45, 1.6]} castShadow>
          <boxGeometry args={[8.5, 0.7, 0.1]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} flatShading />
        </mesh>
        {[-3, 0, 3].map((px, i) => (
          <group key={i} position={[px, -0.6, 0]}>
            <mesh position={[0, 0, -1.4]} castShadow>
              <cylinderGeometry args={[0.12, 0.14, 1.2, 6]} />
              <meshStandardMaterial color="#451a03" flatShading />
            </mesh>
            <mesh position={[0, 0, 1.4]} castShadow>
              <cylinderGeometry args={[0.12, 0.14, 1.2, 6]} />
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
   – Distinct elevation (y: 0.245) above green ground (y: 0.20)
   – Three.js polygonOffset depth biasing ensures clean rasterization
   ─────────────────────────────────────────── */
function ConnectedRoadNetwork({ lampMultiplier = 1 }: { lampMultiplier?: number }) {
  return (
    <group position={[0, 0.245, 0]}>
      {/* 1. Grand Ring Road Boulevard (Elevated & Offset) */}
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

      {/* Neon Border Lines (Elevated +0.008 above road with higher offset) */}
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
