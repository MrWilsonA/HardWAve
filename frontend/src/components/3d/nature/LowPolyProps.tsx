"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { getTerrainHeight } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Low-Poly Nature Props & Outer Circle Village
   – Custom Procedural Roofs: Gabled & Hip roofs with matching rectangular aspect ratio & eaves overhang
   – 100% aligned with house walls (Zero diamond rotation / zero wall corners poking through)
   – Varied House Architecture: 2-Story Villas, Medium Farmhouses, Small Cottages, Alpine Chalets
   – Street lanterns safely on road shoulders
   ─────────────────────────────────────────── */

/* ── Procedural Gabled Roof (Pitched Triangular Prism aligned with box walls) ── */
function GabledRoofMesh({
  width,
  depth,
  height,
  color,
  overhang = 0.35,
}: {
  width: number;
  depth: number;
  height: number;
  color: string;
  overhang?: number;
}) {
  const geo = useMemo(() => {
    const w = (width + overhang * 2) / 2;
    const d = (depth + overhang * 2) / 2;
    const g = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      // Front triangular gable
      0, height, d,  -w, 0, d,  w, 0, d,
      // Back triangular gable
      0, height, -d,  w, 0, -d,  -w, 0, -d,
      // Right sloped pitch
      0, height, d,  w, 0, d,  w, 0, -d,
      0, height, d,  w, 0, -d,  0, height, -d,
      // Left sloped pitch
      0, height, d,  0, height, -d,  -w, 0, -d,
      0, height, d,  -w, 0, -d,  -w, 0, d,
      // Bottom closure
      -w, 0, d,  -w, 0, -d,  w, 0, -d,
      -w, 0, d,  w, 0, -d,  w, 0, d,
    ]);

    g.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return g;
  }, [width, depth, height, overhang]);

  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={color} flatShading roughness={0.7} />
    </mesh>
  );
}

/* ── Procedural Hip Roof (4-sided sloping pyramid aligned with box walls) ── */
function HipRoofMesh({
  width,
  depth,
  height,
  color,
  overhang = 0.35,
}: {
  width: number;
  depth: number;
  height: number;
  color: string;
  overhang?: number;
}) {
  const geo = useMemo(() => {
    const w = (width + overhang * 2) / 2;
    const d = (depth + overhang * 2) / 2;
    const g = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      // Front face
      0, height, 0,  -w, 0, d,  w, 0, d,
      // Right face
      0, height, 0,  w, 0, d,  w, 0, -d,
      // Back face
      0, height, 0,  w, 0, -d,  -w, 0, -d,
      // Left face
      0, height, 0,  -w, 0, -d,  -w, 0, d,
      // Bottom closure
      -w, 0, d,  -w, 0, -d,  w, 0, -d,
      -w, 0, d,  w, 0, -d,  w, 0, d,
    ]);

    g.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return g;
  }, [width, depth, height, overhang]);

  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={color} flatShading roughness={0.7} />
    </mesh>
  );
}

/* ── 1. Small Cozy Cottage (1-Floor) ── */
interface HouseProps {
  position: [number, number];
  rotation?: number;
  roofColor?: string;
  wallColor?: string;
  lampMultiplier?: number;
  scale?: number;
}

function SmallCottage({
  position: [x, z],
  rotation = 0,
  roofColor = "#047857",
  wallColor = "#fef3c7",
  lampMultiplier = 1,
  scale = 1,
}: HouseProps) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
      {/* Stone Foundation */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.3, 2.4]} />
        <meshStandardMaterial color="#78716c" flatShading roughness={0.9} />
      </mesh>

      {/* Main Wall Body: width 2.6, height 1.5, depth 2.2 */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.5, 2.2]} />
        <meshStandardMaterial color={wallColor} flatShading roughness={0.8} />
      </mesh>

      {/* Perfectly Fitted Gabled Roof (top of walls is y = 1.80) */}
      <group position={[0, 1.8, 0]}>
        <GabledRoofMesh width={2.6} depth={2.2} height={1.2} color={roofColor} overhang={0.3} />
      </group>

      {/* Wooden Front Door */}
      <mesh position={[0, 0.7, 1.12]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.08]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
      </mesh>

      {/* Windows with Warm Glow */}
      {[-0.7, 0.7].map((wx, i) => (
        <mesh key={i} position={[wx, 1.1, 1.12]}>
          <boxGeometry args={[0.45, 0.45, 0.06]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={1.8 * lampMultiplier}
          />
        </mesh>
      ))}

      {/* Stone Chimney */}
      <group position={[0.75, 2.3, -0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 1.2, 0.4]} />
          <meshStandardMaterial color="#57534e" flatShading roughness={0.9} />
        </mesh>
      </group>

      {/* Porch Light */}
      <pointLight position={[0, 1.4, 1.4]} intensity={2.5 * lampMultiplier} color="#fde047" distance={6} />
    </group>
  );
}

/* ── 2. Medium Farmhouse with Porch Overhang (1.5-Floor) ── */
function MediumFarmhouse({
  position: [x, z],
  rotation = 0,
  roofColor = "#c2410c",
  wallColor = "#ffedd5",
  lampMultiplier = 1,
  scale = 1.1,
}: HouseProps) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
      {/* Stone Foundation */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.32, 2.8]} />
        <meshStandardMaterial color="#78716c" flatShading roughness={0.9} />
      </mesh>

      {/* Main Wall Body: width 3.4, height 1.8, depth 2.6 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.8, 2.6]} />
        <meshStandardMaterial color={wallColor} flatShading roughness={0.8} />
      </mesh>

      {/* Perfectly Fitted Hip Roof (top of walls is y = 2.10) */}
      <group position={[0, 2.1, 0]}>
        <HipRoofMesh width={3.4} depth={2.6} height={1.4} color={roofColor} overhang={0.35} />
      </group>

      {/* Front Porch Deck */}
      <mesh position={[0, 0.16, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.2, 1.0]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
      </mesh>

      {/* Porch Pillars */}
      {[-1.3, 1.3].map((px, i) => (
        <mesh key={i} position={[px, 0.9, 2.1]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 5]} />
          <meshStandardMaterial color="#78350f" flatShading />
        </mesh>
      ))}

      {/* Porch Overhang Roof */}
      <mesh position={[0, 1.65, 1.8]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[3.4, 0.08, 1.2]} />
        <meshStandardMaterial color={roofColor} flatShading roughness={0.7} />
      </mesh>

      {/* Front Door */}
      <mesh position={[0, 0.8, 1.32]} castShadow>
        <boxGeometry args={[0.7, 1.2, 0.08]} />
        <meshStandardMaterial color="#451a03" flatShading />
      </mesh>

      {/* Windows with Warm Glow */}
      {[-1.0, 1.0].map((wx, i) => (
        <mesh key={i} position={[wx, 1.3, 1.32]}>
          <boxGeometry args={[0.5, 0.5, 0.06]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={2.0 * lampMultiplier}
          />
        </mesh>
      ))}

      {/* Attic Dormer Window */}
      <mesh position={[0, 2.5, 1.1]}>
        <boxGeometry args={[0.45, 0.45, 0.2]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1.8 * lampMultiplier} />
      </mesh>

      {/* Stone Chimney */}
      <mesh position={[1.1, 2.9, -0.6]} castShadow>
        <boxGeometry args={[0.55, 1.4, 0.55]} />
        <meshStandardMaterial color="#57534e" flatShading roughness={0.9} />
      </mesh>

      {/* Porch Lantern */}
      <pointLight position={[0, 1.5, 2.0]} intensity={3 * lampMultiplier} color="#fde047" distance={7} />
    </group>
  );
}

/* ── 3. Grand 2-Story Villa / Townhouse ── */
function TwoStoryVilla({
  position: [x, z],
  rotation = 0,
  roofColor = "#1e3a8a",
  wallColor = "#f8fafc",
  lampMultiplier = 1,
  scale = 1.25,
}: HouseProps) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
      {/* Stone Base (1st Floor) */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.7, 3.0]} />
        <meshStandardMaterial color="#64748b" flatShading roughness={0.9} />
      </mesh>

      {/* 2nd Floor Overhang: width 4.0, height 1.5, depth 3.2 */}
      <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 1.5, 3.2]} />
        <meshStandardMaterial color={wallColor} flatShading roughness={0.8} />
      </mesh>

      {/* Decorative Wooden Beams separating floors */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[4.1, 0.12, 3.3]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>

      {/* Perfectly Fitted Hip Roof on 2nd Floor (top of walls is y = 3.20) */}
      <group position={[0, 3.2, 0]}>
        <HipRoofMesh width={4.0} depth={3.2} height={1.6} color={roofColor} overhang={0.4} />
      </group>

      {/* Front Balcony on 2nd Floor */}
      <mesh position={[0, 1.76, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 0.7]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>
      {/* Balcony Railing */}
      <mesh position={[0, 2.1, 2.1]} castShadow>
        <boxGeometry args={[2.2, 0.55, 0.05]} />
        <meshStandardMaterial color="#92400e" flatShading />
      </mesh>

      {/* Front Entrance Door (1st Floor) */}
      <mesh position={[0, 0.65, 1.52]} castShadow>
        <boxGeometry args={[0.8, 1.3, 0.08]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>

      {/* 1st Floor Windows */}
      {[-1.2, 1.2].map((wx, i) => (
        <mesh key={`w1-${i}`} position={[wx, 0.9, 1.52]}>
          <boxGeometry args={[0.55, 0.65, 0.06]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={2.0 * lampMultiplier}
          />
        </mesh>
      ))}

      {/* 2nd Floor Windows */}
      {[-1.2, 0, 1.2].map((wx, i) => (
        <mesh key={`w2-${i}`} position={[wx, 2.5, 1.62]}>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={2.2 * lampMultiplier}
          />
        </mesh>
      ))}

      {/* Double Stone Chimneys */}
      <mesh position={[-1.3, 3.8, -0.6]} castShadow>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#475569" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 3.8, -0.6]} castShadow>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#475569" flatShading roughness={0.9} />
      </mesh>

      {/* Balcony Warm Light */}
      <pointLight position={[0, 2.2, 1.8]} intensity={3.5 * lampMultiplier} color="#fde047" distance={8} />
    </group>
  );
}

/* ── 4. Modern Alpine Chalet (A-Frame Timber & Glass) ── */
function AlpineChalet({
  position: [x, z],
  rotation = 0,
  roofColor = "#374151",
  wallColor = "#78350f",
  lampMultiplier = 1,
  scale = 1.15,
}: HouseProps) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
      {/* Stone Foundation */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.3, 3.2]} />
        <meshStandardMaterial color="#78716c" flatShading roughness={0.9} />
      </mesh>

      {/* Main Timber Body: width 2.8, height 1.6, depth 2.8 */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.6, 2.8]} />
        <meshStandardMaterial color={wallColor} flatShading roughness={0.8} />
      </mesh>

      {/* Steep Alpine Gabled A-Frame Roof (covering all the way down) */}
      <group position={[0, 0.3, 0]}>
        <GabledRoofMesh width={3.2} depth={3.0} height={2.5} color={roofColor} overhang={0.3} />
      </group>

      {/* Front Glass Facade with Warm Interior Light */}
      <mesh position={[0, 1.15, 1.42]}>
        <boxGeometry args={[1.8, 1.3, 0.06]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={2.5 * lampMultiplier}
        />
      </mesh>

      {/* Timber Window Grid Over Glass */}
      <mesh position={[0, 1.15, 1.46]} castShadow>
        <boxGeometry args={[0.08, 1.3, 0.02]} />
        <meshStandardMaterial color="#451a03" flatShading />
      </mesh>
      <mesh position={[0, 1.15, 1.46]} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.02]} />
        <meshStandardMaterial color="#451a03" flatShading />
      </mesh>

      {/* Stone Chimney */}
      <mesh position={[0.9, 2.6, -0.6]} castShadow>
        <boxGeometry args={[0.45, 1.6, 0.45]} />
        <meshStandardMaterial color="#57534e" flatShading roughness={0.9} />
      </mesh>

      {/* Glow Light */}
      <pointLight position={[0, 1.4, 1.6]} intensity={3 * lampMultiplier} color="#fde047" distance={7} />
    </group>
  );
}

/* ── Rich Layered Tree ── */
interface TreeProps {
  position: [number, number];
  trunkHeight?: number;
  canopyColor?: string;
  canopyScale?: number;
  type?: "pine" | "autumn_round" | "sakura";
}

function Tree({
  position: [x, z],
  trunkHeight = 2.4,
  canopyColor = "#ea580c",
  canopyScale = 1.3,
  type = "autumn_round",
}: TreeProps) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]}>
      {/* Trunk planted firmly into the earth */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.38, trunkHeight, 6]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
      </mesh>

      {type === "pine" ? (
        <group position={[0, trunkHeight * 0.75, 0]}>
          {[0, 0.9, 1.7].map((yOff, i) => (
            <mesh
              key={i}
              position={[0, yOff * canopyScale, 0]}
              castShadow
              receiveShadow
            >
              <coneGeometry
                args={[
                  (canopyScale * 1.6) / (1 + i * 0.32),
                  canopyScale * 1.8,
                  7,
                ]}
              />
              <meshStandardMaterial
                color={canopyColor}
                flatShading
                roughness={0.85}
              />
            </mesh>
          ))}
        </group>
      ) : (
        <group position={[0, trunkHeight + canopyScale * 0.8, 0]}>
          {/* Main canopy sphere */}
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[canopyScale * 1.3, 1]} />
            <meshStandardMaterial
              color={canopyColor}
              flatShading
              roughness={0.9}
            />
          </mesh>
          {/* Detail leaf clusters */}
          {[
            [0.7, 0.3, 0.5, 0.75],
            [-0.6, 0.3, -0.5, 0.7],
            [0.4, -0.3, -0.6, 0.65],
            [-0.5, -0.2, 0.6, 0.7],
            [0, 0.7, 0, 0.8],
            [0.8, -0.1, -0.3, 0.55],
            [-0.7, 0.5, 0.3, 0.5],
          ].map(([ox, oy, oz, s], i) => (
            <mesh
              key={i}
              position={[
                (ox as number) * canopyScale,
                (oy as number) * canopyScale,
                (oz as number) * canopyScale,
              ]}
              castShadow
              receiveShadow
            >
              <dodecahedronGeometry args={[canopyScale * (s as number), 0]} />
              <meshStandardMaterial
                color={canopyColor}
                flatShading
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/* ── Street Lantern ── */
function StreetLantern({
  position: [x, z],
  lampMultiplier = 1,
}: {
  position: [number, number];
  lampMultiplier?: number;
}) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.4, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.6, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow>
        <coneGeometry args={[0.45, 0.35, 6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={3.5 * lampMultiplier}
        />
      </mesh>
      <pointLight
        position={[0, 2.8, 0]}
        intensity={6 * lampMultiplier}
        color="#f59e0b"
        distance={16}
        decay={2}
      />
    </group>
  );
}

/* ── Wooden Fence ── */
function WoodenFence({
  position: [x, z],
  rotation = 0,
}: {
  position: [number, number];
  rotation?: number;
}) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      <mesh position={[-0.9, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 5]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>
      <mesh position={[0.9, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 5]} />
        <meshStandardMaterial color="#78350f" flatShading />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.04]} />
        <meshStandardMaterial color="#92400e" flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.04]} />
        <meshStandardMaterial color="#92400e" flatShading />
      </mesh>
    </group>
  );
}

/* ── Wooden Crate ── */
function WoodenCrate({
  position: [x, z],
  scale = 1,
  rotation = 0,
}: {
  position: [number, number];
  scale?: number;
  rotation?: number;
}) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.02, 0.12, 1.02]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/* ── Low-Poly Rock ── */
function Rock({
  position: [x, z],
  scale = 1,
}: {
  position: [number, number];
  scale?: number;
}) {
  const y = getTerrainHeight(x, z);

  return (
    <mesh position={[x, y + 0.12 * scale, z]} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial color="#78716c" flatShading roughness={0.95} />
    </mesh>
  );
}

/* ── Low-Poly Bush ── */
function Bush({
  position: [x, z],
  scale = 1,
  color = "#65a30d",
}: {
  position: [number, number];
  scale?: number;
  color?: string;
}) {
  const y = getTerrainHeight(x, z);

  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0.25, 0.2, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Low-Poly Mushroom Cluster ── */
function Mushrooms({ position: [x, z] }: { position: [number, number] }) {
  const y = getTerrainHeight(x, z);
  return (
    <group position={[x, y, z]}>
      {[
        { px: 0, pz: 0, s: 1.0 },
        { px: 0.25, pz: 0.18, s: 0.7 },
        { px: -0.18, pz: 0.25, s: 0.6 },
      ].map((m, i) => (
        <group key={i} position={[m.px, 0, m.pz]} scale={m.s}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.2, 5]} />
            <meshStandardMaterial color="#fef3c7" flatShading roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.13, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ef4444" flatShading roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Log Pile ── */
function LogPile({ position: [x, z] }: { position: [number, number] }) {
  const y = getTerrainHeight(x, z);
  return (
    <group position={[x, y, z]}>
      {[
        [0, 0.1, 0, 0],
        [0.22, 0.1, 0.08, 0.3],
        [-0.18, 0.1, -0.08, -0.2],
        [0.08, 0.3, 0.04, 0.1],
      ].map(([lx, ly, lz, rot], i) => (
        <mesh key={i} position={[lx, ly, lz]} rotation={[0, rot, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.65, 6]} />
          <meshStandardMaterial color="#92400e" flatShading roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function LowPolyProps({ lampMultiplier = 1 }: { lampMultiplier?: number }) {
  const trees: { pos: [number, number]; color: string; scale: number; type: "pine" | "autumn_round" | "sakura" }[] = useMemo(
    () => [
      // Inner quadrant trees (r: 10 to 18)
      { pos: [-10, -10], color: "#ea580c", scale: 1.4, type: "autumn_round" },
      { pos: [10, -10], color: "#fb923c", scale: 1.3, type: "autumn_round" },
      { pos: [-10, 10], color: "#f97316", scale: 1.4, type: "autumn_round" },
      { pos: [10, 10], color: "#f472b6", scale: 1.3, type: "sakura" },

      // Outer ring trees well spaced between houses (r: 33 to 38)
      { pos: [-35, -16], color: "#166534", scale: 1.4, type: "pine" },
      { pos: [-35, 16], color: "#15803d", scale: 1.3, type: "pine" },
      { pos: [-16, 35], color: "#f472b6", scale: 1.4, type: "sakura" },
      { pos: [16, 35], color: "#15803d", scale: 1.4, type: "pine" },
      { pos: [35, 16], color: "#ea580c", scale: 1.3, type: "autumn_round" },
      { pos: [35, -16], color: "#166534", scale: 1.4, type: "pine" },
      { pos: [16, -35], color: "#ec4899", scale: 1.3, type: "sakura" },
      { pos: [-16, -35], color: "#15803d", scale: 1.4, type: "pine" },
    ],
    []
  );

  return (
    <group>
      {/* ── Outer Circle Village (Radius 35 to 37, perfectly aligned procedural roofs) ── */}
      
      {/* 1. North-West: Grand 2-Story Villa */}
      <TwoStoryVilla
        position={[-26, -26]}
        rotation={0.78}
        roofColor="#991b1b"
        wallColor="#f8fafc"
        lampMultiplier={lampMultiplier}
        scale={1.2}
      />

      {/* 2. West: Cozy 1-Story Small Cottage */}
      <SmallCottage
        position={[-35, 0]}
        rotation={1.57}
        roofColor="#047857"
        wallColor="#fef3c7"
        lampMultiplier={lampMultiplier}
        scale={1.0}
      />

      {/* 3. South-West: Rustic 1.5-Story Medium Farmhouse */}
      <MediumFarmhouse
        position={[-26, 26]}
        rotation={2.35}
        roofColor="#c2410c"
        wallColor="#ffedd5"
        lampMultiplier={lampMultiplier}
        scale={1.1}
      />

      {/* 4. South: Grand 2-Story Villa */}
      <TwoStoryVilla
        position={[0, 36]}
        rotation={3.14}
        roofColor="#1e3a8a"
        wallColor="#f1f5f9"
        lampMultiplier={lampMultiplier}
        scale={1.25}
      />

      {/* 5. South-East: Modern Alpine Chalet */}
      <AlpineChalet
        position={[26, 26]}
        rotation={-2.35}
        roofColor="#374151"
        wallColor="#78350f"
        lampMultiplier={lampMultiplier}
        scale={1.15}
      />

      {/* 6. East (Past Lake): Lakeside Medium Farmhouse */}
      <MediumFarmhouse
        position={[36, -4]}
        rotation={-1.57}
        roofColor="#4338ca"
        wallColor="#fef3c7"
        lampMultiplier={lampMultiplier}
        scale={1.1}
      />

      {/* 7. North-East: Cozy Small Cottage */}
      <SmallCottage
        position={[26, -26]}
        rotation={-0.78}
        roofColor="#b45309"
        wallColor="#fef3c7"
        lampMultiplier={lampMultiplier}
        scale={1.0}
      />

      {/* 8. North: Grand 2-Story Villa */}
      <TwoStoryVilla
        position={[0, -36]}
        rotation={0}
        roofColor="#831843"
        wallColor="#f8fafc"
        lampMultiplier={lampMultiplier}
        scale={1.2}
      />

      {/* ── Trees ── */}
      {trees.map((t, i) => (
        <Tree
          key={`tree-${i}`}
          position={t.pos}
          canopyColor={t.color}
          canopyScale={t.scale}
          type={t.type}
        />
      ))}

      {/* ── Street Lanterns (safe road shoulders, ZERO pavilion clipping) ── */}
      {[
        // Central Cross Road Shoulders
        [3.2, 12],
        [3.2, -12],
        [-3.2, 12],
        [-3.2, -12],
        [12, 3.2],
        [20, 3.2],
        [-12, 3.2],
        [-22, 3.2],
        // Grand Ring Outer Shoulders
        [0, 29.5],
        [0, -29.5],
        [29.5, 0],
        [-29.5, 0],
        [14, 21.5],
        [-14, 21.5],
        [14, -21.5],
        [-14, -21.5],
      ].map((pos, i) => (
        <StreetLantern
          key={`lantern-${i}`}
          position={pos as [number, number]}
          lampMultiplier={lampMultiplier}
        />
      ))}

      {/* ── Wooden Fences ── */}
      {[
        [-26, 22, 0.4],
        [26, 22, -0.4],
        [-26, -22, -0.4],
        [26, -22, 0.4],
        [-31, 0, 1.57],
      ].map(([fx, fz, rot], i) => (
        <WoodenFence key={`fence-${i}`} position={[fx, fz]} rotation={rot} />
      ))}

      {/* ── Wooden Crates near outer houses ── */}
      <WoodenCrate position={[-32, 2]} scale={0.9} rotation={0.2} />
      <WoodenCrate position={[-31.5, 2.5]} scale={0.8} rotation={-0.4} />
      <WoodenCrate position={[23, 23]} scale={1.0} rotation={0.3} />
      <WoodenCrate position={[23.5, 24]} scale={0.85} rotation={-0.2} />

      {/* ── Rocks ── */}
      {[
        [-7, -7, 1.3],
        [9, -12, 0.9],
        [-15, 10, 1.1],
        [15, 10, 0.7],
        [12, 6, 1.0],
        [-15, -12, 1.2],
        [32, 20, 0.8],
      ].map(([rx, rz, s], i) => (
        <Rock key={`rock-${i}`} position={[rx, rz]} scale={s} />
      ))}

      {/* ── Bushes ── */}
      {[
        [-7, 7],
        [12, -9],
        [-15, -9],
        [5, -15],
        [22, 5],
        [-10, 14],
        [10, 15],
      ].map((pos, i) => (
        <Bush key={`bush-${i}`} position={pos as [number, number]} />
      ))}

      {/* ── Mushroom Clusters ── */}
      <Mushrooms position={[-12, -6]} />
      <Mushrooms position={[15, 12]} />
      <Mushrooms position={[-8, 15]} />
      <Mushrooms position={[9, -9]} />

      {/* ── Log Piles near outer village houses ── */}
      <LogPile position={[-28, 24]} />
      <LogPile position={[28, -6]} />
      <LogPile position={[-28, -24]} />
    </group>
  );
}
