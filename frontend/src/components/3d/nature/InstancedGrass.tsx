"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { getTerrainHeight, isOnRoad, isInWater } from "@/utils/terrainPhysics";
import { STATIONS } from "@/components/3d/nature/ParkPavilions";

/* ───────────────────────────────────────────
   Instanced Grass & Wildflower Meadow
   – Firmly anchored at ground height + 0.08m (NEVER sinks below terrain)
   – Dispersed across green lawn areas
   – High performance & zero visual clipping
   ─────────────────────────────────────────── */

function isValidLawnPosition(x: number, z: number): boolean {
  const dist = Math.sqrt(x * x + z * z);
  // Must be within green island (radius 4.0 to 42.0)
  if (dist < 4.5 || dist > 41.5) return false;

  // Exclude road network with safety buffer
  if (isOnRoad(x, z)) return false;

  // Exclude water bodies
  if (isInWater(x, z)) return false;

  // Exclude 5 exhibition pavilions
  for (const st of STATIONS) {
    const dx = x - st.position[0];
    const dz = z - st.position[2];
    if (Math.sqrt(dx * dx + dz * dz) < 6.2) return false;
  }

  return true;
}

export default function InstancedGrass({
  grassCount = 2400,
  flowerCount = 380,
}: {
  grassCount?: number;
  flowerCount?: number;
}) {
  const grassMeshRef = useRef<THREE.InstancedMesh>(null);
  const flowerMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate grass instances strictly on lawn
  const grassInstances = useMemo(() => {
    const temp: { position: [number, number, number]; scale: number; rotation: number; color: string }[] = [];
    const colors = ["#4d7c0f", "#65a30d", "#84cc16", "#3f6212", "#5b8a14", "#70a83b"];
    let attempts = 0;
    let placed = 0;

    while (placed < grassCount && attempts < grassCount * 8) {
      attempts++;
      const radius = 5.0 + Math.sqrt(Math.random()) * 36.5;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.55 + Math.random() * 0.45;
      const rotation = Math.random() * Math.PI * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      temp.push({
        position: [x, h + 0.06, z],
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
    const flowerColors = ["#f43f5e", "#fbbf24", "#38bdf8", "#ec4899", "#a855f7", "#ffffff"];
    let attempts = 0;
    let placed = 0;

    while (placed < flowerCount && attempts < flowerCount * 8) {
      attempts++;
      const radius = 5.5 + Math.sqrt(Math.random()) * 36;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.45 + Math.random() * 0.4;
      const rotation = Math.random() * Math.PI * 2;
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

      temp.push({
        position: [x, h + 0.08, z],
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

  // Firmly set all instance transforms and colors
  useEffect(() => {
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

  // Low-poly blade geometry (Anchored at base y=0, standing 0.85m tall)
  const grassGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.11, 0);
    shape.lineTo(0.11, 0);
    shape.lineTo(0.06, 0.55);
    shape.lineTo(0, 0.88);
    shape.lineTo(-0.06, 0.55);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false });
    geo.center();
    geo.translate(0, 0.44, 0);
    return geo;
  }, []);

  const flowerGeo = useMemo(() => {
    return new THREE.OctahedronGeometry(0.20, 0);
  }, []);

  return (
    <group>
      {/* Pure visual grass tufts - raycast disabled */}
      <instancedMesh
        ref={grassMeshRef}
        args={[grassGeo, undefined, grassInstances.length]}
        castShadow
        receiveShadow
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.78} metalness={0.02} flatShading />
      </instancedMesh>

      {/* Wildflowers - raycast disabled */}
      <instancedMesh
        ref={flowerMeshRef}
        args={[flowerGeo, undefined, flowerInstances.length]}
        castShadow
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.5} metalness={0.08} flatShading />
      </instancedMesh>
    </group>
  );
}
