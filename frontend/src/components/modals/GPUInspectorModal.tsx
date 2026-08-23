"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  X,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Coins,
  Sparkles,
  ShoppingBag,
  FileCheck,
  Wrench,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore, HardwareUnit, RepairRecord } from "@/store/hardwareStore";
import { useBlockchainEngine, priceOf } from "@/store/blockchainEngine";

/** Indicative fiat rate used purely for the showroom price hint. */
const USD_PER_ETH = 3200;

/* ───────────────────────────────────────────
   Interactive 3D exploded RTX 3090 assembly
   ─────────────────────────────────────────── */

interface PartDef {
  id: string;
  label: string;
  /** Where the layer travels to at 100% explosion, along the Z axis. */
  explodeZ: number;
  description: string;
}

const GPU_PARTS: PartDef[] = [
  {
    id: "shroud",
    label: "Armor Shroud",
    explodeZ: 2.8,
    description: "Die-cast aluminium outer shroud with factory tamper-evident seals.",
  },
  {
    id: "cooling_fan",
    label: "Cooling Fans",
    explodeZ: 2.0,
    description: "Triple 90mm axial fans on dual-ball bearings, PWM controlled.",
  },
  {
    id: "heatsink",
    label: "Heatsink & Heatpipes",
    explodeZ: 1.0,
    description: "Aluminium fin stack with four sintered copper heatpipes.",
  },
  {
    id: "vrm",
    label: "18-Phase VRM",
    explodeZ: 0,
    description: "18-phase DrMOS power delivery feeding the GA102 core rail.",
  },
  {
    id: "vram",
    label: "24GB GDDR6X",
    explodeZ: 0,
    description: "Twelve 2GB Micron GDDR6X modules on a 384-bit bus.",
  },
  {
    id: "silicon_die",
    label: "GA102 Silicon Die",
    explodeZ: 0,
    description: "Samsung 8N GA102 die, 10,496 CUDA cores, laser-etched batch code.",
  },
  {
    id: "pcb",
    label: "PCB Substrate",
    explodeZ: 0,
    description: "12-layer PCB carrying the factory-fused hardware identity chip.",
  },
  {
    id: "backplate",
    label: "Aluminium Backplate",
    explodeZ: -1.2,
    description: "Structural backplate with the serial-number laser engraving.",
  },
];

const SELECTED_COLOR = "#38bdf8";
const ALERT_COLOR = "#f59e0b";

function ExplodedGPUModel({
  explodeFactor,
  selectedPart,
  onSelectPart,
  replacedParts,
}: {
  explodeFactor: number;
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
  replacedParts: Set<string>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Keep a slow drift even with a part selected: a dead-on view hides the
    // whole point of the exploded layers.
    group.rotation.y += delta * (selectedPart ? 0.09 : 0.2);

    // Replaced parts breathe an amber warning glow, per the alert-shader spec.
    const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3.2) * 0.45;
    group.traverse((child) => {
      if (!child.userData.hwAlert) return;
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (material?.emissiveIntensity !== undefined) material.emissiveIntensity = pulse;
    });
  });

  /** Resolves a submesh's colour from selection state and on-chain repair records. */
  const partColor = (partId: string, base: string) => {
    if (selectedPart === partId) return SELECTED_COLOR;
    if (replacedParts.has(partId)) return ALERT_COLOR;
    return base;
  };

  const partEmissive = (partId: string) => {
    if (replacedParts.has(partId)) return ALERT_COLOR;
    if (selectedPart === partId) return SELECTED_COLOR;
    return "#000000";
  };

  const select = (partId: string) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelectPart(partId);
  };

  /** Tags a mesh so the frame loop can drive its warning pulse. */
  const alertTag = (partId: string) => ({ hwAlert: replacedParts.has(partId) });

  // Sealed at 0%, fully glass by ~35% — the point where the layers separate.
  const shroudOpacity = Math.max(0.16, 1 - explodeFactor * 2.4);

  return (
    <group ref={groupRef}>
      {/* ── 1. Aluminium backplate ── */}
      <group position={[0, 0, -1.2 * explodeFactor]} onClick={select("backplate")}>
        <mesh castShadow receiveShadow userData={alertTag("backplate")}>
          <boxGeometry args={[4.2, 2.0, 0.1]} />
          <meshStandardMaterial
            color={partColor("backplate", "#334155")}
            emissive={partEmissive("backplate")}
            emissiveIntensity={replacedParts.has("backplate") ? 0.6 : 0.15}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[1.2, 0, -0.06]}>
          <planeGeometry args={[1.2, 0.4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={selectedPart === "backplate" ? 1.5 : 0.4}
          />
        </mesh>
      </group>

      {/* ── 2. Core PCB (centre anchor) ── */}
      <group onClick={select("pcb")}>
        <mesh castShadow receiveShadow userData={alertTag("pcb")}>
          <boxGeometry args={[4.0, 1.85, 0.08]} />
          <meshStandardMaterial
            color={partColor("pcb", "#065f46")}
            emissive={partEmissive("pcb")}
            emissiveIntensity={replacedParts.has("pcb") ? 0.5 : 0}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* GA102 silicon die */}
        <mesh
          position={[0.2, 0, 0.06]}
          onClick={select("silicon_die")}
          userData={alertTag("silicon_die")}
        >
          <boxGeometry args={[1.1, 1.1, 0.06]} />
          <meshStandardMaterial
            color={partColor("silicon_die", "#1e293b")}
            emissive={partEmissive("silicon_die")}
            emissiveIntensity={replacedParts.has("silicon_die") ? 0.6 : 0.1}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* 24GB GDDR6X VRAM modules */}
        {[-0.8, 1.2].map((vx, i) => (
          <group key={`vram-${i}`} onClick={select("vram")}>
            {[0.5, -0.5].map((vy) => (
              <mesh key={vy} position={[vx, vy, 0.05]} castShadow userData={alertTag("vram")}>
                <boxGeometry args={[0.55, 0.4, 0.04]} />
                <meshStandardMaterial
                  color={partColor("vram", "#4338ca")}
                  emissive={partEmissive("vram")}
                  emissiveIntensity={0.5}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* 18-phase VRM power stages */}
        <group position={[-1.4, 0, 0.05]} onClick={select("vrm")}>
          {[-0.6, -0.3, 0, 0.3, 0.6].map((vy) => (
            <mesh key={vy} position={[0, vy, 0]} castShadow userData={alertTag("vrm")}>
              <boxGeometry args={[0.3, 0.2, 0.08]} />
              <meshStandardMaterial
                color={partColor("vrm", "#64748b")}
                emissive={partEmissive("vrm")}
                emissiveIntensity={replacedParts.has("vrm") ? 0.6 : 0}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── 3. Fin stack & copper heatpipes ── */}
      <group position={[0, 0, 1.0 * explodeFactor]} onClick={select("heatsink")}>
        <mesh castShadow receiveShadow userData={alertTag("heatsink")}>
          <boxGeometry args={[4.1, 1.9, 0.6]} />
          <meshStandardMaterial
            color={partColor("heatsink", "#94a3b8")}
            emissive={partEmissive("heatsink")}
            emissiveIntensity={replacedParts.has("heatsink") ? 0.5 : 0}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        {[-0.6, -0.2, 0.2, 0.6].map((py) => (
          <mesh key={py} position={[0, py, 0.32]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 4.2, 8]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ── 4. Triple cooling fans ── */}
      <group position={[0, 0, 2.0 * explodeFactor]}>
        {[-1.3, 0, 1.3].map((fx, fi) => (
          <group key={fx} position={[fx, 0, 0]} onClick={select("cooling_fan")}>
            {/* Housing ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={alertTag("cooling_fan")}>
              <torusGeometry args={[0.55, 0.07, 10, 28]} />
              <meshStandardMaterial
                color={partColor("cooling_fan", "#475569")}
                emissive={partEmissive("cooling_fan")}
                emissiveIntensity={replacedParts.has("cooling_fan") ? 0.75 : 0.2}
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>

            {/* Angled blades */}
            <group rotation={[0, 0, fi * 0.8]}>
              {[0, 1, 2, 3, 4, 5, 6].map((b) => (
                <mesh
                  key={b}
                  rotation={[0.36, 0, (b / 7) * Math.PI * 2]}
                  position={[0, 0, 0.02]}
                  userData={alertTag("cooling_fan")}
                >
                  <boxGeometry args={[0.44, 0.15, 0.02]} />
                  <meshStandardMaterial
                    color={
                      selectedPart === "cooling_fan"
                        ? SELECTED_COLOR
                        : replacedParts.has("cooling_fan")
                        ? "#d97706"
                        : "#cbd5e1"
                    }
                    emissive={partEmissive("cooling_fan")}
                    emissiveIntensity={replacedParts.has("cooling_fan") ? 0.6 : 0}
                    roughness={0.45}
                    metalness={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              ))}
            </group>

            {/* Hub cap */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.06, 14]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 5. Outer armor shroud ──
          It sits closest to the camera and would otherwise mask every internal
          layer, so it dissolves to glass as the assembly opens. */}
      <group position={[0, 0, 2.8 * explodeFactor]} onClick={select("shroud")}>
        <mesh castShadow receiveShadow userData={alertTag("shroud")}>
          <boxGeometry args={[4.4, 2.1, 0.2]} />
          <meshStandardMaterial
            color={partColor("shroud", "#334155")}
            emissive={partEmissive("shroud")}
            emissiveIntensity={replacedParts.has("shroud") ? 0.5 : 0}
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={shroudOpacity}
            depthWrite={shroudOpacity > 0.95}
          />
        </mesh>
        {/* Teal accent inlay along the shroud face */}
        <mesh position={[0, 0.55, 0.11]}>
          <planeGeometry args={[3.6, 0.14]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.4}
            transparent
            opacity={shroudOpacity}
          />
        </mesh>
        <mesh position={[0, -0.55, 0.11]}>
          <planeGeometry args={[3.6, 0.14]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.4}
            transparent
            opacity={shroudOpacity}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────────────────────────
   Sidebar & tab panels
   ─────────────────────────────────────────── */

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysAgo(ts: number) {
  return Math.max(0, Math.round((Date.now() - ts) / 86400000));
}

function ProvenanceTimeline({ unit }: { unit: HardwareUnit }) {
  const events = useMemo(() => {
    const mint = {
      key: "mint",
      title: "Factory Genesis Mint",
      body: `${unit.modelName} sealed on-chain by ${unit.manufacturer} with a ${unit.warrantyMonths}-month warranty.`,
      timestamp: unit.manufactureDate,
      tone: "emerald" as const,
      hash: unit.txHash,
    };

    const repairs = unit.repairHistory.map((r) => ({
      key: `repair-${r.repairId}`,
      title: `${r.isReplaced ? "Part Replaced" : "Part Serviced"} — ${r.componentLabel}`,
      body: `${r.actionDescription} Logged by ${r.serviceCenter}.`,
      timestamp: r.timestamp,
      tone: (r.isReplaced ? "amber" : "blue") as "amber" | "blue",
      hash: r.ipfsEvidenceHash,
    }));

    return [...repairs, mint].sort((a, b) => b.timestamp - a.timestamp);
  }, [unit]);

  const toneClasses = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  };

  return (
    <div className="h-full overflow-y-auto p-6 hw-scroll">
      <h3 className="text-sm font-black text-white mb-1">On-Chain Lifecycle Timeline</h3>
      <p className="text-xs text-slate-400 mb-5">
        Every mint, repair and ownership event ever written against Token #{unit.tokenId}.
      </p>

      <ol className="relative border-l border-white/10 ml-3 space-y-5">
        {events.map((event) => (
          <li key={event.key} className="ml-5">
            <span
              className={`absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 ${
                toneClasses[event.tone]
              }`}
            />
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-xs font-bold text-white">{event.title}</p>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <CalendarClock size={11} />
                  {formatDate(event.timestamp)} • {daysAgo(event.timestamp)}d ago
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{event.body}</p>
              <p className="text-[9px] font-mono text-slate-500 break-all">{event.hash}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function IpfsAttestations({ unit }: { unit: HardwareUnit }) {
  const records: RepairRecord[] = unit.repairHistory;

  return (
    <div className="h-full overflow-y-auto p-6 hw-scroll space-y-4">
      <div>
        <h3 className="text-sm font-black text-white mb-1">IPFS Evidence Attestations</h3>
        <p className="text-xs text-slate-400">
          Diagnostic reports and invoices pinned off-chain; only their content hashes live on the
          ledger, so the evidence cannot be altered after the fact.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <FileCheck className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs text-slate-400 font-bold">No attestations pinned</p>
          <p className="text-[11px] text-slate-500">
            This unit is in pristine factory-sealed condition.
          </p>
        </div>
      ) : (
        records.map((r) => (
          <div
            key={r.repairId}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <FileCheck size={14} className="text-amber-400" />
                {r.ipfsFileName ?? "attestation.pdf"}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  r.isReplaced
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {r.isReplaced ? "REPLACED" : "SERVICED"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 font-bold block">Content ID (CIDv0)</span>
              <p className="text-[11px] font-mono text-amber-200 break-all">{r.ipfsEvidenceHash}</p>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-white/5">
                <dt className="text-slate-400">Component</dt>
                <dd className="text-white font-bold">{r.componentLabel}</dd>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <dt className="text-slate-400">Service Cost</dt>
                <dd className="text-white font-bold">${r.costUSD?.toFixed(2) ?? "—"}</dd>
              </div>
              <div className="p-2 rounded-lg bg-white/5 col-span-2">
                <dt className="text-slate-400">Signing Technician</dt>
                <dd className="text-emerald-300 break-all">{r.technician}</dd>
              </div>
            </dl>
          </div>
        ))
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   Modal
   ─────────────────────────────────────────── */

export default function GPUInspectorModal() {
  const activeModal = useHardwareStore((s) => s.activeModal);
  const setActiveModal = useHardwareStore((s) => s.setActiveModal);
  const activeUnit = useHardwareStore((s) => s.activeUnit);
  const units = useHardwareStore((s) => s.units);

  const purchaseHardware = useBlockchainEngine((s) => s.purchaseHardware);
  const userWallet = useBlockchainEngine((s) => s.userWallet);
  const hardwarePrices = useBlockchainEngine((s) => s.hardwarePrices);

  const [explodeFactor, setExplodeFactor] = useState(0.45);
  const [selectedPart, setSelectedPart] = useState<string | null>("cooling_fan");
  const [activeTab, setActiveTab] = useState<"inspector" | "provenance" | "ipfs">("inspector");
  const [isBuying, setIsBuying] = useState(false);

  const isOpen = activeModal === "gpu_inspector";

  const unit: HardwareUnit | undefined =
    activeUnit && activeUnit.category === "GPU"
      ? activeUnit
      : units.find((u) => u.category === "GPU") ?? units[0];

  // Any sub-component with a "replaced" record renders in the amber alert state.
  const replacedParts = useMemo(
    () =>
      new Set(
        (unit?.repairHistory ?? []).filter((r) => r.isReplaced).map((r) => r.componentName)
      ),
    [unit]
  );

  const selectedPartDef = GPU_PARTS.find((p) => p.id === selectedPart);
  const selectedRepair = unit?.repairHistory.find((r) => r.componentName === selectedPart);

  if (!isOpen || !unit) return null;

  const priceETH = priceOf(hardwarePrices, unit.serialNumber, unit.category);
  const isOwnedByUser = userWallet.ownedTokens.includes(unit.tokenId);
  const canAfford = userWallet.balanceETH >= priceETH;

  const handleBuy = () => {
    setIsBuying(true);
    window.setTimeout(() => {
      purchaseHardware(unit.tokenId, unit.serialNumber, unit.modelName, priceETH);
      setIsBuying(false);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl hw-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`3D inspector for ${unit.modelName}`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setActiveModal(null);
      }}
    >
      <div
        className="w-full max-w-6xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          background: THEME.colors.glass.bgElevated,
          borderColor: THEME.colors.glass.border,
          boxShadow: THEME.colors.glass.shadow,
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Cpu size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white truncate">{unit.modelName}</h2>
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
              <p className="text-xs text-slate-400 font-mono truncate">
                Serial: <span className="text-amber-300 font-bold">{unit.serialNumber}</span> •{" "}
                {unit.manufacturer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              {(
                [
                  ["inspector", "3D Exploded Twin"],
                  ["provenance", `On-Chain Timeline (${unit.repairHistory.length})`],
                  ["ipfs", "IPFS Attestation"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close inspector"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <div className="flex-1 relative bg-gradient-to-b from-slate-950/60 to-black/80 flex flex-col min-h-[280px]">
            {activeTab === "inspector" && (
              <>
                <Canvas
                  shadows="percentage"
                  // Off-axis so the Z-axis explosion is visible on open.
                  camera={{ position: [5.2, 2.6, 7.4], fov: 45 }}
                  dpr={[1, 1.75]}
                  style={{ width: "100%", height: "100%" }}
                >
                  <ambientLight intensity={1.05} />
                  {/* Key */}
                  <directionalLight position={[8, 12, 9]} intensity={2.1} castShadow />
                  {/* Cool fill from below-left */}
                  <directionalLight position={[-9, -4, -6]} intensity={0.85} color="#38bdf8" />
                  {/* Warm rim separates the silhouette from the dark backdrop */}
                  <directionalLight position={[-6, 5, -9]} intensity={1.1} color="#fbbf24" />
                  <pointLight position={[0, 0, 4]} intensity={18} distance={22} color="#ffffff" />

                  <Suspense fallback={null}>
                    <ExplodedGPUModel
                      explodeFactor={explodeFactor}
                      selectedPart={selectedPart}
                      onSelectPart={setSelectedPart}
                      replacedParts={replacedParts}
                    />
                  </Suspense>

                  <OrbitControls enablePan enableZoom minDistance={3.5} maxDistance={14} />
                </Canvas>

                {/* Exploded assembly slider */}
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl">
                  <div className="flex items-center gap-3 shrink-0">
                    <Layers size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white hidden sm:inline">
                      Exploded Assembly View
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodeFactor}
                    aria-label="Exploded assembly factor"
                    onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                    className="hw-range flex-1 max-w-xs mx-2"
                  />

                  <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right shrink-0">
                    {Math.round(explodeFactor * 100)}%
                  </span>
                </div>
              </>
            )}

            {activeTab === "provenance" && <ProvenanceTimeline unit={unit} />}
            {activeTab === "ipfs" && <IpfsAttestations unit={unit} />}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-950/70 backdrop-blur-xl p-5 flex flex-col overflow-y-auto hw-scroll space-y-4">
            {/* Autonomous purchase */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/60 border border-purple-500/30 space-y-3 shadow-xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                    Autonomous On-Chain Price
                  </span>
                  <p className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{priceETH} ETH</span>
                    <span className="text-xs font-normal text-slate-400">
                      (≈ ${Math.round(priceETH * USD_PER_ETH).toLocaleString()})
                    </span>
                  </p>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 text-right">
                  Instant Mint &amp; Transfer
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Wallet size={11} /> Wallet
                </span>
                <span className={canAfford ? "text-emerald-300" : "text-red-300"}>
                  {userWallet.balanceETH.toFixed(3)} ETH • {userWallet.balanceHWAVE.toFixed(0)} HWAVE
                </span>
              </div>

              {isOwnedByUser ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>You own this hardware NFT</span>
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={isBuying || !canAfford}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isBuying ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      <span>Mining Purchase Block…</span>
                    </>
                  ) : canAfford ? (
                    <>
                      <ShoppingBag size={14} />
                      <span>Purchase &amp; Claim NFT ({priceETH} ETH)</span>
                    </>
                  ) : (
                    <span>Insufficient ETH Balance</span>
                  )}
                </button>
              )}
            </div>

            {/* Sub-component picker */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Interactive Sub-Components
              </p>
              <div className="grid grid-cols-2 gap-2">
                {GPU_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedPart(part.id);
                      setActiveTab("inspector");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between gap-1 border cursor-pointer ${
                      selectedPart === part.id
                        ? "bg-emerald-500/20 border-emerald-400 text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{part.label}</span>
                    {replacedParts.has(part.id) ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected part provenance */}
            <div className="p-4 rounded-2xl border bg-black/40 border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Part Provenance
                </span>
                {selectedRepair ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 shrink-0">
                    <AlertTriangle size={11} />
                    {selectedRepair.isReplaced ? "REPLACED PART" : "SERVICED PART"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <ShieldCheck size={11} /> FACTORY ORIGINAL
                  </span>
                )}
              </div>

              <p className="font-bold text-xs text-white">
                {selectedPartDef?.label ?? "Select a component"}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedPartDef?.description}
              </p>

              {selectedRepair ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-amber-200 leading-relaxed">
                    {selectedRepair.actionDescription}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Wrench size={11} /> {selectedRepair.serviceCenter}
                    </span>
                    <span>{daysAgo(selectedRepair.timestamp)}d ago</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("ipfs")}
                    className="w-full p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-200 hover:bg-amber-500/20 transition-colors cursor-pointer text-left truncate"
                  >
                    IPFS CID: {selectedRepair.ipfsEvidenceHash.slice(0, 22)}…
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-300/80 leading-relaxed pt-1">
                  Zero repair or aftermarket modification records found on-chain. Sealed with
                  factory cryptographic attestation.
                </p>
              )}
            </div>

            {/* Contract footer */}
            <div className="pt-2 mt-auto border-t border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between gap-2">
                <span>Contract</span>
                <span className="text-emerald-400 font-bold">HardWAveHardwareToken</span>
              </div>
              <div className="flex justify-between gap-2">
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
