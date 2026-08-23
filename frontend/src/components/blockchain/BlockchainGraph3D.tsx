"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { Block } from "@/store/blockchainEngine";

/**
 * Interactive 3D block-node graph.
 *
 * Blocks are laid out along a gently rising helix so a long chain stays
 * readable in perspective, and consecutive blocks are joined by an animated
 * emissive "laser" link representing the previousHash pointer.
 */

const NODE_SPACING = 3.2;
/** Vertical rise per block — keeps deep chains from collapsing into one line. */
const HELIX_RISE = 0.28;
/** Lateral sway amplitude, so the chain reads as a 3D ribbon, not a rod. */
const HELIX_SWAY = 1.15;

export function blockNodePosition(index: number): [number, number, number] {
  return [
    index * NODE_SPACING,
    index * HELIX_RISE,
    Math.sin(index * 0.7) * HELIX_SWAY,
  ];
}

const TYPE_COLORS: Record<string, string> = {
  MINT: "#a78bfa",
  PURCHASE: "#34d399",
  SERVICE: "#fbbf24",
  TRANSFER: "#38bdf8",
};

function blockColor(block: Block): string {
  if (block.blockNumber === 0) return "#4ade80";
  const type = block.transactions[0]?.type;
  return (type && TYPE_COLORS[type]) || "#a78bfa";
}

function BlockNode({
  block,
  index,
  isSelected,
  onSelect,
}: {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: (blockNumber: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => blockNodePosition(index), [index]);
  const color = useMemo(() => blockColor(block), [block]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isSelected ? 0.9 : 0.28);
    }
    if (haloRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      haloRef.current.scale.setScalar(isSelected ? pulse : 1);
    }
  });

  return (
    <group position={position}>
      {/* Block cube — a sealed cryptographic container */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(block.blockNumber);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[1.25, 1.25, 1.25]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : 0.45}
          metalness={0.7}
          roughness={0.22}
          transparent
          opacity={isSelected ? 1 : 0.88}
        />
      </mesh>

      {/* Selection halo */}
      {isSelected && (
        <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.15, 1.35, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating label */}
      <Html center distanceFactor={12} position={[0, 1.3, 0]} zIndexRange={[10, 0]}>
        <div
          className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none"
          style={{
            background: "rgba(2, 6, 23, 0.85)",
            border: `1px solid ${color}66`,
            color,
          }}
        >
          {block.blockNumber === 0 ? "GENESIS #0" : `#${block.blockNumber}`}
          <span className="text-slate-400 ml-1">{block.transactions.length} tx</span>
        </div>
      </Html>
    </group>
  );
}

/** Animated hash-pointer link between a block and its parent. */
function ChainLink({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const start = useMemo(() => new THREE.Vector3(...from), [from]);
  const end = useMemo(() => new THREE.Vector3(...to), [to]);

  useFrame((state) => {
    if (!pulseRef.current) return;
    // A packet of light travelling parent → child, once per second.
    const t = (state.clock.elapsedTime % 1.4) / 1.4;
    pulseRef.current.position.lerpVectors(start, end, t);
  });

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} transparent opacity={0.55} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Camera placement that frames a chain of the given length end to end. */
export function framingFor(length: number) {
  const center = blockNodePosition((length - 1) / 2);
  const span = Math.max(1, length - 1) * NODE_SPACING;
  const distance = Math.min(60, Math.max(8.5, span * 0.55 + 6.5));
  return {
    center,
    position: [center[0], center[1] + distance * 0.42, center[2] + distance] as [
      number,
      number,
      number,
    ],
  };
}

function GraphScene({
  chain,
  selectedBlockNumber,
  onSelect,
}: {
  chain: Block[];
  selectedBlockNumber: number | null;
  onSelect: (blockNumber: number) => void;
}) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();

  const { center, position: framedPosition } = useMemo(
    () => framingFor(chain.length),
    [chain.length]
  );

  /**
   * Mining appends a block off the right-hand edge. Glide the camera to the new
   * framing instead of leaving the freshly mined block outside the viewport —
   * while still letting the user orbit freely once the move settles.
   */
  const glideTarget = useRef<THREE.Vector3 | null>(null);
  const glideCenter = useRef(new THREE.Vector3(...center));

  useEffect(() => {
    glideTarget.current = new THREE.Vector3(...framedPosition);
    glideCenter.current.set(...center);
  }, [framedPosition, center]);

  useFrame((_, delta) => {
    const goal = glideTarget.current;
    if (!goal) return;

    const t = Math.min(1, delta * 3.5);
    camera.position.lerp(goal, t);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(glideCenter.current, t);
      controls.update();
    }

    // Close enough — hand control back to the user.
    if (camera.position.distanceTo(goal) < 0.05) glideTarget.current = null;
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 14, 10]} intensity={1.4} />
      <pointLight position={[center[0], 6, 8]} intensity={40} color="#a78bfa" distance={60} />

      {chain.map((block, index) => (
        <React.Fragment key={block.hash}>
          {index > 0 && (
            <ChainLink
              from={blockNodePosition(index - 1)}
              to={blockNodePosition(index)}
              color={blockColor(block)}
            />
          )}
          <BlockNode
            block={block}
            index={index}
            isSelected={block.blockNumber === selectedBlockNumber}
            onSelect={onSelect}
          />
        </React.Fragment>
      ))}

      {/* Grid width tracks the chain so it frames the blocks instead of dwarfing them. */}
      <gridHelper
        args={[Math.max(24, chain.length * NODE_SPACING * 2), 24, "#4c1d95", "#1e293b"]}
        position={[center[0], -2.2, 0]}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        minDistance={5}
        maxDistance={70}
        maxPolarAngle={Math.PI * 0.85}
        // A user grab cancels the auto-framing glide immediately.
        onStart={() => {
          glideTarget.current = null;
        }}
      />
    </>
  );
}

export default function BlockchainGraph3D({
  chain,
  selectedBlockNumber,
  onSelect,
}: {
  chain: Block[];
  selectedBlockNumber: number | null;
  onSelect: (blockNumber: number) => void;
}) {
  // Initial placement only; GraphScene re-frames as the chain grows, so this is
  // deliberately computed from the length at first render and never revised.
  const [initialLength] = useState(chain.length);
  const cameraPosition = useMemo(() => framingFor(initialLength).position, [initialLength]);

  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 50, near: 0.1, far: 400 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#050313"]} />
      <fog attach="fog" args={["#050313", 30, 120]} />
      <GraphScene chain={chain} selectedBlockNumber={selectedBlockNumber} onSelect={onSelect} />
    </Canvas>
  );
}
