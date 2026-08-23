"use client";

import React, { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  X,
  GalleryVerticalEnd,
  ShieldCheck,
  Calendar,
  Layers,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Info,
  Sparkles,
  ShoppingBag,
  Coins,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore, HardwareUnit } from "@/store/hardwareStore";
import { useBlockchainEngine } from "@/store/blockchainEngine";

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
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material) {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.side = THREE.DoubleSide;
        }
      }
    });

    return { centeredClonedScene: cloned, autoScale: targetScale };
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={meshRef} scale={[autoScale, autoScale, autoScale]}>
      <primitive object={centeredClonedScene} />
    </group>
  );
}

export default function HardwareGalleryModal() {
  const { activeModal, setActiveModal, units, activeUnit, setActiveUnit } = useHardwareStore();
  const { purchaseHardware, userWallet, hardwarePrices } = useBlockchainEngine();

  const [selectedUnit, setSelectedUnit] = useState<HardwareUnit>(activeUnit || units[1] || units[0]);
  const [isBuying, setIsBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const isOpen = activeModal === "gallery";
  if (!isOpen) return null;

  const priceETH = hardwarePrices[selectedUnit.serialNumber] || 0.05;
  const isOwnedByUser = userWallet.ownedTokens.includes(selectedUnit.tokenId);

  const handleBuy = () => {
    setIsBuying(true);
    setTimeout(() => {
      purchaseHardware(selectedUnit.tokenId, selectedUnit.serialNumber, selectedUnit.modelName, priceETH);
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <GalleryVerticalEnd size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Hardware Marketplace & Showroom</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <Coins size={11} />
                  <span>Wallet: {userWallet.balanceETH} ETH</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Explore Multi-Component Hardware Provenance & Autonomous On-Chain Purchases
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Category Selector Strip */}
          <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
            {units.map((u) => {
              const p = hardwarePrices[u.serialNumber] || 0.05;
              const isOwned = userWallet.ownedTokens.includes(u.tokenId);

              return (
                <button
                  key={u.tokenId}
                  onClick={() => {
                    setSelectedUnit(u);
                    setActiveUnit(u);
                    setBuySuccess(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 shrink-0 md:shrink group ${
                    selectedUnit.tokenId === u.tokenId
                      ? "bg-emerald-500/20 border-emerald-400 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate max-w-[140px]">
                      {u.modelName}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {p} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-300">{u.serialNumber}</span>
                    {isOwned && <span className="text-purple-300 font-bold">OWNED</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center 3D Model Display */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-950/60 to-black/80 flex flex-col">
            <Canvas
              shadows
              camera={{ position: [0, 1.5, 4.5], fov: 45 }}
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} />
              <directionalLight position={[-10, -5, -10]} intensity={0.6} color="#38bdf8" />
              <pointLight position={[0, 0, 3]} intensity={1.0} color="#ffffff" />

              <Suspense fallback={null}>
                <DynamicGallery3DModel modelPath={selectedUnit.modelPath} />
              </Suspense>

              <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={10} />
            </Canvas>

            {/* Floating Model Badge & Buy Bar */}
            <div className="absolute bottom-4 left-6 right-6 p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{selectedUnit.modelName}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {selectedUnit.manufacturer} • Token #{selectedUnit.tokenId}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30">
                  {priceETH} ETH
                </span>

                {isOwnedByUser || buySuccess ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/25 border border-purple-400 text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>In Your Bag</span>
                  </span>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={isBuying}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag size={13} />
                    <span>{isBuying ? "Mining..." : "Buy NFT"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Specs & Provenance Matrix */}
          <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-950/70 p-5 flex flex-col overflow-y-auto space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Verified Technical Specs
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(selectedUnit.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 px-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-slate-400">{k}</span>
                    <span className="text-white font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Warranty Status
                </span>
                <span>Active</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Registered on-chain with Genesis smart contract. Full replacement coverage valid.
              </p>
            </div>

            {/* Repair Records */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Lifecycle Maintenance ({selectedUnit.repairHistory.length})
              </p>
              {selectedUnit.repairHistory.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
                  Pristine Factory Sealed Condition
                </div>
              ) : (
                selectedUnit.repairHistory.map((r) => (
                  <div
                    key={r.repairId}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1"
                  >
                    <p className="font-bold text-amber-300">{r.componentLabel}</p>
                    <p className="text-[11px] text-slate-300">{r.actionDescription}</p>
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
