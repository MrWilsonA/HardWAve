"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  Cpu,
  Boxes,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Compass,
  CloudRain,
  QrCode,
  CheckCircle2,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetVehicle?: () => void;
  onResetBlockchain?: () => void;
}

export default function TutorialModal({
  isOpen,
  onClose,
  onResetVehicle,
  onResetBlockchain,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const TUTORIAL_STEPS = [
    {
      id: "controls",
      badge: "STEP 1 OF 5",
      title: "🏎️ Kendali Kemudi & Navigasi Pulau",
      subtitle: "Pelajari cara mengemudikan buggy dan menjelajahi pulau alam HardWAve.",
      icon: <Gamepad2 className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">MAJU / GAS</span>
              <kbd className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-black border border-amber-500/30 inline-block">
                W / ↑
              </kbd>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">BELOK KIRI / KANAN</span>
              <kbd className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-black border border-amber-500/30 inline-block">
                A / D / ← →
              </kbd>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">MUNDUR / REM</span>
              <kbd className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-black border border-amber-500/30 inline-block">
                S / ↓ / Spasi
              </kbd>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">INSPEKSI STASIUN</span>
              <kbd className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono font-black border border-emerald-500/30 inline-block">
                E / Klik Banner
              </kbd>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">RESET POSISI MOBIL</span>
              <kbd className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono font-black border border-purple-500/30 inline-block">
                R / Tombol Reset
              </kbd>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">PUTAR & ZOOM KAMERA</span>
              <span className="text-white font-bold text-[11px] block mt-0.5">
                Drag Mouse / Scroll Wheel
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-xs text-amber-200">
            <Compass className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              <strong>Fitur Fast Travel:</strong> Klik ikon kompas di kanan atas untuk berpindah instan (*teleport*) ke stasiun mana saja tanpa perlu mengemudi jauh!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "stations",
      badge: "STEP 2 OF 5",
      title: "🏛️ 5 Paviliun Pameran Hardware",
      subtitle: "Kunjungi 5 paviliun khusus yang tersebar di sekeliling pulau.",
      icon: <Layers className="w-6 h-6 text-sky-400" />,
      content: (
        <div className="space-y-3">
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <div>
                  <p className="font-bold text-white">GPU Inspection Lab (Barat Daya)</p>
                  <p className="text-[11px] text-slate-300">Exploded View 3D RTX 3090 & Deteksi Part Palsu/Servis</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-red-300">RTX 3090</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <div>
                  <p className="font-bold text-white">Blockchain Vault (Tenggara)</p>
                  <p className="text-[11px] text-slate-300">Visualisasi 3D/2D Graph Rantai Blok & Form Minting Pabrik</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-300">DAG GRAPH</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <p className="font-bold text-white">Service Workshop (Barat Laut)</p>
                  <p className="text-[11px] text-slate-300">Pencatatan Servis Resmi Teknisi & Upload Bukti IPFS</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300">COOLING FAN</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-bold text-white">QR Scanner Gate (Gerbang Selatan)</p>
                  <p className="text-[11px] text-slate-300">Pemindai Barcode / QR Kamera & Resolver Nomor Seri</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300">SCANNER</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <div>
                  <p className="font-bold text-white">Hardware Showroom (Timur Laut)</p>
                  <p className="text-[11px] text-slate-300">Galeri Motherboard NZXT, SSD Samsung, RAM Kingston</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-300">SHOWROOM</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "inspector",
      badge: "STEP 3 OF 5",
      title: "🔬 3D Exploded Inspector & Shader Alert",
      subtitle: "Cara mendeteksi keaslian komponen dan histori perbaikan hardware.",
      icon: <Cpu className="w-6 h-6 text-red-400" />,
      content: (
        <div className="space-y-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-emerald-400" />
              <span>Slider Exploded View (0% – 100%)</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Geser slider di bagian bawah modal untuk memisahkan lapisan GPU secara fisik (Backplate, PCB, GA102 Die, VRAM, VRM, Heatsink, dan Kipas).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> FACTORY ORIGINAL
              </span>
              <p className="text-[11px] text-slate-300">
                Komponen original pabrik akan menyala abu-abu/metalik tanpa catatan perbaikan.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                <ShieldAlert size={12} /> AMBER/RED ALERT
              </span>
              <p className="text-[11px] text-slate-300">
                Jika part pernah diganti/servis (seperti kipas), komponen akan menyala pendar amber/merah dengan bukti nota IPFS.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "blockchain",
      badge: "STEP 4 OF 5",
      title: "🌐 Mesin Blockchain Mandiri & Graph DAG",
      subtitle: "Visualisasi kriptografis nyata tanpa harus bergantung pada perangkat fisik asli.",
      icon: <Boxes className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
            <p className="font-bold text-purple-300 flex items-center gap-2">
              <Boxes size={16} />
              <span>Rantai Balok SHA-256 Interaktif</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Setiap kali terjadi <strong>Minting Pabrik</strong>, <strong>Pencatatan Servis</strong>, atau <strong>Pembelian Hardware</strong>, mesin blockchain mandiri akan langsung menambang (*mine*) balok baru dengan hash SHA-256 asli, Merkle Root, dan Nonce!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
              Cara Menggunakan Explorer:
            </span>
            <p className="text-[11px] text-slate-300">
              1. Buka <strong>Blockchain Vault</strong> atau klik tombol <strong>Saldo Wallet</strong> di Navbar.
            </p>
            <p className="text-[11px] text-slate-300">
              2. Klik balok mana saja pada grafik rantai untuk menginspeksi isi transaksi secara detail.
            </p>
            <p className="text-[11px] text-slate-300">
              3. Tekan tombol <strong>"Mine Consensus Block"</strong> untuk uji coba penambangan instan.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "marketplace",
      badge: "STEP 5 OF 5",
      title: "🛒 Sistem Pembelian & Kepemilikan On-Chain",
      subtitle: "Beli hardware virtual, transfer kepemilikan NFT, dan kelola inventaris.",
      icon: <ShoppingBag className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <p className="font-bold text-emerald-300 flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>Beli Hardware dengan Saldo Virtual</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Anda dibekali saldo awal <strong>8.50 ETH</strong> & <strong>420 HWAVE</strong>. Anda dapat membeli RTX 3090, Motherboard NZXT, SSD Samsung, RAM Kingston, atau Fan langsung di modal inspeksi/showroom.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
              Alur Pembelian 1-Klik:
            </span>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p>1. Klik tombol <strong>"Purchase & Claim NFT"</strong>.</p>
              <p>2. Saldo ETH Anda otomatis terpotong.</p>
              <p>3. Balok transaksi baru tertempa di Blockchain Graph.</p>
              <p>4. Status kepemilikan hardware berpindah menjadi <strong>"Owned by You"</strong>!</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentTutorial = TUTORIAL_STEPS[currentStep];

  const handleFullReset = () => {
    onResetBlockchain?.();
    onResetVehicle?.();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowResetConfirm(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-2xl rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
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
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Panduan Tutorial HardWAve</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  {currentTutorial.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Panduan Interaktif Penggunaan Open-World, 3D Inspector & Blockchain
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator Bullets */}
        <div className="flex items-center gap-1.5 px-6 pt-4 pb-1">
          {TUTORIAL_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : idx < currentStep
                  ? "bg-amber-500/40"
                  : "bg-white/10"
              }`}
              title={step.title}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {currentTutorial.icon}
              <h3 className="text-sm font-black text-white">{currentTutorial.title}</h3>
            </div>
            <p className="text-xs text-slate-400">{currentTutorial.subtitle}</p>
          </div>

          {currentTutorial.content}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          {/* Left: Quick Actions & Reset Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetVehicle?.();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
              title="Reset Mobil ke Titik Pusat (Shortcut: R)"
            >
              <RotateCcw size={13} />
              <span>Reset Mobil (R)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Reset Seluruh Data Simulasi & Saldo"
            >
              <span>Reset Data Game</span>
            </button>
          </div>

          {/* Right: Step Navigation */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
              >
                <span>Lanjut</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
              >
                <Check size={16} />
                <span>Mulai Eksplorasi!</span>
              </button>
            )}
          </div>
        </div>

        {/* Reset Confirmation Overlay */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
            <div className="max-w-sm w-full p-5 rounded-3xl bg-slate-950 border border-red-500/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Reset Seluruh Data Game?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tindakan ini akan mengembalikan saldo wallet ke 8.50 ETH, mereset blockchain ke Genesis Block, dan memindahkan mobil ke titik awal.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Data Berhasil Direset!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 font-bold text-xs hover:bg-white/15 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleFullReset}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-xs cursor-pointer shadow-lg active:scale-95"
                  >
                    Ya, Reset Data
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
