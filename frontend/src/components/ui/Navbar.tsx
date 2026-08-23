"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Wrench, QrCode, Wallet } from "lucide-react";

export default function Navbar() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const toggleConnect = () => {
    if (!connected) {
      setConnected(true);
      setAccount("0x71C...4a9B");
    } else {
      setConnected(false);
      setAccount(null);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 font-mono">
              HardWAve
            </span>
            <span className="block text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
              Provenance Protocol
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            href="/inspect"
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors py-1"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            3D Inspector
          </Link>
          <Link
            href="/service"
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors py-1"
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            Service Center
          </Link>
          <Link
            href="#scanner"
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors py-1"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            QR Scan
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleConnect}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/30 text-cyan-200 transition-all shadow-md shadow-cyan-500/10 active:scale-95"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            {connected ? account : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
