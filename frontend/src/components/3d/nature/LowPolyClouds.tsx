"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DayNightState } from "@/hooks/useDayNightCycle";

/* ───────────────────────────────────────────
   Low-Poly Fluffy 3D Clouds
   – Clustered low-poly puffy cloud meshes
   – Drifts gently across the sky with wind (West → East)
   – Dynamic color transitions: Fluffy white by day, peach/amber sunset, midnight indigo at night
   ─────────────────────────────────────────── */

interface CloudData {
  initialX: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  clusters: { offset: [number, number, number]; scale: number }[];
}

export default function LowPolyClouds({ dayNight }: { dayNight: DayNightState }) {
  const { isNight, progress } = dayNight;
  const cloudsGroupRef = useRef<THREE.Group>(null);

  // Generate 12 distinct fluffy cloud clusters
  const clouds = useMemo<CloudData[]>(() => {
    const list: CloudData[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const initialX = -60 + (i / count) * 120 + (Math.random() - 0.5) * 15;
      const y = 22 + Math.random() * 12; // Altitude between 22 and 34
      const z = -45 + Math.random() * 90;
      const scale = 1.6 + Math.random() * 1.4;
      const speed = 0.8 + Math.random() * 0.6;

      // 4 to 6 sub-puffs per cloud
      const puffCount = 4 + Math.floor(Math.random() * 3);
      const clusters: { offset: [number, number, number]; scale: number }[] = [
        { offset: [0, 0, 0], scale: 1.0 }, // Central puff
      ];

      for (let p = 1; p < puffCount; p++) {
        clusters.push({
          offset: [
            (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.3) * 1.2,
            (Math.random() - 0.5) * 2.2,
          ],
          scale: 0.6 + Math.random() * 0.55,
        });
      }

      list.push({ initialX, y, z, scale, speed, clusters });
    }
    return list;
  }, []);

  // Dynamic cloud color based on time of day
  const cloudColor = useMemo(() => {
    if (isNight) return "#1e293b"; // Dark slate at night
    // Sunset window around progress ~0.45 to 0.55
    if (progress > 0.42 && progress < 0.58) return "#fed7aa"; // Warm peach / golden hour
    return "#ffffff"; // Bright fluffy white
  }, [isNight, progress]);

  // Cloud position tracking state
  const positions = useRef(clouds.map((c) => ({ x: c.initialX, y: c.y, z: c.z })));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.children.forEach((cloudGroup, i) => {
        const c = clouds[i];
        const pos = positions.current[i];

        // Drift slowly with wind
        pos.x += c.speed * dt * 2.0;

        // Wrap around horizon boundary
        if (pos.x > 65) {
          pos.x = -65;
        }

        cloudGroup.position.set(pos.x, pos.y, pos.z);
      });
    }
  });

  return (
    <group ref={cloudsGroupRef}>
      {clouds.map((c, i) => (
        <group key={`cloud-${i}`} position={[c.initialX, c.y, c.z]} scale={c.scale}>
          {c.clusters.map((puff, pi) => (
            <mesh
              key={`puff-${pi}`}
              position={puff.offset}
              scale={puff.scale}
              castShadow
            >
              <dodecahedronGeometry args={[1.5, 1]} />
              <meshStandardMaterial
                color={cloudColor}
                flatShading
                roughness={0.9}
                transparent
                opacity={isNight ? 0.65 : 0.92}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
