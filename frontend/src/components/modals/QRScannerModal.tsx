"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  QrCode,
  Camera,
  CameraOff,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  ScanLine,
  Loader2,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useHardwareStore } from "@/store/hardwareStore";

/**
 * The Barcode Detection API is available in Chromium browsers; everywhere else
 * the viewfinder still streams and the operator falls back to the serial
 * resolver on the right.
 */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return typeof ctor === "function" ? ctor : null;
}

type CameraState = "idle" | "starting" | "live" | "denied" | "unsupported";

/** How often the video frame is sampled for a barcode. */
const SCAN_INTERVAL_MS = 400;

export default function QRScannerModal() {
  const activeModal = useHardwareStore((s) => s.activeModal);
  const setActiveModal = useHardwareStore((s) => s.setActiveModal);
  const units = useHardwareStore((s) => s.units);
  const setActiveUnit = useHardwareStore((s) => s.setActiveUnit);
  const getUnitBySerial = useHardwareStore((s) => s.getUnitBySerial);

  const [inputSerial, setInputSerial] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [detectorAvailable, setDetectorAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isOpen = activeModal === "qr_scanner";

  const resolve = useCallback(
    (serialToResolve: string) => {
      const unit = getUnitBySerial(serialToResolve);
      if (unit) {
        setErrorMessage(null);
        setScanResult(unit.serialNumber);
        setActiveUnit(unit);
        return true;
      }
      setErrorMessage(
        `No on-chain token found for serial "${serialToResolve.trim().toUpperCase()}".`
      );
      setScanResult(null);
      return false;
    },
    [getUnitBySerial, setActiveUnit]
  );

  // ── Live webcam viewfinder ──
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let scanTimer = 0;

    const stop = () => {
      window.clearInterval(scanTimer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("unsupported");
        return;
      }

      setCameraState("starting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraState("live");

        const DetectorCtor = getBarcodeDetector();
        setDetectorAvailable(Boolean(DetectorCtor));
        if (!DetectorCtor) return;

        const detector = new DetectorCtor({
          formats: ["qr_code", "code_128", "code_39", "ean_13", "data_matrix"],
        });
        const canvas = (canvasRef.current ??= document.createElement("canvas"));
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        scanTimer = window.setInterval(async () => {
          const video = videoRef.current;
          if (!video || !ctx || video.readyState < 2) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const codes = await detector.detect(canvas);
            const value = codes[0]?.rawValue?.trim();
            if (value) {
              setInputSerial(value);
              resolve(value);
            }
          } catch {
            // A single failed frame is not worth surfacing; keep scanning.
          }
        }, SCAN_INTERVAL_MS);
      } catch {
        if (!cancelled) setCameraState("denied");
      }
    };

    start();

    // Closing the gate releases the camera and clears the previous scan, so
    // the next visit always starts from a blank viewfinder.
    return () => {
      cancelled = true;
      stop();
      setCameraState("idle");
      setScanResult(null);
      setErrorMessage(null);
      setInputSerial("");
    };
  }, [isOpen, resolve]);

  if (!isOpen) return null;

  const handleInspectNow = () => {
    if (!scanResult) return;
    const unit = getUnitBySerial(scanResult);
    if (!unit) return;
    setActiveUnit(unit);
    setActiveModal(unit.category === "GPU" ? "gpu_inspector" : "gallery");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl hw-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Hardware barcode and QR scanner"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setActiveModal(null);
      }}
    >
      <div
        className="w-full max-w-4xl h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          background: THEME.colors.glass.bgElevated,
          borderColor: THEME.colors.glass.border,
          boxShadow: THEME.colors.glass.shadow,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10 shrink-0 bg-black/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <QrCode size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-white truncate">
                Hardware Barcode &amp; QR Scanner Gate
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">
                Verify physical chassis serials against immutable smart-contract records
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            aria-label="Close scanner"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: live camera viewfinder */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 relative overflow-hidden">
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-dashed border-cyan-400/60 relative flex items-center justify-center bg-black/70 overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: cameraState === "live" ? "block" : "none" }}
              />

              {/* Scanning laser sweep */}
              {cameraState === "live" && (
                <div className="hw-scanline absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8]" />
              )}

              {/* Reticle corner brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {cameraState !== "live" && (
                <div className="text-center space-y-2 px-6">
                  {cameraState === "starting" ? (
                    <>
                      <Loader2 size={36} className="mx-auto text-cyan-400 animate-spin" />
                      <p className="text-[11px] font-mono text-cyan-300">Requesting camera…</p>
                    </>
                  ) : cameraState === "denied" ? (
                    <>
                      <CameraOff size={36} className="mx-auto text-amber-400" />
                      <p className="text-[11px] font-mono text-amber-300">
                        Camera permission denied
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Use the manual serial resolver instead.
                      </p>
                    </>
                  ) : cameraState === "unsupported" ? (
                    <>
                      <CameraOff size={36} className="mx-auto text-slate-500" />
                      <p className="text-[11px] font-mono text-slate-400">
                        No camera available on this device
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera size={36} className="mx-auto text-cyan-400 animate-pulse" />
                      <p className="text-[11px] font-mono text-cyan-300">Initialising viewfinder…</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono">
              {cameraState === "live" && detectorAvailable ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ScanLine size={13} /> Optical barcode recognition active
                </span>
              ) : cameraState === "live" ? (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <ScanLine size={13} /> Live feed only — this browser has no barcode decoder
                </span>
              ) : (
                <span className="text-slate-500">Manual serial entry available on the right</span>
              )}
            </div>
          </div>

          {/* Right: manual resolver */}
          <div className="w-full md:w-[380px] p-6 bg-black/40 flex flex-col justify-between overflow-y-auto hw-scroll gap-4">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Manual Serial Resolver
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter the serial from the device sticker, or pick a registered sample.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. HW-RTX3090-88421"
                  aria-label="Hardware serial number"
                  value={inputSerial}
                  onChange={(e) => setInputSerial(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && resolve(inputSerial)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => resolve(inputSerial)}
                  aria-label="Resolve serial"
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Search size={15} />
                </button>
              </div>

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
                        resolve(u.serialNumber);
                      }}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between gap-2 text-xs group"
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

            <div className="space-y-2">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {scanResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 hw-zoom-in">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <ShieldCheck size={16} />
                    <span>Verified on-chain hardware token</span>
                  </div>
                  <p className="text-xs text-white font-bold font-mono">{scanResult}</p>
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
