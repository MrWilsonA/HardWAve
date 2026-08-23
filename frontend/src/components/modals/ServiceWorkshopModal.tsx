"use client";

import React, { useState } from "react";
import {
  X,
  Wrench,
  ShieldAlert,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Cpu,
  UserCheck,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore } from "@/store/hardwareStore";

export default function ServiceWorkshopModal() {
  const { activeModal, setActiveModal, units, logRepair, setActiveUnit } = useHardwareStore();

  const [selectedSerial, setSelectedSerial] = useState(units[0]?.serialNumber || "");
  const [componentName, setComponentName] = useState("cooling_fan");
  const [componentLabel, setComponentLabel] = useState("Cooling Fan Assembly");
  const [actionDescription, setActionDescription] = useState(
    "Replaced noisy dual-bearing fan module with official OEM unit. Thermal paste reapplied with Arctic MX-6."
  );
  const [isReplaced, setIsReplaced] = useState(true);
  const [costUSD, setCostUSD] = useState(35.0);
  const [fileName, setFileName] = useState("service_invoice_diag_01.pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isOpen = activeModal === "service_workshop";
  if (!isOpen) return null;

  const targetUnit = units.find((u) => u.serialNumber === selectedSerial) || units[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial || !actionDescription) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const randomIpfsHash =
        "Qm" +
        Array.from({ length: 44 }, () =>
          "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".charAt(
            Math.floor(Math.random() * 58)
          )
        ).join("");

      logRepair(selectedSerial, {
        componentName,
        componentLabel,
        actionDescription,
        isReplaced,
        ipfsEvidenceHash: randomIpfsHash,
        ipfsFileName: fileName,
        technician: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Master Tech)",
        serviceCenter: "CyberService Authorized Hub #04",
        costUSD,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1200);
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wrench size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Authorized Service Center Hub</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                  <UserCheck size={11} />
                  <span>Technician Role Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Log Sub-Component Maintenance & Cryptographic IPFS Service Attestations
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
          {/* Left Form */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-white/10 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Log Hardware Maintenance Record</h3>
              <p className="text-xs text-slate-400">
                All submitted records are appended immutably to the device token on-chain.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-emerald-300 text-xs animate-in zoom-in-95">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <div>
                    <p className="font-bold">Maintenance Record Appended to Blockchain!</p>
                    <p className="text-[11px] font-mono text-emerald-400/80">
                      IPFS Evidence Hash & Technician Signature Attested
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveUnit(targetUnit);
                    setActiveModal(targetUnit.category === "GPU" ? "gpu_inspector" : "gallery");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Verify in 3D Inspector
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Hardware Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Target Hardware Unit
                </label>
                <select
                  value={selectedSerial}
                  onChange={(e) => setSelectedSerial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                >
                  {units.map((u) => (
                    <option key={u.serialNumber} value={u.serialNumber} className="bg-slate-900">
                      {u.serialNumber} — {u.modelName} (#{u.tokenId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Component Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Affected Sub-Component
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cooling_fan", label: "Cooling Fan" },
                    { id: "vrm", label: "VRM / Power Stages" },
                    { id: "vram", label: "VRAM Memory" },
                    { id: "thermal_paste", label: "Thermal Paste" },
                    { id: "heatsink", label: "Heatsink Assembly" },
                    { id: "pcb", label: "PCB Substrate" },
                  ].map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        setComponentName(comp.id);
                        setComponentLabel(comp.label);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        componentName === comp.id
                          ? "bg-amber-500/25 border-amber-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {comp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Type: Replaced vs Repaired */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsReplaced(true)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isReplaced
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span>Replaced (New Part)</span>
                  </div>
                  {isReplaced && <CheckCircle2 size={16} className="text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsReplaced(false)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    !isReplaced
                      ? "bg-blue-500/20 border-blue-400 text-blue-200"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-blue-400" />
                    <span>Repaired / Serviced</span>
                  </div>
                  {!isReplaced && <CheckCircle2 size={16} className="text-blue-400" />}
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Detailed Service Action Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. Replaced faulty bearing fan module with official OEM unit..."
                />
              </div>

              {/* IPFS File Upload Simulation */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UploadCloud size={15} className="text-amber-400" /> IPFS Diagnostic Attachment
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">PINATA GATEWAY READY</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">Auto-SHA256</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black tracking-wider uppercase transition-all shadow-xl active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="animate-spin" size={16} />
                    <span>Signing Transaction to Polygon Amoy...</span>
                  </>
                ) : (
                  <>
                    <Wrench size={16} />
                    <span>Log Service Record On-Chain</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Preview: Current Hardware Timeline */}
          <div className="w-full md:w-[360px] bg-black/40 p-6 flex flex-col overflow-y-auto space-y-4">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Selected Unit History
              </span>
              <p className="text-[11px] font-mono text-amber-300 font-bold mt-1">
                {targetUnit.serialNumber}
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {targetUnit.repairHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs space-y-1">
                  <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No prior repair history on-chain.</p>
                  <p className="text-[10px]">Pristine Factory Sealed Condition</p>
                </div>
              ) : (
                targetUnit.repairHistory.map((rep) => (
                  <div
                    key={rep.repairId}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{rep.componentLabel}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {rep.isReplaced ? "REPLACED" : "SERVICED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {rep.actionDescription}
                    </p>
                    <div className="pt-1 text-[9px] font-mono text-slate-400 flex justify-between border-t border-white/5">
                      <span>IPFS: {rep.ipfsEvidenceHash.substring(0, 12)}...</span>
                      <span>${rep.costUSD} USD</span>
                    </div>
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
