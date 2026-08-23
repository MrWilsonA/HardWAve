"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  txHash: string;
  type: "MINT" | "PURCHASE" | "SERVICE" | "TRANSFER";
  from: string;
  to: string;
  tokenId?: number;
  serialNumber?: string;
  hardwareName?: string;
  amountETH?: number;
  details: string;
  timestamp: number;
}

export interface Block {
  blockNumber: number;
  hash: string;
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  timestamp: number;
  transactions: Transaction[];
  miner: string;
  gasUsed: number;
}

function pseudoSha256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, "0");
  const hex2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, "0");
  const hex3 = Math.abs((hash * 67) | 0).toString(16).padStart(8, "0");
  const hex4 = Math.abs((hash * 127) | 0).toString(16).padStart(8, "0");
  return `0x0000${hex1}${hex2}${hex3}${hex4}`.substring(0, 66);
}

const INITIAL_GENESIS_CHAIN: Block[] = [
  {
    blockNumber: 0,
    hash: "0x00008f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e90",
    previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    merkleRoot: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    nonce: 48291,
    timestamp: Date.now() - 30 * 24 * 3600 * 1000,
    miner: "0x0000000000000000000000000000000000000000 (HardWAve Genesis Node)",
    gasUsed: 21000,
    transactions: [
      {
        txHash: "0xgenesis_tx_00000000000000000000000000000000000000000000000000000000",
        type: "MINT",
        from: "0x0000000000000000000000000000000000000000",
        to: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        details: "HardWAve Sovereign EVM Genesis Protocol Initialized",
        timestamp: Date.now() - 30 * 24 * 3600 * 1000,
      },
    ],
  },
  {
    blockNumber: 1,
    hash: "0x00004e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    previousHash: "0x00008f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e90",
    merkleRoot: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    nonce: 89312,
    timestamp: Date.now() - 15 * 24 * 3600 * 1000,
    miner: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    gasUsed: 145000,
    transactions: [
      {
        txHash: "0x7f9a2b8c4d1e3f6a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
        type: "MINT",
        from: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        to: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        tokenId: 1,
        serialNumber: "HW-RTX3090-88421",
        hardwareName: "NVIDIA RTX 3090 Founders Edition",
        amountETH: 0,
        details: "Factory Genesis Token Minted with 36-Month Warranty",
        timestamp: Date.now() - 15 * 24 * 3600 * 1000,
      },
    ],
  },
  {
    blockNumber: 2,
    hash: "0x0000a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    previousHash: "0x00004e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    merkleRoot: "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    nonce: 63219,
    timestamp: Date.now() - 5 * 24 * 3600 * 1000,
    miner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    gasUsed: 92000,
    transactions: [
      {
        txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
        type: "SERVICE",
        from: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        to: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
        tokenId: 1,
        serialNumber: "HW-RTX3090-88421",
        hardwareName: "NVIDIA RTX 3090 Founders Edition",
        amountETH: 0.02,
        details: "Service Workshop Logged: OEM Fan Assembly Replacement • IPFS: QmYwAPJzv5...",
        timestamp: Date.now() - 5 * 24 * 3600 * 1000,
      },
    ],
  },
];

interface BlockchainState {
  chain: Block[];
  selectedBlockNumber: number | null;
  userWallet: {
    address: string;
    balanceETH: number;
    balanceHWAVE: number;
    ownedTokens: number[];
  };
  hardwarePrices: Record<string, number>; // Serial => Price in ETH

  // Actions
  setSelectedBlockNumber: (blockNum: number | null) => void;
  mineBlock: (transactions: Transaction[]) => Block;
  purchaseHardware: (tokenId: number, serialNumber: string, hardwareName: string, priceETH: number) => boolean;
  addTransactionAndMine: (tx: Omit<Transaction, "txHash" | "timestamp">) => Block;
}

export const useBlockchainEngine = create<BlockchainState>()(
  persist(
    (set, get) => ({
      chain: INITIAL_GENESIS_CHAIN,
      selectedBlockNumber: 2,
      userWallet: {
        address: "0x71C8F79B3564d6B690E8FfE93A9e917A00644a9B",
        balanceETH: 8.50,
        balanceHWAVE: 420.0,
        ownedTokens: [],
      },
      hardwarePrices: {
        "HW-RTX3090-88421": 0.45,
        "HW-SAM980P-51203": 0.06,
        "HW-RAM32GB-77192": 0.03,
        "HW-NZXTZ490-10492": 0.08,
        "HW-RGBFAN-33910": 0.015,
      },

      setSelectedBlockNumber: (num) => set({ selectedBlockNumber: num }),

      mineBlock: (transactions) => {
        const chain = get().chain;
        const previousBlock = chain[chain.length - 1];
        const newBlockNum = previousBlock.blockNumber + 1;
        const now = Date.now();
        const nonce = Math.floor(10000 + Math.random() * 90000);
        
        const rawString = `${newBlockNum}${previousBlock.hash}${now}${transactions.length}${nonce}`;
        const newHash = pseudoSha256(rawString);
        const merkle = pseudoSha256(`merkle_${now}_${transactions.length}`);

        const newBlock: Block = {
          blockNumber: newBlockNum,
          hash: newHash,
          previousHash: previousBlock.hash,
          merkleRoot: merkle,
          nonce,
          timestamp: now,
          transactions,
          miner: get().userWallet.address,
          gasUsed: 21000 + transactions.length * 45000,
        };

        set((state) => ({
          chain: [...state.chain, newBlock],
          selectedBlockNumber: newBlockNum,
        }));

        return newBlock;
      },

      addTransactionAndMine: (txData) => {
        const tx: Transaction = {
          ...txData,
          txHash: pseudoSha256(`tx_${Date.now()}_${Math.random()}`),
          timestamp: Date.now(),
        };
        return get().mineBlock([tx]);
      },

      purchaseHardware: (tokenId, serialNumber, hardwareName, priceETH) => {
        const wallet = get().userWallet;
        if (wallet.balanceETH < priceETH) return false;

        const newBalance = parseFloat((wallet.balanceETH - priceETH).toFixed(4));
        const newOwned = Array.from(new Set([...wallet.ownedTokens, tokenId]));

        const tx: Transaction = {
          txHash: pseudoSha256(`purchase_${serialNumber}_${Date.now()}`),
          type: "PURCHASE",
          from: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7 (Factory)",
          to: wallet.address,
          tokenId,
          serialNumber,
          hardwareName,
          amountETH: priceETH,
          details: `Direct Autonomous Purchase of ${hardwareName} (Token #${tokenId}) • Ownership Transferred to Buyer`,
          timestamp: Date.now(),
        };

        get().mineBlock([tx]);

        set({
          userWallet: {
            ...wallet,
            balanceETH: newBalance,
            ownedTokens: newOwned,
          },
        });

        return true;
      },
    }),
    {
      name: "hardwave-blockchain-engine",
    }
  )
);
