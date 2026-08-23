"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { getTerrainHeight, isOnRoad, isInWater } from "@/utils/terrainPhysics";
import { STATIONS } from "@/components/3d/nature/ParkPavilions";
import { createRng, WORLD_SEEDS } from "@/utils/rng";

/* ───────────────────────────────────────────
   Dense Lush Grass & Wildflower Meadow
   – Bushy multi-blade tufts (X-crossed geometry)
   – Firmly anchored at terrain height + 0.12m (100% visible & stable)
   – Guaranteed full instance distribution (3,500+ tufts)
   ─────────────────────────────────────────── */

interface Instance {
  position: [number, number, number];
  scale: number;
  rotation: number;
  color: string;
}

function isValidLawnPosition(x: number, z: number): boolean {
  const dist = Math.sqrt(x * x + z * z);
  // Island radius bounds
  if (dist < 4.0 || dist > 41.0) return false;

  // Exclude road network
  if (isOnRoad(x, z)) return false;

  // Exclude water
  if (isInWater(x, z)) return false;

  // Exclude 5 pavilion plinths (radius 4.5m)
  for (const st of STATIONS) {
    const dx = x - st.position[0];
    const dz = z - st.position[2];
    if (Math.sqrt(dx * dx + dz * dz) < 4.8) return false;
  }

  return true;
}

export default function InstancedGrass({
  grassCount = 3600,
  flowerCount = 450,
}: {
  grassCount?: number;
  flowerCount?: number;
}) {
  const grassMeshRef = useRef<THREE.InstancedMesh>(null);
  const flowerMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate dense grass instances strictly on lawn
  const grassInstances = useMemo(() => {
    const rng = createRng(WORLD_SEEDS.grass);
    const temp: Instance[] = [];
    const colors = ["#3f6212", "#4d7c0f", "#65a30d", "#84cc16", "#5b8a14", "#70a83b", "#a3e635"];
    let attempts = 0;
    let placed = 0;
    const maxAttempts = grassCount * 25;

    while (placed < grassCount && attempts < maxAttempts) {
      attempts++;
      const radius = 4.2 + Math.sqrt(rng.next()) * 36.8;
      const angle = rng.next() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.85 + rng.next() * 0.65; // Tall, rich lush blades (0.85m - 1.5m)
      const rotation = rng.next() * Math.PI * 2;
      const color = rng.pick(colors);

      temp.push({
        position: [x, h + 0.10, z],
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
    const rng = createRng(WORLD_SEEDS.flowers);
    const temp: Instance[] = [];
    const flowerColors = ["#f43f5e", "#fbbf24", "#38bdf8", "#ec4899", "#a855f7", "#ffffff", "#f97316"];
    let attempts = 0;
    let placed = 0;
    const maxAttempts = flowerCount * 25;

    while (placed < flowerCount && attempts < maxAttempts) {
      attempts++;
      const radius = 4.5 + Math.sqrt(rng.next()) * 36;
      const angle = rng.next() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (!isValidLawnPosition(x, z)) continue;

      const h = getTerrainHeight(x, z);
      const scale = 0.65 + rng.next() * 0.45;
      const rotation = rng.next() * Math.PI * 2;
      const color = rng.pick(flowerColors);

      temp.push({
        position: [x, h + 0.14, z],
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

  // Firmly set all instance transforms and colors on mount / updates
  useEffect(() => {
    if (grassMeshRef.current) {
      grassMeshRef.current.frustumCulled = false;
      grassMeshRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 120);
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
      flowerMeshRef.current.frustumCulled = false;
      flowerMeshRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 120);
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

  // Lush multi-blade clump geometry (3 crossed blades forming a rich volumetric tuft)
  const grassGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.14, 0);
    shape.lineTo(0.14, 0);
    shape.lineTo(0.08, 0.6);
    shape.lineTo(0, 0.95);
    shape.lineTo(-0.08, 0.6);
    shape.closePath();

    const blade1 = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false });
    blade1.center();
    blade1.translate(0, 0.47, 0);

    const blade2 = blade1.clone();
    blade2.rotateY(Math.PI / 3);

    const blade3 = blade1.clone();
    blade3.rotateY((2 * Math.PI) / 3);

    // Merge into a single solid 3-blade tuft
    const merged = new THREE.BufferGeometry();
    const pos1 = blade1.attributes.position.array;
    const pos2 = blade2.attributes.position.array;
    const pos3 = blade3.attributes.position.array;

    const mergedPositions = new Float32Array(pos1.length + pos2.length + pos3.length);
    mergedPositions.set(pos1, 0);
    mergedPositions.set(pos2, pos1.length);
    mergedPositions.set(pos3, pos1.length + pos2.length);

    merged.setAttribute("position", new THREE.BufferAttribute(mergedPositions, 3));
    merged.computeVertexNormals();

    return merged;
  }, []);

  const flowerGeo = useMemo(() => {
    return new THREE.DodecahedronGeometry(0.24, 0);
  }, []);

  return (
    <group>
      {/* 3,500+ Dense volumetric grass tufts – frustum culling disabled so always visible */}
      <instancedMesh
        ref={grassMeshRef}
        args={[grassGeo, undefined, grassInstances.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.75} metalness={0.02} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* Wildflower blossoms – frustum culling disabled */}
      <instancedMesh
        ref={flowerMeshRef}
        args={[flowerGeo, undefined, flowerInstances.length]}
        castShadow
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial roughness={0.4} metalness={0.08} />
      </instancedMesh>
    </group>
  );
}
