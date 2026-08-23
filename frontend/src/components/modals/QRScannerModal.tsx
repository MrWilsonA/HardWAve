"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  Camera,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore } from "@/store/hardwareStore";

export default function QRScannerModal() {
  const { activeModal, setActiveModal, units, setActiveUnit, getUnitBySerial } =
    useHardwareStore();

  const [inputSerial, setInputSerial] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOpen = activeModal === "qr_scanner";
  if (!isOpen) return null;

  const handleResolve = (serialToResolve: string) => {
    setErrorMessage(null);
    const unit = getUnitBySerial(serialToResolve);

    if (unit) {
      setScanResult(unit.serialNumber);
      setActiveUnit(unit);
    } else {
      setErrorMessage(`No on-chain token found for Serial "${serialToResolve.toUpperCase()}".`);
      setScanResult(null);
    }
  };

  const handleInspectNow = () => {
    if (!scanResult) return;
    const unit = getUnitBySerial(scanResult);
    if (unit) {
      setActiveUnit(unit);
      setActiveModal(unit.category === "GPU" ? "gpu_inspector" : "gallery");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-4xl h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          background: THEME.colors.glass.bgElevated,
          borderColor: THEME.colors.glass.border,
          boxShadow: THEME.colors.glass.shadow,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Hardware Barcode & QR Scanner Gate</h2>
              <p className="text-xs text-slate-400 font-mono">
                Verify Physical Chassis Serial Against Immutable Smart Contract Records
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
          {/* Left: Camera Reticle Scanner */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center border-r border-white/10 bg-slate-950/60 relative overflow-hidden">
            {/* Viewfinder Frame */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-dashed border-cyan-400/60 relative flex items-center justify-center bg-black/50 overflow-hidden shadow-2xl">
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-bounce" />

              {/* Reticle Corner Brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Mock QR Placeholder */}
              <div className="text-center space-y-2 opacity-60">
                <Camera size={36} className="mx-auto text-cyan-400 animate-pulse" />
                <p className="text-[11px] font-mono text-cyan-300">Point Camera at Barcode / QR</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Optical barcode recognition automatically active. Hold device steady.
            </p>
          </div>

          {/* Right: Manual Serial Input & Quick Chips */}
          <div className="w-full md:w-[380px] p-6 bg-black/40 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Manual Serial Resolver
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter serial string from device sticker or choose a sample below.
                </p>
              </div>

              {/* Input Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. HW-RTX3090-88421"
                  value={inputSerial}
                  onChange={(e) => setInputSerial(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResolve(inputSerial)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleResolve(inputSerial)}
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Search size={15} />
                </button>
              </div>

              {/* Quick Sample Serial Chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sample Registered Hardware
                </p>
                <div className="space-y-2">
                  {units.map((u) => (
                    <button
                      key={u.serialNumber}
                      onClick={() => {
                        setInputSerial(u.serialNumber);
                        handleResolve(u.serialNumber);
                      }}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="truncate">
                        <p className="font-bold text-white group-hover:text-cyan-300 truncate">
                          {u.modelName}
                        </p>
                        <p className="text-[10px] font-mono text-amber-300">{u.serialNumber}</p>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                        {u.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolution Card or Error */}
            <div>
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {scanResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <ShieldCheck size={16} />
                    <span>Verified On-Chain Hardware Token</span>
                  </div>
                  <p className="text-xs text-white font-bold">{scanResult}</p>
                  <button
                    onClick={handleInspectNow}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Launch 3D Digital Twin</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
