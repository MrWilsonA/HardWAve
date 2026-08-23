"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng, WORLD_SEEDS } from "@/utils/rng";

/* ───────────────────────────────────────────
   Wind Particles – Drifting Leaves & Pollen
   – Instanced leaf shapes blown NW→SE
   – Floating pollen/dust motes catching sunlight
   – Pure position math, no physics overhead
   ─────────────────────────────────────────── */

const LEAF_COUNT = 70;
const POLLEN_COUNT = 120;
const WIND_DIR = new THREE.Vector3(0.6, -0.05, 0.8).normalize(); // NW → SE
const WIND_SPEED = 2.5;
const DRIFT_RADIUS = 45; // Spawn/recycle boundary

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;       // Random phase for sinusoidal drift
  spinSpeed: number;   // Rotation speed
  scale: number;
}

export default function WindParticles({ isNight = false }: { isNight?: boolean }) {
  const leafMeshRef = useRef<THREE.InstancedMesh>(null);
  const pollenMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize leaf particles
  const leaves = useMemo<ParticleData[]>(() => {
    const rng = createRng(WORLD_SEEDS.leaves);
    return Array.from({ length: LEAF_COUNT }, () => ({
      position: new THREE.Vector3(
        (rng.next() - 0.5) * DRIFT_RADIUS * 2,
        2 + rng.next() * 10,
        (rng.next() - 0.5) * DRIFT_RADIUS * 2
      ),
      velocity: WIND_DIR.clone().multiplyScalar(WIND_SPEED * (0.6 + rng.next() * 0.8)),
      phase: rng.next() * Math.PI * 2,
      spinSpeed: 1.5 + rng.next() * 3,
      scale: 0.12 + rng.next() * 0.18,
    }));
  }, []);

  // Initialize pollen/dust motes
  const pollen = useMemo<ParticleData[]>(() => {
    const rng = createRng(WORLD_SEEDS.pollen);
    return Array.from({ length: POLLEN_COUNT }, () => ({
      position: new THREE.Vector3(
        (rng.next() - 0.5) * DRIFT_RADIUS * 2,
        1 + rng.next() * 8,
        (rng.next() - 0.5) * DRIFT_RADIUS * 2
      ),
      velocity: WIND_DIR.clone().multiplyScalar(WIND_SPEED * (0.2 + rng.next() * 0.4)),
      phase: rng.next() * Math.PI * 2,
      spinSpeed: 0,
      scale: 0.03 + rng.next() * 0.04,
    }));
  }, []);

  // Leaf colors
  const leafColors = useMemo(() => {
    const rng = createRng(WORLD_SEEDS.leaves ^ 0x5bf03635);
    const colors = ["#ea580c", "#f97316", "#fb923c", "#65a30d", "#d97706", "#f59e0b"];
    const arr = new Float32Array(LEAF_COUNT * 3);
    const c = new THREE.Color();
    for (let i = 0; i < LEAF_COUNT; i++) {
      c.set(rng.pick(colors));
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, []);

  // Set initial leaf colors
  React.useEffect(() => {
    if (leafMeshRef.current) {
      const tempColor = new THREE.Color();
      for (let i = 0; i < LEAF_COUNT; i++) {
        tempColor.setRGB(leafColors[i * 3], leafColors[i * 3 + 1], leafColors[i * 3 + 2]);
        leafMeshRef.current.setColorAt(i, tempColor);
      }
      if (leafMeshRef.current.instanceColor) {
        leafMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [leafColors]);

  // Leaf geometry – flat rhombus shape
  const leafGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.lineTo(0.3, 0);
    shape.lineTo(0, 0.5);
    shape.lineTo(-0.3, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    geo.center();
    return geo;
  }, []);

  const pollenGeo = useMemo(() => new THREE.SphereGeometry(1, 4, 4), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Update leaves
    if (leafMeshRef.current) {
      leaves.forEach((leaf, i) => {
        // Move with wind
        leaf.position.addScaledVector(leaf.velocity, dt);

        // Sinusoidal float (tumbling through air)
        leaf.position.y += Math.sin(t * 1.2 + leaf.phase) * 0.008;
        leaf.position.x += Math.sin(t * 0.7 + leaf.phase * 2) * 0.01;

        // Slowly fall
        leaf.position.y -= 0.3 * dt;

        // Recycle when out of bounds or too low
        const dist = Math.sqrt(leaf.position.x ** 2 + leaf.position.z ** 2);
        if (dist > DRIFT_RADIUS || leaf.position.y < 0.5) {
          // Reset to upwind edge
          leaf.position.set(
            -WIND_DIR.x * DRIFT_RADIUS + (Math.random() - 0.5) * 30,
            3 + Math.random() * 9,
            -WIND_DIR.z * DRIFT_RADIUS + (Math.random() - 0.5) * 30
          );
        }

        dummy.position.copy(leaf.position);
        dummy.rotation.set(
          Math.sin(t * leaf.spinSpeed + leaf.phase) * 0.8,
          t * leaf.spinSpeed * 0.5,
          Math.cos(t * leaf.spinSpeed * 0.7 + leaf.phase) * 0.6
        );
        dummy.scale.setScalar(leaf.scale);
        dummy.updateMatrix();
        leafMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      leafMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update pollen/dust motes
    if (pollenMeshRef.current) {
      pollen.forEach((p, i) => {
        p.position.addScaledVector(p.velocity, dt);
        p.position.y += Math.sin(t * 0.6 + p.phase) * 0.005;
        p.position.x += Math.cos(t * 0.4 + p.phase * 1.5) * 0.006;

        const dist = Math.sqrt(p.position.x ** 2 + p.position.z ** 2);
        if (dist > DRIFT_RADIUS || p.position.y < 0.3) {
          p.position.set(
            -WIND_DIR.x * DRIFT_RADIUS + (Math.random() - 0.5) * 35,
            1 + Math.random() * 8,
            -WIND_DIR.z * DRIFT_RADIUS + (Math.random() - 0.5) * 35
          );
        }

        dummy.position.copy(p.position);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        pollenMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      pollenMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Drifting Leaves */}
      <instancedMesh
        ref={leafMeshRef}
        args={[leafGeo, undefined, LEAF_COUNT]}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial
          roughness={0.7}
          metalness={0.05}
          flatShading
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Floating Pollen / Dust Motes */}
      <instancedMesh
        ref={pollenMeshRef}
        args={[pollenGeo, undefined, POLLEN_COUNT]}
        castShadow={false}
        receiveShadow={false}
        frustumCulled={false}
        raycast={() => null}
      >
        <meshStandardMaterial
          color={isNight ? "#93c5fd" : "#fef3c7"}
          emissive={isNight ? "#60a5fa" : "#fbbf24"}
          emissiveIntensity={isNight ? 1.5 : 0.8}
          roughness={0.4}
          transparent
          opacity={0.7}
        />
      </instancedMesh>
    </group>
  );
}
