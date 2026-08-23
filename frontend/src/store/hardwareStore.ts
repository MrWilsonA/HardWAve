"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RepairRecord {
  repairId: number;
  componentName: string; // e.g. "cooling_fan", "vrm", "vram", "pcb", "heatsink", "thermal_paste"
  componentLabel: string;
  actionDescription: string;
  isReplaced: boolean; // true = replaced, false = serviced/repaired
  ipfsEvidenceHash: string; // e.g. "QmZtmD2qtW34b1..."
  ipfsFileName?: string;
  technician: string; // Ethereum Address or Name
  serviceCenter: string;
  timestamp: number; // Unix epoch ms
  costUSD?: number;
}

export interface HardwareUnit {
  tokenId: number;
  serialNumber: string;
  modelName: string;
  category: "GPU" | "Motherboard" | "SSD" | "RAM" | "Cooling";
  manufacturer: string;
  manufacturerAddress: string;
  manufactureDate: number;
  warrantyMonths: number;
  isGenuine: boolean;
  modelPath: string;
  specs: Record<string, string>;
  repairHistory: RepairRecord[];
  txHash: string;
}

// Initial verified pre-seeded hardware tokens
const INITIAL_HARDWARE_UNITS: HardwareUnit[] = [
  {
    tokenId: 1,
    serialNumber: "HW-RTX3090-88421",
    modelName: "NVIDIA GeForce RTX 3090 Founders Edition 24GB",
    category: "GPU",
    manufacturer: "NVIDIA Corporation (Authorized Genesis Node)",
    manufacturerAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    manufactureDate: Date.now() - 180 * 24 * 3600 * 1000, // 6 months ago
    warrantyMonths: 36,
    isGenuine: true,
    modelPath: "/models/gpu.glb",
    txHash: "0x7f9a2b8c4d1e3f6a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    specs: {
      "VRAM Capacity": "24 GB GDDR6X",
      "Memory Bus": "384-bit",
      "CUDA Cores": "10,496 Cores",
      "Boost Clock": "1.70 GHz",
      "TDP Power": "350 Watts",
      "PCIe Interface": "PCIe 4.0 x16",
    },
    repairHistory: [
      {
        repairId: 1,
        componentName: "cooling_fan",
        componentLabel: "Center High-RPM Cooling Fan Assembly",
        actionDescription: "Replaced faulty fan bearing with official OEM dual-ball bearing fan module. Thermal paste reapplied with Arctic MX-6.",
        isReplaced: true,
        ipfsEvidenceHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        ipfsFileName: "invoice_rtx3090_fan_replacement.pdf",
        technician: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        serviceCenter: "CyberService Authorized Hub #04",
        timestamp: Date.now() - 45 * 24 * 3600 * 1000,
        costUSD: 45.0,
      },
    ],
  },
  {
    tokenId: 2,
    serialNumber: "HW-SAM980P-51203",
    modelName: "Samsung 980 PRO 2TB PCIe 4.0 NVMe M.2 SSD",
    category: "SSD",
    manufacturer: "Samsung Electronics Semiconductor Hub",
    manufacturerAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    manufactureDate: Date.now() - 90 * 24 * 3600 * 1000,
    warrantyMonths: 60,
    isGenuine: true,
    modelPath: "/models/ssd.glb",
    txHash: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    specs: {
      Capacity: "2,000 GB (2 TB)",
      "Seq. Read": "7,000 MB/s",
      "Seq. Write": "5,000 MB/s",
      Controller: "Samsung Elpis Controller (8nm)",
      NAND: "Samsung V-NAND 3-bit MLC",
      TBW: "1,200 TBW",
    },
    repairHistory: [],
  },
  {
    tokenId: 3,
    serialNumber: "HW-RAM32GB-77192",
    modelName: "Kingston HyperX Fury RGB 32GB (2x16GB) DDR4-3600",
    category: "RAM",
    manufacturer: "Kingston Technology Memory Works",
    manufacturerAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    manufactureDate: Date.now() - 120 * 24 * 3600 * 1000,
    warrantyMonths: 120, // Lifetime limited
    isGenuine: true,
    modelPath: "/models/ram.glb",
    txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    specs: {
      Kit: "2 x 16GB (32GB Total)",
      Speed: "DDR4-3600 MHz",
      Latency: "CL18-22-22",
      Voltage: "1.35V",
      Profile: "Intel XMP 2.0 Ready",
    },
    repairHistory: [],
  },
  {
    tokenId: 4,
    serialNumber: "HW-NZXTZ490-10492",
    modelName: "NZXT N7 Z490 Matte Black Intel ATX Motherboard",
    category: "Motherboard",
    manufacturer: "NZXT Global Hardware Facility",
    manufacturerAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    manufactureDate: Date.now() - 210 * 24 * 3600 * 1000,
    warrantyMonths: 36,
    isGenuine: true,
    modelPath: "/models/motherboard.glb",
    txHash: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    specs: {
      Socket: "LGA 1200 (Intel 10th & 11th Gen)",
      Chipset: "Intel Z490",
      "Power Phases": "8+2 DrMOS Power Design",
      Memory: "4x DIMM DDR4 up to 4266+ MHz",
      Wireless: "Wi-Fi 6 AX200 + Bluetooth 5.1",
    },
    repairHistory: [
      {
        repairId: 1,
        componentName: "vrm",
        componentLabel: "VRM Heat Shield & Thermal Pads",
        actionDescription: "Upgraded VRM thermal pad thickness to 1.5mm 12.8W/mK and updated UEFI BIOS to firmware v1.40 for 11th-Gen stability.",
        isReplaced: false,
        ipfsEvidenceHash: "QmPfJzv3YwAPsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdZ",
        ipfsFileName: "nzxt_vrm_servicing_report.pdf",
        technician: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        serviceCenter: "CyberService Authorized Hub #04",
        timestamp: Date.now() - 60 * 24 * 3600 * 1000,
        costUSD: 25.0,
      },
    ],
  },
  {
    tokenId: 5,
    serialNumber: "HW-RGBFAN-33910",
    modelName: "HardWAve HydroDynamic 120mm ARGB PWM Cooling Fan",
    category: "Cooling",
    manufacturer: "HardWAve Thermal Labs",
    manufacturerAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    manufactureDate: Date.now() - 30 * 24 * 3600 * 1000,
    warrantyMonths: 24,
    isGenuine: true,
    modelPath: "/models/fan.glb",
    txHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    specs: {
      Dimensions: "120 x 120 x 25 mm",
      Speed: "500 - 2,000 RPM (PWM)",
      Airflow: "65.57 CFM",
      Noise: "27.8 dBA Max",
      LEDs: "16 Addressable Gen2 RGB LEDs",
    },
    repairHistory: [],
  },
];

interface HardwareStoreState {
  units: HardwareUnit[];
  activeUnit: HardwareUnit | null;
  activeModal: "gpu_inspector" | "vault_mint" | "service_workshop" | "qr_scanner" | "gallery" | null;
  inspectedSubmesh: string | null;

  // Actions
  setActiveModal: (modal: "gpu_inspector" | "vault_mint" | "service_workshop" | "qr_scanner" | "gallery" | null) => void;
  setActiveUnit: (unit: HardwareUnit | null) => void;
  setInspectedSubmesh: (submesh: string | null) => void;
  getUnitBySerial: (serial: string) => HardwareUnit | undefined;
  getUnitById: (tokenId: number) => HardwareUnit | undefined;
  registerHardware: (
    serial: string,
    modelName: string,
    category: "GPU" | "Motherboard" | "SSD" | "RAM" | "Cooling",
    specs: Record<string, string>,
    warrantyMonths?: number
  ) => HardwareUnit;
  logRepair: (
    serialNumber: string,
    repair: Omit<RepairRecord, "repairId" | "timestamp">
  ) => boolean;
}

export const useHardwareStore = create<HardwareStoreState>()(
  persist(
    (set, get) => ({
      units: INITIAL_HARDWARE_UNITS,
      activeUnit: INITIAL_HARDWARE_UNITS[0],
      activeModal: null,
      inspectedSubmesh: null,

      setActiveModal: (modal) => set({ activeModal: modal }),
      setActiveUnit: (unit) => set({ activeUnit: unit }),
      setInspectedSubmesh: (submesh) => set({ inspectedSubmesh: submesh }),

      getUnitBySerial: (serial) => {
        const clean = serial.trim().toUpperCase();
        return get().units.find((u) => u.serialNumber.toUpperCase() === clean);
      },

      getUnitById: (tokenId) => {
        return get().units.find((u) => u.tokenId === tokenId);
      },

      registerHardware: (serial, modelName, category, specs, warrantyMonths = 36) => {
        const newId = get().units.length + 1;
        const randomHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        
        let modelPath = "/models/gpu.glb";
        if (category === "SSD") modelPath = "/models/ssd.glb";
        if (category === "RAM") modelPath = "/models/ram.glb";
        if (category === "Motherboard") modelPath = "/models/motherboard.glb";
        if (category === "Cooling") modelPath = "/models/fan.glb";

        const newUnit: HardwareUnit = {
          tokenId: newId,
          serialNumber: serial.toUpperCase(),
          modelName,
          category,
          manufacturer: "HardWAve Certified Genesis Protocol",
          manufacturerAddress: "0x71C8F79B3564d6B690E8FfE93A9e917A00644a9B",
          manufactureDate: Date.now(),
          warrantyMonths,
          isGenuine: true,
          modelPath,
          specs,
          repairHistory: [],
          txHash: randomHash,
        };

        set((state) => ({
          units: [newUnit, ...state.units],
          activeUnit: newUnit,
        }));

        return newUnit;
      },

      logRepair: (serialNumber, repair) => {
        const unit = get().getUnitBySerial(serialNumber);
        if (!unit) return false;

        const newRepair: RepairRecord = {
          ...repair,
          repairId: unit.repairHistory.length + 1,
          timestamp: Date.now(),
        };

        set((state) => ({
          units: state.units.map((u) => {
            if (u.serialNumber.toUpperCase() === serialNumber.toUpperCase()) {
              return {
                ...u,
                repairHistory: [newRepair, ...u.repairHistory],
              };
            }
            return u;
          }),
          activeUnit:
            state.activeUnit?.serialNumber.toUpperCase() === serialNumber.toUpperCase()
              ? { ...state.activeUnit, repairHistory: [newRepair, ...state.activeUnit.repairHistory] }
              : state.activeUnit,
        }));

        return true;
      },
    }),
    {
      name: "hardwave-hardware-registry",
    }
  )
);
