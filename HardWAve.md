# HardWAve Specification & Architecture Prompt

## Project Title
**HardWAve: Decentralized Hardware Authenticity, Warranty Provenance & 3D Interactive Inspection System**

---

## Executive Summary & Objective
Build an end-to-end Web3 provenance platform called **HardWAve** that eliminates counterfeit electronic components and unauthorized repairs in high-value hardware (such as GPUs, motherboards, and laptops). 

The platform pairs every physical device with an on-chain identity token on an EVM blockchain and presents an interactive **3D Digital Twin** in the browser using Three.js / React Three Fiber. When a user scans a hardware serial number or QR code, the application retrieves the immutable lifecycle history from the blockchain and visually highlights repaired or replaced components directly on the 3D model.

---

## Tech Stack Requirements

* **Blockchain Layer:** 
  * Smart contract engine written in **Solidity** using **Hardhat** or **Foundry** for testing and deployment.
  * Security and token standards powered by **OpenZeppelin Contracts** (`AccessControl`, `ERC-721`, `Pausable`).
  * Target deployment on an EVM Testnet (**Polygon Amoy** or **Ethereum Sepolia**).
* **Frontend Client & Web Portal:** 
  * Modern full-stack application built with **Next.js (App Router, TypeScript)**.
  * Interface styling and layout using **Tailwind CSS** and **shadcn/ui**.
  * Blockchain state management and wallet connection handled by **Wagmi**, **Viem**, and **Ethers.js v6**.
  * Camera-based serial/QR code scanner powered by **html5-qrcode** or **ZXing**.
* **3D Visualization Layer:** 
  * Browser-based 3D engine using **Three.js** via **React Three Fiber (`@react-three/fiber`)**.
  * Helper utilities, camera orbit controls, GLTF loaders, and lighting presets from **`@react-three/drei`**.
  * Optimized 3D model assets (`.glb` / `.gltf`) structured with distinct named sub-meshes prepared in **Blender**.
* **Backend Gateway & Indexing (Optional/Proxy):** 
  * Modular microservice gateway built with **NestJS (Node.js)** for manufacturer/vendor authentication.
  * Relational metadata cache and fast search indexing using **PostgreSQL** with **Prisma** or **SeaORM**.
* **Decentralized Storage:** 
  * Distributed file and document storage using **IPFS (via Pinata SDK)** to hold high-resolution component photos, diagnostic logs, and official service invoices.

---

## Core System Modules & Functional Requirements

### 1. Role-Based Smart Contract Architecture
* **Manufacturer Role:** Exclusive permission to mint and register new hardware units by binding their hashed serial numbers, production dates, and factory specs to an on-chain token.
* **Authorized Service Center Role:** Permission to append immutable maintenance records, log replaced part identifiers, and link IPFS hashes of repair invoices.
* **Consumer/Public Access:** Read-only capability to inspect the full timeline and warranty status of any registered hardware unit without paying gas fees.

### 2. Interactive 3D Digital Twin (Hardware Inspector)
* **Dynamic Material Shader State:** The 3D model must react dynamically to blockchain data. Sub-meshes marked as "Original Factory" render in a default neutral/metallic finish, while components flagged in on-chain repair logs (e.g., cooling fans, VRM, power phases) render in amber/red alert states.
* **Raycasting & Exploded Assembly:** Users can rotate, zoom, and explode the hardware model into its constituent parts. Clicking a specific 3D part triggers an event that fetches and displays that component's specific repair history.

### 3. QR / Barcode Hardware Scanner
* Integrated web camera scanner that reads physical barcodes or QR stickers on the device chassis, extracts the unique serial hash, and immediately routes the user to the corresponding 3D inspection view.

### 4. Decentralized Evidence Verification
* A dedicated tab inside the inspection portal that pulls verified documents and photos from IPFS gateways, matching the cryptographic hashes stored on the blockchain to ensure service receipts have not been altered.

---

## User Flow & Key User Stories

1. **Factory Registration Flow:** The manufacturer runs a batch script via the NestJS gateway to register 1,000 newly assembled graphics cards, uploading their factory metadata to IPFS and minting their provenance tokens on the EVM testnet.
2. **Authorized Service Flow:** A technician receives a malfunctioning unit, logs in using wallet-based signature authentication, selects the faulty sub-component from a checklist, uploads the repair invoice to IPFS, and submits the transaction to the smart contract.
3. **Second-Hand Buyer Flow:** A prospective buyer scans the QR code on a second-hand graphics card at a retail store, opens the HardWAve web app on their phone/laptop, inspects the 3D model, and immediately spots that the cooling fan was replaced with an aftermarket unit two months prior.