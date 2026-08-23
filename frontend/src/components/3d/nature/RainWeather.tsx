"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng, WORLD_SEEDS } from "@/utils/rng";
import { liveTelemetry } from "@/store/worldTelemetry";

const DROP_COUNT = 1800;
const SPLASH_COUNT = 120;
/** Rain volume tracks the buggy, so drops only exist where they can be seen. */
const FIELD_SIZE = 60;

export default function RainWeather({ isRaining }: { isRaining: boolean }) {
  const rainRef = useRef<THREE.Points>(null);
  const splashesRef = useRef<THREE.InstancedMesh>(null);

  // Deterministic seeding keeps the storm identical across remounts.
  const [positions, velocities] = useMemo(() => {
    const rng = createRng(WORLD_SEEDS.rain);
    const pos = new Float32Array(DROP_COUNT * 3);
    const vel = new Float32Array(DROP_COUNT);

    for (let i = 0; i < DROP_COUNT; i++) {
      pos[i * 3] = (rng.next() - 0.5) * FIELD_SIZE;
      pos[i * 3 + 1] = rng.next() * 30 + 0.2;
      pos[i * 3 + 2] = (rng.next() - 0.5) * FIELD_SIZE;
      vel[i] = 16 + rng.next() * 12; // Falling speed (m/s)
    }

    return [pos, vel] as const;
  }, []);

  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Recycling drops needs randomness every frame; a dedicated stream keeps the
  // initial layout reproducible while the storm still looks chaotic.
  const respawnRng = useMemo(() => createRng(WORLD_SEEDS.rain ^ 0x9e3779b9), []);

  useFrame((state, delta) => {
    if (!isRaining) return;

    const { x: currentX, z: currentZ } = liveTelemetry.position;

    if (rainRef.current) {
      const posAttr = rainRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < DROP_COUNT; i++) {
        array[i * 3 + 1] -= velocities[i] * delta;

        // Recycle the drop above the buggy once it reaches the ground.
        if (array[i * 3 + 1] < 0.2) {
          array[i * 3] = currentX + (respawnRng.next() - 0.5) * FIELD_SIZE;
          array[i * 3 + 1] = 28 + respawnRng.next() * 6;
          array[i * 3 + 2] = currentZ + (respawnRng.next() - 0.5) * FIELD_SIZE;
        }
      }
      posAttr.needsUpdate = true;
    }

    if (splashesRef.current) {
      const t = state.clock.elapsedTime;
      for (let i = 0; i < SPLASH_COUNT; i++) {
        const angle = (i / SPLASH_COUNT) * Math.PI * 2 + t * 2.5;
        const dist = 3 + (i % 8) * 3.5;
        const scale = 0.2 + (Math.sin(t * 8 + i) * 0.5 + 0.5) * 0.35;

        dummy.position.set(
          currentX + Math.cos(angle) * dist,
          0.22,
          currentZ + Math.sin(angle) * dist
        );
        dummy.scale.set(scale, 0.05, scale);
        dummy.updateMatrix();
        splashesRef.current.setMatrixAt(i, dummy.matrix);
      }
      splashesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!isRaining) return null;

  return (
    <group>
      {/* 1. Vertical falling rain streaks */}
      <points ref={rainRef} geometry={rainGeo} frustumCulled={false} raycast={() => null}>
        <pointsMaterial
          color="#bae6fd"
          size={0.16}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Ground splash ripples */}
      <instancedMesh
        ref={splashesRef}
        args={[undefined, undefined, SPLASH_COUNT]}
        frustumCulled={false}
        raycast={() => null}
      >
        <ringGeometry args={[0.1, 0.35, 8]} />
        <meshBasicMaterial
          color="#e0f2fe"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
