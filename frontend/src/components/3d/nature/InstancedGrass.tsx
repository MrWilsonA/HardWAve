"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTerrainHeight, isOnRoad, isInWater, OBSTACLES } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Instanced Grass Meadow with Wind Sway
   – 2000+ grass blades strictly on lawn areas
   – Gentle wind animation via per-frame matrix updates
   – Grand Oak exclusion zone (center radius 5.5)
   ─────────────────────────────────────────── */

interface InstancedGrassProps {
  grassCount?: number;
  flowerCount?: number;
}

export default function InstancedGrass({
  grassCount = 2000,
  flowerCount = 300,
}: InstancedGrassProps) {
  const grassMeshRef = useRef<THREE.InstancedMesh>(null);
  const flowerMeshRef = useRef<THREE.InstancedMesh>(null);

  // Helper to verify valid green lawn position
  const isValidLawnPosition = (x: number, z: number): boolean => {
    const dist = Math.sqrt(x * x + z * z);
    // Avoid outer sand beach AND Grand Oak center zone
    if (dist > 43 || dist < 5.5) return false;

    // Avoid all roads & bridges
    if (isOnRoad(x, z)) return false;

    // Avoid all water bodies
    if (isInWater(x, z)) return false;

    // Avoid buildings & pavilions
    for (const obs of OBSTACLES) {
      const d = Math.sqrt((x - obs.x) ** 2 + (z - obs.z) ** 2);
      if (d < obs.radius + 0.8) return false;
    }

    return true;
  };

  // Generate grass instances strictly on grass lawn
  const grassInstances = useMemo(() => {
    const temp: { position: [number, number, number]; scale: number; rotation: number; color: string }[] = [];
    const colors = ["#84cc16", "#65a30d", "#a3e635", "#78a825", "#4d7c0f"];
    let attempts = 0;
    let placed = 0;

    while (placed < grassCount && attempts < grassCount * 8) {
      attempts++;
      const radius = 6 + Math.sqrt(Math.random()) * 37;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.55 + Math.random() * 0.55;
      const rotation = Math.random() * Math.PI * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      temp.push({
        position: [x, h + 0.02, z],
        scale,
        rotation,
        color,
      });
      placed++;
    }
    return temp;
  }, [grassCount]);

  // Generate flower instances strictly on grass lawn
  const flowerInstances = useMemo(() => {
    const temp: { position: [number, number, number]; scale: number; rotation: number; color: string }[] = [];
    const flowerColors = ["#f43f5e", "#fbbf24", "#38bdf8", "#ec4899", "#a855f7"];
    let attempts = 0;
    let placed = 0;

    while (placed < flowerCount && attempts < flowerCount * 8) {
      attempts++;
      const radius = 6 + Math.sqrt(Math.random()) * 36;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.4 + Math.random() * 0.4;
      const rotation = Math.random() * Math.PI * 2;
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

      temp.push({
        position: [x, h + 0.03, z],
        scale,
        rotation,
        color,
      });
      placed++;
    }
    return temp;
  }, [flowerCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initial color setup
  React.useEffect(() => {
    if (grassMeshRef.current) {
      grassInstances.forEach((data, i) => {
        dummy.position.set(...data.position);
        dummy.rotation.set(0, data.rotation, 0);
        dummy.scale.set(data.scale, data.scale, data.scale);
        dummy.updateMatrix();
        grassMeshRef.current?.setMatrixAt(i, dummy.matrix);
        grassMeshRef.current?.setColorAt(i, tempColor.set(data.color));
      });
      grassMeshRef.current.instanceMatrix.needsUpdate = true;
      if (grassMeshRef.current.instanceColor) {
        grassMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (flowerMeshRef.current) {
      flowerInstances.forEach((data, i) => {
        dummy.position.set(...data.position);
        dummy.rotation.set(0, data.rotation, 0);
        dummy.scale.set(data.scale, data.scale, data.scale);
        dummy.updateMatrix();
        flowerMeshRef.current?.setMatrixAt(i, dummy.matrix);
        flowerMeshRef.current?.setColorAt(i, tempColor.set(data.color));
      });
      flowerMeshRef.current.instanceMatrix.needsUpdate = true;
      if (flowerMeshRef.current.instanceColor) {
        flowerMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [grassInstances, flowerInstances, dummy, tempColor]);

  // Wind sway animation – subtle, high-performance group sway
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (grassMeshRef.current) {
      grassMeshRef.current.rotation.z = Math.sin(t * 1.4) * 0.015;
      grassMeshRef.current.rotation.x = Math.cos(t * 1.1) * 0.01;
    }
    if (flowerMeshRef.current) {
      flowerMeshRef.current.rotation.z = Math.sin(t * 1.2 + 1) * 0.012;
      flowerMeshRef.current.rotation.x = Math.cos(t * 0.9 + 1) * 0.008;
    }
  });

  // Low-poly blade geometry
  const grassGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.09, 0);
    shape.lineTo(0.09, 0);
    shape.lineTo(0.05, 0.5);
    shape.lineTo(0, 0.8);
    shape.lineTo(-0.05, 0.5);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    geo.center();
    geo.translate(0, 0.4, 0);
    return geo;
  }, []);

  const flowerGeo = useMemo(() => {
    return new THREE.OctahedronGeometry(0.18, 0);
  }, []);

  return (
    <group>
      {/* Pure visual grass tufts - raycast disabled, wind-animated */}
      <instancedMesh
        ref={grassMeshRef}
        args={[grassGeo, undefined, grassInstances.length]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.75} metalness={0.05} flatShading />
      </instancedMesh>

      {/* Wildflowers - raycast disabled */}
      <instancedMesh
        ref={flowerMeshRef}
        args={[flowerGeo, undefined, flowerInstances.length]}
        castShadow
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.5} metalness={0.1} flatShading />
      </instancedMesh>
    </group>
  );
}
