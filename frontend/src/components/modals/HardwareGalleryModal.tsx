"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  X,
  GalleryVerticalEnd,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  Coins,
  Package,
  Store,
  BadgeCheck,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore, HardwareUnit } from "@/store/hardwareStore";
import { useBlockchainEngine, priceOf } from "@/store/blockchainEngine";

function DynamicGallery3DModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef<THREE.Group>(null);

  const { centeredClonedScene, autoScale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    cloned.position.set(-center.x, -center.y, -center.z);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 2.8 / maxDim : 1.0;

    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (mat) mat.side = THREE.DoubleSide;
    });

    return { centeredClonedScene: cloned, autoScale: targetScale };
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={meshRef} scale={autoScale}>
      <primitive object={centeredClonedScene} />
    </group>
  );
}

/** Warranty coverage derived from the mint date, not hard-coded to "Active". */
function warrantyStatus(unit: HardwareUnit) {
  const expiresAt = unit.manufactureDate + unit.warrantyMonths * 30 * 86400000;
  const monthsLeft = Math.max(0, Math.round((expiresAt - Date.now()) / (30 * 86400000)));
  return { active: expiresAt > Date.now(), expiresAt, monthsLeft };
}

export default function HardwareGalleryModal() {
  const activeModal = useHardwareStore((s) => s.activeModal);
  const setActiveModal = useHardwareStore((s) => s.setActiveModal);
  const units = useHardwareStore((s) => s.units);
  const activeUnit = useHardwareStore((s) => s.activeUnit);
  const setActiveUnit = useHardwareStore((s) => s.setActiveUnit);

  const purchaseHardware = useBlockchainEngine((s) => s.purchaseHardware);
  const userWallet = useBlockchainEngine((s) => s.userWallet);
  const hardwarePrices = useBlockchainEngine((s) => s.hardwarePrices);

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [view, setView] = useState<"market" | "inventory">("market");
  const [isBuying, setIsBuying] = useState(false);

  const isOpen = activeModal === "gallery";

  // Track by id rather than by object so a purchase (which rewrites the unit)
  // keeps the same card selected.
  const selectedUnit =
    units.find((u) => u.tokenId === selectedTokenId) ??
    (activeUnit && units.some((u) => u.tokenId === activeUnit.tokenId) ? activeUnit : units[0]);

  const ownedUnits = useMemo(
    () => units.filter((u) => userWallet.ownedTokens.includes(u.tokenId)),
    [units, userWallet.ownedTokens]
  );

  if (!isOpen || !selectedUnit) return null;

  const priceETH = priceOf(hardwarePrices, selectedUnit.serialNumber, selectedUnit.category);
  const isOwnedByUser = userWallet.ownedTokens.includes(selectedUnit.tokenId);
  const canAfford = userWallet.balanceETH >= priceETH;
  const warranty = warrantyStatus(selectedUnit);

  const listedUnits = view === "inventory" ? ownedUnits : units;

  const handleBuy = () => {
    setIsBuying(true);
    window.setTimeout(() => {
      purchaseHardware(
        selectedUnit.tokenId,
        selectedUnit.serialNumber,
        selectedUnit.modelName,
        priceETH
      );
      setIsBuying(false);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl hw-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Hardware marketplace and showroom"
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
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <GalleryVerticalEnd size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white">Hardware Showroom &amp; Marketplace</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <Coins size={11} />
                  <span>
                    {userWallet.balanceETH.toFixed(3)} ETH • {userWallet.balanceHWAVE.toFixed(0)}{" "}
                    HWAVE
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                Multi-component provenance gallery &amp; autonomous on-chain purchases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setView("market")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  view === "market"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Store size={13} /> Marketplace
              </button>
              <button
                onClick={() => setView("inventory")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  view === "inventory"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Package size={13} /> My Hardware ({ownedUnits.length})
              </button>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close showroom"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Catalogue strip */}
          <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto hw-scroll">
            {listedUnits.length === 0 ? (
              <div className="w-full p-6 text-center space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs text-slate-400 font-bold">Your inventory is empty</p>
                <button
                  onClick={() => setView("market")}
                  className="text-[11px] text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Browse the marketplace →
                </button>
              </div>
            ) : (
              listedUnits.map((u) => {
                const p = priceOf(hardwarePrices, u.serialNumber, u.category);
                const isOwned = userWallet.ownedTokens.includes(u.tokenId);

                return (
                  <button
                    key={u.tokenId}
                    onClick={() => {
                      setSelectedTokenId(u.tokenId);
                      setActiveUnit(u);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 shrink-0 md:shrink group ${
                      selectedUnit.tokenId === u.tokenId
                        ? "bg-emerald-500/20 border-emerald-400 shadow-lg"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate max-w-[140px]">
                        {u.modelName}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                        {p} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-amber-300 truncate">{u.serialNumber}</span>
                      {isOwned && <span className="text-purple-300 font-bold shrink-0">OWNED</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* 3D model viewport */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-950/60 to-black/80 flex flex-col min-h-[260px]">
            <Canvas
              shadows="percentage"
              camera={{ position: [0, 1.5, 4.5], fov: 45 }}
              dpr={[1, 1.75]}
              style={{ width: "100%", height: "100%" }}
            >
              <color attach="background" args={["#0b1220"]} />
              {/* Studio rig: most hardware is matte black, so it needs a bright
                  key plus coloured rim lights to read against the dark stage. */}
              <ambientLight intensity={1.4} />
              <directionalLight position={[8, 12, 9]} intensity={2.4} />
              <directionalLight position={[-9, 3, -7]} intensity={1.5} color="#38bdf8" />
              <directionalLight position={[6, -5, -8]} intensity={1.1} color="#fbbf24" />
              <pointLight position={[0, 1, 4]} intensity={22} distance={20} color="#ffffff" />
              <hemisphereLight args={["#cbd5e1", "#0f172a", 0.9]} />

              <Suspense fallback={null}>
                <DynamicGallery3DModel modelPath={selectedUnit.modelPath} />
              </Suspense>

              <OrbitControls enablePan enableZoom minDistance={2} maxDistance={10} />
            </Canvas>

            {/* Floating purchase bar */}
            <div className="absolute bottom-4 left-6 right-6 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{selectedUnit.modelName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {selectedUnit.manufacturer} • Token #{selectedUnit.tokenId}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30">
                  {priceETH} ETH
                </span>

                {isOwnedByUser ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/25 border border-purple-400 text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>In Your Bag</span>
                  </span>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={isBuying || !canAfford}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag size={13} />
                    <span>{isBuying ? "Mining…" : canAfford ? "Buy NFT" : "Low Balance"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Specs, warranty certificate & lifecycle */}
          <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-950/70 p-5 flex flex-col overflow-y-auto hw-scroll space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Verified Technical Specs
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(selectedUnit.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-2 py-1.5 px-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-slate-400 shrink-0">{k}</span>
                    <span className="text-white font-bold text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty certificate */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                warranty.active
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div
                className={`flex items-center justify-between text-xs font-bold ${
                  warranty.active ? "text-emerald-300" : "text-red-300"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Warranty Certificate
                </span>
                <span>{warranty.active ? `${warranty.monthsLeft} mo left` : "Expired"}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {selectedUnit.warrantyMonths}-month coverage registered on the Genesis contract,
                valid through {new Date(warranty.expiresAt).toLocaleDateString()}.
              </p>
              {isOwnedByUser && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 pt-1 border-t border-white/10">
                  <BadgeCheck size={12} />
                  <span>Certified owner: {userWallet.address.slice(0, 10)}…</span>
                </div>
              )}
            </div>

            {/* Lifecycle records */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lifecycle Maintenance ({selectedUnit.repairHistory.length})
              </p>
              {selectedUnit.repairHistory.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Pristine factory-sealed condition
                </div>
              ) : (
                selectedUnit.repairHistory.map((r) => (
                  <div
                    key={r.repairId}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-amber-300 truncate">{r.componentLabel}</p>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                        {r.isReplaced ? "REPLACED" : "SERVICED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {r.actionDescription}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
