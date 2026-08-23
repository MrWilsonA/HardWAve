"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import {
  X,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Coins,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore, HardwareUnit } from "@/store/hardwareStore";
import { useBlockchainEngine } from "@/store/blockchainEngine";

/* ───────────────────────────────────────────
   Interactive 3D Exploded RTX 3090 GPU Assembly
   ─────────────────────────────────────────── */
function ExplodedGPUModel({
  explodeFactor,
  selectedPart,
  onSelectPart,
  hasFanReplacement,
}: {
  explodeFactor: number;
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  hasFanReplacement: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle auto-rotation when idle
  useFrame((_, delta) => {
    if (groupRef.current && !selectedPart) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── 1. Aluminum Backplate (Moves backward in Z: -1.2m) ── */}
      <group
        position={[0, 0, -1.2 * explodeFactor]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("backplate");
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 2.0, 0.1]} />
          <meshStandardMaterial
            color={selectedPart === "backplate" ? "#38bdf8" : "#1e293b"}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        {/* RTX Logo Stencil */}
        <mesh position={[1.2, 0, -0.06]}>
          <planeGeometry args={[1.2, 0.4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={selectedPart === "backplate" ? 1.5 : 0.4}
          />
        </mesh>
      </group>

      {/* ── 2. Core PCB Circuit Board (Center anchor: Z: 0) ── */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("pcb");
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.0, 1.85, 0.08]} />
          <meshStandardMaterial
            color={selectedPart === "pcb" ? "#38bdf8" : "#022c22"}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* GA102 GPU Silicon Die */}
        <mesh
          position={[0.2, 0, 0.06]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart("silicon_die");
          }}
        >
          <boxGeometry args={[1.1, 1.1, 0.06]} />
          <meshStandardMaterial
            color={selectedPart === "silicon_die" ? "#38bdf8" : "#0f172a"}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* 24GB GDDR6X VRAM Modules (Surrounding Silicon Die) */}
        {[-0.8, 1.2].map((vx, i) => (
          <group
            key={`vram-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart("vram");
            }}
          >
            <mesh position={[vx, 0.5, 0.05]} castShadow>
              <boxGeometry args={[0.55, 0.4, 0.04]} />
              <meshStandardMaterial
                color={selectedPart === "vram" ? "#38bdf8" : "#1e1b4b"}
                emissive={selectedPart === "vram" ? "#818cf8" : "#000000"}
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[vx, -0.5, 0.05]} castShadow>
              <boxGeometry args={[0.55, 0.4, 0.04]} />
              <meshStandardMaterial
                color={selectedPart === "vram" ? "#38bdf8" : "#1e1b4b"}
                emissive={selectedPart === "vram" ? "#818cf8" : "#000000"}
                emissiveIntensity={0.5}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}

        {/* 18-Phase VRM Power Stages */}
        <group
          position={[-1.4, 0, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart("vrm");
          }}
        >
          {[-0.6, -0.3, 0, 0.3, 0.6].map((vy, vi) => (
            <mesh key={`vrm-${vi}`} position={[0, vy, 0]} castShadow>
              <boxGeometry args={[0.3, 0.2, 0.08]} />
              <meshStandardMaterial
                color={selectedPart === "vrm" ? "#38bdf8" : "#334155"}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── 3. Aluminum Fin Stack & Copper Heatpipes (Moves forward: Z: +1.0m) ── */}
      <group
        position={[0, 0, 1.0 * explodeFactor]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("heatsink");
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.1, 1.9, 0.6]} />
          <meshStandardMaterial
            color={selectedPart === "heatsink" ? "#38bdf8" : "#94a3b8"}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {/* Copper Heatpipes */}
        {[-0.6, -0.2, 0.2, 0.6].map((py, pi) => (
          <mesh key={`pipe-${pi}`} position={[0, py, 0.32]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 4.2, 8]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ── 4. Triple Cooling Fans (Moves forward: Z: +2.0m) ── */}
      <group position={[0, 0, 2.0 * explodeFactor]}>
        {[-1.3, 0, 1.3].map((fx, fi) => (
          <group
            key={`fan-${fi}`}
            position={[fx, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart("cooling_fan");
            }}
          >
            {/* Fan Housing Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.48, 0.62, 24]} />
              <meshStandardMaterial
                color={
                  selectedPart === "cooling_fan"
                    ? "#38bdf8"
                    : hasFanReplacement
                    ? "#f59e0b" // Amber alert state for replaced part!
                    : "#1e293b"
                }
                emissive={
                  hasFanReplacement
                    ? "#f59e0b"
                    : selectedPart === "cooling_fan"
                    ? "#38bdf8"
                    : "#000000"
                }
                emissiveIntensity={hasFanReplacement ? 0.6 : 0.2}
              />
            </mesh>
            {/* Fan Blades */}
            <mesh rotation={[0, 0, fi * 0.8]}>
              <circleGeometry args={[0.52, 9]} />
              <meshStandardMaterial
                color={hasFanReplacement ? "#b45309" : "#0f172a"}
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 5. Outer Armor Shroud (Moves forward: Z: +2.8m) ── */}
      <group
        position={[0, 0, 2.8 * explodeFactor]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("shroud");
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.4, 2.1, 0.2]} />
          <meshStandardMaterial
            color={selectedPart === "shroud" ? "#38bdf8" : "#0f172a"}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Geometric Accent Cuts */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[3.8, 1.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function GPUInspectorModal() {
  const { activeModal, setActiveModal, activeUnit, units } = useHardwareStore();
  const { purchaseHardware, userWallet, hardwarePrices } = useBlockchainEngine();

  const [explodeFactor, setExplodeFactor] = useState(0.45);
  const [selectedPart, setSelectedPart] = useState<string | null>("cooling_fan");
  const [activeTab, setActiveTab] = useState<"inspector" | "provenance" | "ipfs">("inspector");
  const [isBuying, setIsBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const isOpen = activeModal === "gpu_inspector";
  const unit: HardwareUnit =
    activeUnit && activeUnit.category === "GPU"
      ? activeUnit
      : units.find((u) => u.category === "GPU") || units[0];

  if (!isOpen) return null;

  const priceETH = hardwarePrices[unit.serialNumber] || 0.45;
  const isOwnedByUser = userWallet.ownedTokens.includes(unit.tokenId);

  const hasFanReplacement = unit.repairHistory.some(
    (r) => r.componentName === "cooling_fan" && r.isReplaced
  );

  const handleBuy = () => {
    setIsBuying(true);
    setTimeout(() => {
      purchaseHardware(unit.tokenId, unit.serialNumber, unit.modelName, priceETH);
      setIsBuying(false);
      setBuySuccess(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-6xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          background: THEME.colors.glass.bgElevated,
          borderColor: THEME.colors.glass.border,
          boxShadow: THEME.colors.glass.shadow,
        }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{unit.modelName}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>ERC-721 Token #{unit.tokenId}</span>
                </span>
                {isOwnedByUser && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                    OWNED BY YOU
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Serial: <span className="text-amber-300 font-bold">{unit.serialNumber}</span> •{" "}
                {unit.manufacturer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Navigation */}
            <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "inspector"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3D Exploded Twin
              </button>
              <button
                onClick={() => setActiveTab("provenance")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "provenance"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                On-Chain Timeline ({unit.repairHistory.length})
              </button>
              <button
                onClick={() => setActiveTab("ipfs")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ipfs"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                IPFS Attestation
              </button>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Modal Main Body ── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left / Center: Interactive 3D Canvas */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-950/60 to-black/80 flex flex-col">
            <Canvas
              shadows
              camera={{ position: [0, 2.5, 6.5], fov: 45 }}
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
              <directionalLight position={[-10, -5, -10]} intensity={0.5} color="#38bdf8" />
              <pointLight position={[0, 0, 3]} intensity={1.2} color="#ffffff" />

              <Suspense fallback={null}>
                <ExplodedGPUModel
                  explodeFactor={explodeFactor}
                  selectedPart={selectedPart}
                  onSelectPart={setSelectedPart}
                  hasFanReplacement={hasFanReplacement}
                />
              </Suspense>

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                minDistance={3.5}
                maxDistance={14}
                autoRotate={false}
              />
            </Canvas>

            {/* Exploded Slider Bar Overlay */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl">
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">Exploded Assembly View</span>
              </div>

              <div className="flex-1 max-w-xs mx-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodeFactor}
                  onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/20"
                />
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>
          </div>

          {/* Right Sidebar: Sub-Component Provenance & Purchase Action */}
          <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-950/70 backdrop-blur-xl p-5 flex flex-col overflow-y-auto space-y-4">
            {/* Autonomous Purchase Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                    Autonomous On-Chain Price
                  </span>
                  <p className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{priceETH} ETH</span>
                    <span className="text-xs font-normal text-slate-400">($1,450 USD)</span>
                  </p>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  Instant Mint & Transfer
                </span>
              </div>

              {buySuccess || isOwnedByUser ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>You Own This Physical Hardware NFT!</span>
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isBuying ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      <span>Mining Purchase Block...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Purchase & Claim NFT ({priceETH} ETH)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Quick Component Selection Pills */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Interactive Sub-Components
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cooling_fan", label: "Cooling Fans", alert: hasFanReplacement },
                  { id: "silicon_die", label: "GA102 Die", alert: false },
                  { id: "vram", label: "24GB VRAM", alert: false },
                  { id: "vrm", label: "18-Phase VRM", alert: false },
                  { id: "heatsink", label: "Heatsink", alert: false },
                  { id: "backplate", label: "Backplate", alert: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPart(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border cursor-pointer ${
                      selectedPart === item.id
                        ? "bg-emerald-500/20 border-emerald-400 text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.alert ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Component On-Chain Verification Card */}
            <div className="p-4 rounded-2xl border bg-black/40 border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Part Provenance
                </span>
                {selectedPart === "cooling_fan" && hasFanReplacement ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={11} /> REPLACED PART
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={11} /> FACTORY ORIGINAL
                  </span>
                )}
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                {selectedPart === "cooling_fan" && hasFanReplacement ? (
                  <div>
                    <p className="font-bold text-amber-300">Center Axial Cooling Fan Assembly</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Serviced 45 days ago at CyberService Hub #04. Replaced with OEM dual-ball
                      bearing unit. Verified on Sovereign HardWAve Blockchain.
                    </p>
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-200">
                      IPFS CID: QmYwAPJzv5CZsn...
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-emerald-300">Factory Assembled Component</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Zero repair or aftermarket modification records found on-chain. Sealed with
                      factory cryptographic attestation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Contract Hash */}
            <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Contract</span>
                <span className="text-emerald-400 font-bold">0xHardWAve...Token</span>
              </div>
              <div className="flex justify-between">
                <span>Owner</span>
                <span className="text-slate-300 truncate max-w-[180px]">
                  {isOwnedByUser ? userWallet.address : unit.manufacturerAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
