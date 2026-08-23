"use client";

import React, { useState } from "react";
import {
  X,
  Boxes,
  ShieldCheck,
  Sparkles,
  Plus,
  CheckCircle2,
  Cpu,
  Layers,
  FileCheck,
  ExternalLink,
  QrCode,
  Lock,
  GitBranch,
  Coins,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore } from "@/store/hardwareStore";
import { useBlockchainEngine } from "@/store/blockchainEngine";
import BlockchainGraphExplorer from "@/components/blockchain/BlockchainGraphExplorer";

export default function BlockchainVaultModal() {
  const { activeModal, setActiveModal, registerHardware, units, setActiveUnit } =
    useHardwareStore();
  const { addTransactionAndMine, userWallet } = useBlockchainEngine();

  const [activeTab, setActiveTab] = useState<"graph" | "mint">("graph");
  const [serial, setSerial] = useState("");
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState<"GPU" | "Motherboard" | "SSD" | "RAM" | "Cooling">(
    "GPU"
  );
  const [warrantyMonths, setWarrantyMonths] = useState(36);
  const [vramSpec, setVramSpec] = useState("24 GB GDDR6X");
  const [clockSpec, setClockSpec] = useState("1.70 GHz Boost");
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);

  const isOpen = activeModal === "vault_mint";
  if (!isOpen) return null;

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial || !modelName) return;

    setIsMinting(true);

    setTimeout(() => {
      const specs: Record<string, string> = {
        Category: category,
        "Primary Spec": vramSpec,
        "Clock Speed": clockSpec,
        Standard: "ERC-721 On-Chain Hardware Token",
      };

      const newUnit = registerHardware(
        serial,
        modelName,
        category,
        specs,
        warrantyMonths
      );

      // Mine a new block on the sovereign blockchain graph!
      addTransactionAndMine({
        type: "MINT",
        from: userWallet.address,
        to: userWallet.address,
        tokenId: newUnit.tokenId,
        serialNumber: newUnit.serialNumber,
        hardwareName: newUnit.modelName,
        amountETH: 0,
        details: `Factory Genesis Token Minted (${category}) • Serial: ${newUnit.serialNumber} • ${warrantyMonths}m Warranty`,
      });

      setIsMinting(false);
      setMintSuccess(newUnit.serialNumber);
      setSerial("");
      setModelName("");
    }, 1200);
  };

  const generateRandomSerial = () => {
    const prefix = category === "GPU" ? "HW-RTX4090" : category === "SSD" ? "HW-990PRO" : "HW-GEN";
    const rand = Math.floor(10000 + Math.random() * 90000);
    setSerial(`${prefix}-${rand}`);
    if (category === "GPU") setModelName("NVIDIA GeForce RTX 4090 OC 24GB");
    if (category === "SSD") setModelName("Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2");
    if (category === "RAM") setModelName("G.Skill Trident Z5 RGB 64GB DDR5-6000");
    if (category === "Motherboard") setModelName("ASUS ROG Maximus Z790 Hero");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-5xl h-[88vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          background: THEME.colors.glass.bgElevated,
          borderColor: THEME.colors.glass.border,
          boxShadow: THEME.colors.glass.shadow,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Boxes size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Sovereign Blockchain Vault & Graph</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                  <Coins size={11} />
                  <span>Wallet: {userWallet.balanceETH} ETH</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Decentralized ERC-721 Hardware Identity, Autonomous Mining & DAG Graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Pills */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab("graph")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "graph"
                    ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GitBranch size={13} />
                <span>3D/2D Block Graph</span>
              </button>
              <button
                onClick={() => setActiveTab("mint")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "mint"
                    ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus size={13} />
                <span>Genesis Minting</span>
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

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {activeTab === "graph" ? (
            <BlockchainGraphExplorer />
          ) : (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden -m-6">
              {/* Left Form: Factory Minting */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Mint New Hardware Identity</h3>
                    <p className="text-xs text-slate-400">
                      Bind physical device serial numbers directly into immutable EVM tokens.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomSerial}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={13} />
                    <span>Auto-Fill Mock Spec</span>
                  </button>
                </div>

                {mintSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-emerald-300 text-xs animate-in zoom-in-95">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <div>
                        <p className="font-bold">Hardware Minted & Block Appended to Graph!</p>
                        <p className="text-[11px] font-mono text-emerald-400/80">
                          Token minted for Serial: {mintSuccess}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const u = units.find((x) => x.serialNumber === mintSuccess);
                        if (u) {
                          setActiveUnit(u);
                          setActiveModal("gpu_inspector");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Inspect 3D Twin
                    </button>
                  </div>
                )}

                <form onSubmit={handleMint} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Hardware Category
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(["GPU", "Motherboard", "SSD", "RAM", "Cooling"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            category === cat
                              ? "bg-purple-500/25 border-purple-400 text-white"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Serial & Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Physical Serial Number (Barcode)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HW-RTX3090-88421"
                        value={serial}
                        onChange={(e) => setSerial(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Hardware Model Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RTX 3090 Founders Edition"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Specs & Warranty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Primary Spec (Capacity / Phases)
                      </label>
                      <input
                        type="text"
                        value={vramSpec}
                        onChange={(e) => setVramSpec(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Warranty Duration (Months)
                      </label>
                      <input
                        type="number"
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(parseInt(e.target.value) || 36)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider uppercase transition-all shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isMinting ? (
                      <>
                        <Sparkles className="animate-spin" size={16} />
                        <span>Mining Block to Sovereign Chain...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Mint & Mine Block (Gasless)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right List: On-Chain Registry Feed */}
              <div className="w-full md:w-[360px] bg-black/40 p-6 flex flex-col overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Live On-Chain Registry
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">
                    {units.length} Tokens
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                  {units.map((u) => (
                    <div
                      key={u.tokenId}
                      onClick={() => {
                        setActiveUnit(u);
                        setActiveModal(u.category === "GPU" ? "gpu_inspector" : "gallery");
                      }}
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate max-w-[180px]">
                          {u.modelName}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          #{u.tokenId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="text-amber-300">{u.serialNumber}</span>
                        <span className="text-emerald-400">{u.warrantyMonths}m Warranty</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
