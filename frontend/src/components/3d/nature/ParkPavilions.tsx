"use client";

import React, { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Cpu, Boxes, Wrench, QrCode, Layers, Sparkles } from "lucide-react";
import { getTerrainHeight } from "@/utils/terrainPhysics";
import { THEME } from "@/theme/designSystem";

export interface StationDef {
  id: string;
  label: string;
  iconName: "gpu" | "blockchain" | "service" | "scanner" | "showroom";
  position: [number, number, number];
  modelPath: string;
  targetSize: number;
  color: string;
  description: string;
}

export const STATIONS: StationDef[] = [
  {
    id: "gpu_lab",
    label: "GPU Inspection Lab",
    iconName: "gpu",
    position: [-16, 0, -16],
    modelPath: "/models/gpu.glb",
    targetSize: 1.65,
    color: "#f87171",
    description: "RTX 3090 3D Digital Twin & Exploded Assembly",
  },
  {
    id: "blockchain_vault",
    label: "Blockchain Vault",
    iconName: "blockchain",
    position: [20, 0, -16],
    modelPath: "/models/ssd.glb",
    targetSize: 1.5,
    color: "#a78bfa",
    description: "Samsung NVMe M.2 SSD • ERC-721 Hardware Ledger",
  },
  {
    id: "service_workshop",
    label: "Service Workshop",
    iconName: "service",
    position: [-18, 0, 18],
    modelPath: "/models/fan.glb",
    targetSize: 1.15, // Reduced cooling fan size as requested!
    color: "#fbbf24",
    description: "RGB Cooling Fan • Maintenance & Thermal Logs",
  },
  {
    id: "qr_gate",
    label: "QR Scanner Gate",
    iconName: "scanner",
    position: [0, 0, -25],
    modelPath: "/models/ram.glb",
    targetSize: 1.5,
    color: "#34d399",
    description: "HyperX DDR4 RAM Module • Barcode & Serial Registry",
  },
  {
    id: "showroom",
    label: "Hardware Gallery",
    iconName: "showroom",
    position: [22, 0, 18],
    modelPath: "/models/motherboard.glb",
    targetSize: 1.7,
    color: "#38bdf8",
    description: "NZXT Z490 Motherboard Architecture Showcase",
  },
];

export function StationIcon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  switch (name) {
    case "gpu":
      return <Cpu size={size} color={color || "#f87171"} />;
    case "blockchain":
      return <Boxes size={size} color={color || "#a78bfa"} />;
    case "service":
      return <Wrench size={size} color={color || "#fbbf24"} />;
    case "scanner":
      return <QrCode size={size} color={color || "#34d399"} />;
    case "showroom":
      return <Layers size={size} color={color || "#38bdf8"} />;
    default:
      return <Sparkles size={size} color={color || "#fbbf24"} />;
  }
}

/* ── Aesthetic Low-Poly Hardware Exhibition Pavilion ── */
function PavilionPedestal({
  station,
  isNear,
  lampMultiplier = 1,
}: {
  station: StationDef;
  isNear: boolean;
  lampMultiplier?: number;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const baseY = getTerrainHeight(station.position[0], station.position[2]);

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.7;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.5;
    }
  });

  return (
    <group position={[station.position[0], baseY, station.position[2]]}>
      {/* Multi-tiered Stone Plinth */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.2, 4.6, 0.3, 8]} />
        <meshStandardMaterial color="#374151" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.5, 0.2, 8]} />
        <meshStandardMaterial color="#4b5563" flatShading roughness={0.85} />
      </mesh>

      {/* Cyber Neon Floor Inlay Ring */}
      <mesh ref={ringRef} position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.35, 32]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={3 * lampMultiplier}
        />
      </mesh>

      {/* Central Pedestal Pillar (comfortable display height) */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.85, 0.85, 8]} />
        <meshStandardMaterial color="#44403c" flatShading roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Top Glass/Neon Platform Table */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <cylinderGeometry args={[1.25, 0.85, 0.12, 8]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Platform Neon Trim Accent */}
      <mesh position={[0, 1.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.18, 24]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={2.5 * lampMultiplier}
        />
      </mesh>

      {/* 4 Corner Cedar Wood Pillars (Height 3.8, spacious & airy) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 3.4, 2.1, Math.sin(angle) * 3.4]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.14, 3.8, 6]} />
          <meshStandardMaterial color="#78350f" flatShading roughness={0.9} />
        </mesh>
      ))}

      {/* Pavilion Elevated Grand Roof (Raised to y = 4.25 for spacious 2.3m headroom) */}
      <group position={[0, 4.25, 0]}>
        <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[5.2, 1.5, 4]} />
          <meshStandardMaterial
            color="#92400e"
            flatShading
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1.5 * lampMultiplier}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 3D Computer Hardware Component (Auto-normalized scale & centered at y = 1.95) */}
      <group ref={modelRef} position={[0, 1.95, 0]}>
        <Suspense fallback={<ProceduralHardwareHologram color={station.color} />}>
          <NormalizedGLBModel path={station.modelPath} targetSize={station.targetSize} />
        </Suspense>
      </group>

      {/* Accent Point Light */}
      <pointLight
        position={[0, 3.6, 0]}
        intensity={6 * lampMultiplier}
        color={station.color}
        distance={15}
        decay={2}
      />

      {/* Floating 3D Info Badge when Player is Near */}
      {isNear && (
        <Html
          position={[0, 6.4, 0]}
          center
          distanceFactor={22}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="px-5 py-3 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200 select-none"
            style={{
              background: THEME.colors.glass.bgElevated,
              borderColor: station.color,
              boxShadow: `0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${station.color}40`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `${station.color}20`,
                border: `1px solid ${station.color}50`,
              }}
            >
              <StationIcon name={station.iconName} size={22} color={station.color} />
            </div>

            <div className="text-left">
              <p className="text-sm font-extrabold tracking-wide" style={{ color: station.color }}>
                {station.label}
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                {station.description}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold">
                <Sparkles size={11} className="text-amber-400" />
                <span>Press E or Click Banner to Inspect</span>
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ───────────────────────────────────────────
   Auto-Normalizing GLTF Hardware Model
   – Computes accurate 3D bounding box
   – Wraps in isolated container & centers geometry perfectly to (0, 0, 0)
   – Normalizes max dimension to targetSize
   – Sets double-sided materials & crisp shadow casting
   ─────────────────────────────────────────── */
function NormalizedGLBModel({ path, targetSize = 1.65 }: { path: string; targetSize?: number }) {
  const { scene } = useGLTF(path);

  const { wrapperGroup, calculatedScale } = useMemo(() => {
    const clone = scene.clone(true);
    
    // Compute bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Offset cloned model inside wrapper so center is exactly at (0, 0, 0)
    clone.position.set(-center.x, -center.y, -center.z);

    // Scale factor so max dimension matches targetSize
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = targetSize / (maxDim > 0.001 ? maxDim : 1);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              m.side = THREE.DoubleSide;
              m.depthWrite = true;
            });
          } else {
            mesh.material.side = THREE.DoubleSide;
            mesh.material.depthWrite = true;
          }
        }
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);

    return { wrapperGroup: wrapper, calculatedScale: s };
  }, [scene, targetSize]);

  return (
    <Float speed={2.2} rotationIntensity={0.2} floatIntensity={0.35}>
      <group scale={calculatedScale} rotation={[0.22, 0, 0]}>
        <primitive object={wrapperGroup} />
      </group>
    </Float>
  );
}

/* Fallback Holographic CPU Chip while loading GLTF */
function ProceduralHardwareHologram({ color = "#38bdf8" }: { color?: string }) {
  return (
    <Float speed={3} rotationIntensity={0.6} floatIntensity={0.8}>
      <group>
        {/* Silicon Substrate Base */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.08, 1.2]} />
          <meshStandardMaterial color="#022c22" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Metallic Heat Spreader IHS */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.85, 0.08, 0.85]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Holographic Glowing Core Node */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.08, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

interface ParkPavilionsProps {
  buggyPosition: THREE.Vector3;
  lampMultiplier?: number;
  onStationEnter?: (station: StationDef) => void;
  onStationLeave?: () => void;
}

export default function ParkPavilions({
  buggyPosition,
  lampMultiplier = 1,
  onStationEnter,
  onStationLeave,
}: ParkPavilionsProps) {
  const activeStation = useRef<string | null>(null);

  const nearStations = STATIONS.map((station) => {
    const dx = buggyPosition.x - station.position[0];
    const dz = buggyPosition.z - station.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isNear = dist < 8.8; // Generous trigger zone

    if (isNear && activeStation.current !== station.id) {
      activeStation.current = station.id;
      onStationEnter?.(station);
    }

    return { station, isNear };
  });

  if (!nearStations.some((s) => s.isNear) && activeStation.current) {
    activeStation.current = null;
    onStationLeave?.();
  }

  return (
    <group>
      {nearStations.map(({ station, isNear }) => (
        <PavilionPedestal
          key={station.id}
          station={station}
          isNear={isNear}
          lampMultiplier={lampMultiplier}
        />
      ))}
    </group>
  );
}

// Preload all 5 hardware GLTF models
STATIONS.forEach((s) => {
  useGLTF.preload(s.modelPath);
});
