"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import HeroHardwareCanvas from "@/components/3d/HeroHardwareCanvas";
import {
  ShieldCheck,
  Cpu,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<string>("gpu");
  const [serialInput, setSerialInput] = useState<string>("");

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Serial Search */}
          <div className="lg:col-span-7 space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold tracking-wide shadow-inner shadow-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Decentralized Hardware Provenance Protocol</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Verify Authenticity with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  Interactive 3D Digital Twins
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                Eliminate counterfeit hardware, unrecorded aftermarket repairs, and warranty fraud.
                Every physical component bound immutably on-chain with interactive 3D inspection.
              </p>
            </div>

            {/* Quick Serial Lookup Box */}
            <div className="p-2 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl max-w-xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="Enter Serial No. (e.g., HW-RTX3090-99824)"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-white font-mono"
                  />
                </div>
                <Link
                  href={`/inspect?serial=${encodeURIComponent(serialInput || "HW-RTX3090-99824")}`}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                >
                  <span>Inspect in 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-xl">
              <div>
                <p className="text-2xl font-mono font-bold text-white">100%</p>
                <p className="text-xs text-slate-400">On-Chain Provenance</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-cyan-400">0 ms</p>
                <p className="text-xs text-slate-400">Tamper-Proof Verify</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-indigo-400">ERC-721</p>
                <p className="text-xs text-slate-400">Digital Twin Standard</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Looping Showcase */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            {/* 3D Hardware Canvas Container */}
            <div className="w-full h-[450px] relative rounded-3xl bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-black/80 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden flex items-center justify-center group">
              
              {/* Top Bar Indicator */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                    Live 3D Looping Preview
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                  Interactive Orbit
                </div>
              </div>

              {/* 3D Canvas */}
              <HeroHardwareCanvas modelPath={`/models/${selectedPreset}.glb`} />

              {/* Bottom Quick Switcher */}
              <div className="absolute bottom-4 z-20 flex items-center gap-2 bg-black/70 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                {[
                  { id: "gpu", label: "GPU RTX 3090" },
                  { id: "fan", label: "Cooling Fan" },
                  { id: "ssd", label: "NVMe SSD" },
                  { id: "motherboard", label: "Motherboard" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPreset(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedPreset === item.id
                        ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction footnote */}
            <p className="text-xs text-slate-500 mt-3 text-center">
              💡 Drag to orbit 3D model. Place downloaded `.glb` files into <code className="text-cyan-400">frontend/public/models/</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Hardware Authenticity Architecture
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Engineered with Ethereum standards, IPFS decentralized receipts, and Three.js visual raycasting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Exploded 3D Inspection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Disassemble hardware into sub-meshes in the browser. Click on fans, VRMs, or VRAM chips to view their isolated repair and replacement logs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Role-Based EVM Tokens</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Manufacturers mint official factory tokens; Authorized Service Centers append repair records with cryptographic signatures and IPFS diagnostic hashes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Dynamic Shader State</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Factory original parts render in pristine metallic finish, while repaired or aftermarket replacement parts glow in amber/red alert states.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
