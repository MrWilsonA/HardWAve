"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RainWeatherProps {
  isRaining: boolean;
  buggyPos: THREE.Vector3 | [number, number, number];
}

export default function RainWeather({ isRaining, buggyPos }: RainWeatherProps) {
  const rainRef = useRef<THREE.Points>(null);
  const splashesRef = useRef<THREE.InstancedMesh>(null);
  const dropCount = 1800;
  const splashCount = 120;

  const posX = Array.isArray(buggyPos) ? buggyPos[0] : buggyPos.x;
  const posZ = Array.isArray(buggyPos) ? buggyPos[2] : buggyPos.z;

  // Rain particle positions & velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(dropCount * 3);
    const vel = new Float32Array(dropCount);

    for (let i = 0; i < dropCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 30 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      vel[i] = 16 + Math.random() * 12; // Falling speed (m/s)
    }

    return [pos, vel];
  }, [dropCount]);

  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  // Splashes dummy
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!isRaining) return;

    const currentX = Array.isArray(buggyPos) ? buggyPos[0] : buggyPos.x;
    const currentZ = Array.isArray(buggyPos) ? buggyPos[2] : buggyPos.z;

    // Animate falling rain streaks centered around the buggy
    if (rainRef.current) {
      const posAttr = rainRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < dropCount; i++) {
        array[i * 3 + 1] -= velocities[i] * delta;

        // Reset drop when hitting ground
        if (array[i * 3 + 1] < 0.2) {
          array[i * 3] = currentX + (Math.random() - 0.5) * 60;
          array[i * 3 + 1] = 28 + Math.random() * 6;
          array[i * 3 + 2] = currentZ + (Math.random() - 0.5) * 60;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Animate subtle ground splashes
    if (splashesRef.current) {
      const t = state.clock.elapsedTime;
      for (let i = 0; i < splashCount; i++) {
        const angle = (i / splashCount) * Math.PI * 2 + t * 2.5;
        const dist = 3 + (i % 8) * 3.5;
        const x = currentX + Math.cos(angle) * dist;
        const z = currentZ + Math.sin(angle) * dist;
        const scale = 0.2 + (Math.sin(t * 8 + i) * 0.5 + 0.5) * 0.35;

        dummy.position.set(x, 0.22, z);
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
      {/* 1. Vertical Falling Rain Points */}
      <points ref={rainRef} geometry={rainGeo}>
        <pointsMaterial
          color="#bae6fd"
          size={0.16}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Ground Rain Splash Ripples */}
      <instancedMesh
        ref={splashesRef}
        args={[undefined, undefined, splashCount]}
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
