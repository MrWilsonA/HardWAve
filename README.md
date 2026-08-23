<div align="center">

# ⚡ HardWAve

**Decentralized Hardware Authenticity, Autonomous Blockchain & 3D Interactive Open-World Provenance System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=threedotjs)](https://threejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

An end-to-end Web3 provenance and digital twin ecosystem that combines an **arcade buggy driving open-world**, an **interactive 3D exploded hardware inspector**, an **autonomous sovereign blockchain engine with live DAG graph visualization**, and a **self-contained hardware NFT marketplace**.

[Features](#-key-features) • [Open-World Park](#-open-world-park--stations) • [Blockchain Architecture](#-blockchain-architecture--dag-graph) • [Tech Stack](#-tech-stack) • [Quickstart & Docker](#-quickstart--docker) • [Controls](#-controls--navigation)

---

</div>

## 🌟 Key Features

### 1. 🏎️ 3D Open-World Island & Arcade Buggy Simulation
* **Interactive Exploration:** Drive a red buggy across an aesthetic nature island featuring a Grand Oak World Tree centerpiece, central rotary, stone bridges, and 3,600+ dense volumetric grass tufts.
* **Living Dynamic World:** 10-minute real-time day/night lighting cycle, atmospheric rain storms with dense volumetric fog, and particle ripples.
* **Smooth Adaptive Audio:** Dual-channel audio system with velocity-modulated engine acceleration (`drive.mp3`), rainstorm ambient crossfade (`rainy.mp3`), and isekai exploration OST.

### 2. 🔬 Interactive 3D Exploded Hardware Inspection (Digital Twin)
* **Exploded Assembly Slider (0–100%):** Smoothly expand hardware models (e.g. RTX 3090) into isolated sub-components (Backplate, PCB, GA102 Silicon Die, 24GB GDDR6X VRAM, 18-Phase VRM, Copper Heatpipes, Triple Axial Fans, and Outer Shroud).
* **Dynamic Shader Alert System:** Original factory parts render in sleek metallic finishes, while repaired/aftermarket parts (e.g., replaced cooling fans) illuminate in amber/red alert states.
* **Component Raycasting:** Click any 3D submesh to view instant on-chain diagnostic history and IPFS attestation hashes.

### 3. 🌐 Sovereign Blockchain Engine & Live DAG Graph Explorer
* **Autonomous In-Browser EVM Simulation & Real EVM Contracts:** Generates SHA-256 cryptographic block headers (`Block Hash`, `Previous Hash`, `Merkle Root`, `Nonce`, `Gas Used`, `Timestamp`).
* **Visual 3D/2D Blockchain Node Graph:** Interactive cyber node chain connected by glowing laser links. Click any block (`#0 Genesis`, `#1 Mint`, `#2 Service`, `#N Purchase`) to inspect raw headers and transaction payloads.
* **Consensus Mining:** Mine new blocks on-demand or trigger automatic block creation when transactions execute.

### 4. 🛒 Autonomous Hardware Marketplace & Ownership Transfer
* **Self-Contained Economy:** Purchase tokenized hardware (RTX 3090, NZXT Motherboard, Samsung SSD, Kingston RAM, RGB Fan) using virtual wallet funds (`ETH` & `HWAVE`).
* **Instant On-Chain Transfer:** Deducts balance, mines a new transaction block on the sovereign chain, and transfers ERC-721 ownership directly to the buyer's wallet.
* **My Hardware Inventory:** Track certified ownership badges and warranty certificates in real-time.

### 5. 📱 QR & Barcode Hardware Scanner
* Built-in webcam viewfinder and serial number resolver for physical device chassis scanning, instantly routing to the corresponding 3D digital twin.

---

## 🏛️ Open-World Park & Stations

| Station | Location | Model | Interactive Experience |
| :--- | :--- | :--- | :--- |
| **GPU Inspection Lab** | `[-16, -16]` (SW) | RTX 3090 | 3D Exploded Assembly, Sub-mesh Diagnostics, Alert Shaders |
| **Blockchain Vault** | `[20, -16]` (SE) | Samsung 980 SSD | Live DAG Block Graph Explorer, Genesis Minting Portal |
| **Service Workshop** | `[-18, 18]` (NW) | RGB Cooling Fan | Authorized Technician Maintenance Logger & IPFS Proofs |
| **QR Scanner Gate** | `[0, -25]` (South Gate) | Kingston RAM | Live Webcam & Barcode Scanner, Serial Resolver |
| **Hardware Showroom** | `[22, 18]` (NE) | NZXT Z490 Board | Multi-Component Hardware Gallery & Marketplace Kiosk |

---

## ⛓️ Blockchain Architecture & DAG Graph

```mermaid
flowchart LR
    subgraph SovereignChain ["🌐 Sovereign HardWAve Blockchain Engine"]
        B0["Block #0 (Genesis)\nHash: 0x00008f1b..."] --> B1["Block #1 (Factory Mint)\nRTX 3090 Genesis Token"]
        B1 --> B2["Block #2 (Service Log)\nFan Replacement • IPFS: Qm..."]
        B2 --> B3["Block #3 (Autonomous Buy)\nOwner: 0x71C8...Demo"]
        B3 --> BN["Block #N (Consensus Mining)"]
    end

    subgraph Actions ["⚡ On-Chain User Actions"]
        M1["Genesis Mint Portal"] -.-> B1
        S1["Service Workshop"] -.-> B2
        P1["Marketplace Purchase"] -.-> B3
    end
```

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, TypeScript), Tailwind CSS |
| **3D Graphics & Physics Engine** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **State & Blockchain Engine** | Zustand (`zustand/persist`), Custom SHA-256 Sovereign DAG Engine |
| **Smart Contracts** | Solidity `^0.8.24`, Hardhat, OpenZeppelin Contracts (`ERC-721`, `AccessControl`) |
| **Web3 Client** | Wagmi, Viem, Ethers.js v6 |
| **Containerization** | Docker, Docker Compose, Alpine Linux |
| **Decentralized Storage** | IPFS (Pinata SDK) |

---

## 🚀 Quickstart & Docker

### Option A: Running via Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/MrWilsonA/HardWAve.git
cd HardWAve

# Start the full stack (Frontend, Blockchain Node, PostgreSQL)
docker compose up --build -d
```

> 🌐 Open **[http://localhost:3001](http://localhost:3001)** (or `http://localhost:3000`) in your browser.

### Option B: Local Node.js Development

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start Next.js development server
npm run dev
```

> 🌐 Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎮 Controls & Navigation

| Action | Control Key | Description |
| :--- | :--- | :--- |
| **Drive Forward** | `W` / `↑` | Accelerates the buggy forward with adaptive audio |
| **Steer Left / Right** | `A` / `D` / `←` `→` | Turns wheels with smooth arcade steering |
| **Reverse / Brake** | `S` / `↓` | Applies brake and engages reverse gear |
| **Inspect Station** | `E` / Click Banner | Opens interactive modal when inside a pavilion zone |
| **Rotate Camera** | `Left Click + Drag` | 360° Orbit inspection around vehicle or hardware |
| **Zoom Camera** | `Scroll Wheel` | Zoom in / out |
| **Fast Travel** | `Compass Icon` (HUD) | Instant GPS teleportation to any of the 5 pavilions |
| **Weather Mode** | `Cloud Icon` (HUD) | 1-Click toggle between Sunny Skies and Dynamic Rain |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.