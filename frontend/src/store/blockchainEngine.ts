"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sha256, stringToHex } from "viem";

export type TransactionType = "MINT" | "PURCHASE" | "SERVICE" | "TRANSFER";

export interface Transaction {
  txHash: string;
  type: TransactionType;
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

/* ───────────────────────────────────────────
   Cryptography — real SHA-256 over canonical
   block & transaction encodings (viem / @noble).
   ─────────────────────────────────────────── */

export const ZERO_HASH = `0x${"0".repeat(64)}`;
export const ZERO_ADDRESS = `0x${"0".repeat(40)}`;

/** Proof-of-Work target: a valid block hash must open with this many zero nibbles. */
export const POW_DIFFICULTY = 4;
/**
 * Safety valve so a slow device can never lock the UI thread indefinitely.
 * At difficulty 4 the expected search is ~65k hashes, so exhausting this cap is
 * a ~1-in-3-million event while the worst case still bounds at a few seconds.
 */
const MAX_POW_ITERATIONS = 1_000_000;

/** SHA-256 of an arbitrary UTF-8 string, as a 0x-prefixed 32-byte hex digest. */
export function hashString(input: string): string {
  return sha256(stringToHex(input));
}

/** Canonical encoding of a transaction, hashed to produce its immutable txHash. */
export function computeTxHash(tx: Omit<Transaction, "txHash">): string {
  return hashString(
    [
      tx.type,
      tx.from,
      tx.to,
      tx.tokenId ?? "",
      tx.serialNumber ?? "",
      tx.hardwareName ?? "",
      tx.amountETH ?? 0,
      tx.details,
      tx.timestamp,
    ].join("|")
  );
}

/**
 * Merkle root over the block's transaction hashes. Levels fold pairwise and a
 * lone trailing node is duplicated, matching Bitcoin's construction.
 */
export function computeMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) return ZERO_HASH;

  let level = transactions.map((tx) => tx.txHash);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(hashString(`${left}${right}`));
    }
    level = next;
  }
  return level[0];
}

/** Serializes the block header so hashing covers every consensus-critical field. */
function serializeHeader(
  blockNumber: number,
  previousHash: string,
  merkleRoot: string,
  timestamp: number,
  miner: string,
  gasUsed: number,
  nonce: number
): string {
  return [blockNumber, previousHash, merkleRoot, timestamp, miner, gasUsed, nonce].join("|");
}

/** Searches for a nonce whose header digest satisfies the difficulty target. */
export function mineHeader(
  blockNumber: number,
  previousHash: string,
  merkleRoot: string,
  timestamp: number,
  miner: string,
  gasUsed: number
): { hash: string; nonce: number } {
  const target = `0x${"0".repeat(POW_DIFFICULTY)}`;

  for (let nonce = 0; nonce < MAX_POW_ITERATIONS; nonce++) {
    const hash = hashString(
      serializeHeader(blockNumber, previousHash, merkleRoot, timestamp, miner, gasUsed, nonce)
    );
    if (hash.startsWith(target)) return { hash, nonce };
  }

  // Difficulty unreachable on this device — publish the best-effort header.
  const nonce = MAX_POW_ITERATIONS;
  return {
    hash: hashString(
      serializeHeader(blockNumber, previousHash, merkleRoot, timestamp, miner, gasUsed, nonce)
    ),
    nonce,
  };
}

/** Re-derives every hash in the chain and reports the first tampered block. */
export function verifyChain(chain: Block[]): { valid: boolean; brokenAt: number | null } {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];

    if (computeMerkleRoot(block.transactions) !== block.merkleRoot) {
      return { valid: false, brokenAt: block.blockNumber };
    }

    const expected = hashString(
      serializeHeader(
        block.blockNumber,
        block.previousHash,
        block.merkleRoot,
        block.timestamp,
        block.miner,
        block.gasUsed,
        block.nonce
      )
    );
    if (expected !== block.hash) return { valid: false, brokenAt: block.blockNumber };

    if (i > 0 && block.previousHash !== chain[i - 1].hash) {
      return { valid: false, brokenAt: block.blockNumber };
    }
  }
  return { valid: true, brokenAt: null };
}

/* ───────────────────────────────────────────
   Genesis chain — mined once, deterministically
   ─────────────────────────────────────────── */

export const FACTORY_ADDRESS = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";
export const TECHNICIAN_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
export const USER_ADDRESS = "0x71C8F79B3564d6B690E8FfE93A9e917A00644a9B";
const GENESIS_NODE = `${ZERO_ADDRESS} (HardWAve Genesis Node)`;

const DAY_MS = 24 * 3600 * 1000;
/** Fixed epoch so the genesis chain hashes identically on every device. */
const GENESIS_EPOCH = Date.UTC(2025, 0, 1);

/**
 * Nonces for the three genesis blocks. Their timestamps and payloads are fixed
 * constants, so the proof-of-work answer is too — baking it in keeps the ~1 s
 * of hashing off the page-load path. If any genesis content is ever edited the
 * cached nonce simply stops validating and the block is re-mined on the spot.
 */
const GENESIS_NONCES = [11353, 12178, 69834] as const;

function sealBlock(
  blockNumber: number,
  previousHash: string,
  timestamp: number,
  miner: string,
  drafts: Omit<Transaction, "txHash">[],
  cachedNonce?: number
): Block {
  const transactions: Transaction[] = drafts.map((draft) => ({
    ...draft,
    txHash: computeTxHash(draft),
  }));
  const merkleRoot = computeMerkleRoot(transactions);
  const gasUsed = 21000 + transactions.length * 45000;

  const sealed = (() => {
    if (cachedNonce !== undefined) {
      const hash = hashString(
        serializeHeader(
          blockNumber,
          previousHash,
          merkleRoot,
          timestamp,
          miner,
          gasUsed,
          cachedNonce
        )
      );
      if (hash.startsWith(`0x${"0".repeat(POW_DIFFICULTY)}`)) {
        return { hash, nonce: cachedNonce };
      }
    }
    return mineHeader(blockNumber, previousHash, merkleRoot, timestamp, miner, gasUsed);
  })();

  const { hash, nonce } = sealed;

  return {
    blockNumber,
    hash,
    previousHash,
    merkleRoot,
    nonce,
    timestamp,
    transactions,
    miner,
    gasUsed,
  };
}

function buildGenesisChain(): Block[] {
  const genesis = sealBlock(
    0,
    ZERO_HASH,
    GENESIS_EPOCH,
    GENESIS_NODE,
    [
      {
        type: "MINT",
        from: ZERO_ADDRESS,
        to: FACTORY_ADDRESS,
        details: "HardWAve Sovereign EVM Genesis Protocol Initialized",
        timestamp: GENESIS_EPOCH,
      },
    ],
    GENESIS_NONCES[0]
  );

  const factoryMint = sealBlock(
    1,
    genesis.hash,
    GENESIS_EPOCH + 15 * DAY_MS,
    FACTORY_ADDRESS,
    [
      {
        type: "MINT",
        from: FACTORY_ADDRESS,
        to: FACTORY_ADDRESS,
        tokenId: 1,
        serialNumber: "HW-RTX3090-88421",
        hardwareName: "NVIDIA RTX 3090 Founders Edition",
        amountETH: 0,
        details: "Factory Genesis Token Minted with 36-Month Warranty",
        timestamp: GENESIS_EPOCH + 15 * DAY_MS,
      },
    ],
    GENESIS_NONCES[1]
  );

  const serviceLog = sealBlock(
    2,
    factoryMint.hash,
    GENESIS_EPOCH + 25 * DAY_MS,
    TECHNICIAN_ADDRESS,
    [
      {
        type: "SERVICE",
        from: TECHNICIAN_ADDRESS,
        to: FACTORY_ADDRESS,
        tokenId: 1,
        serialNumber: "HW-RTX3090-88421",
        hardwareName: "NVIDIA RTX 3090 Founders Edition",
        amountETH: 0.02,
        details: "Service Workshop Logged: OEM Fan Assembly Replacement • IPFS: QmYwAPJzv5...",
        timestamp: GENESIS_EPOCH + 25 * DAY_MS,
      },
    ],
    GENESIS_NONCES[2]
  );

  return [genesis, factoryMint, serviceLog];
}

/* ───────────────────────────────────────────
   Wallet & marketplace economics
   ─────────────────────────────────────────── */

export const INITIAL_BALANCE_ETH = 8.5;
export const INITIAL_BALANCE_HWAVE = 420;
/** HWAVE loyalty tokens credited per ETH spent in the autonomous marketplace. */
const HWAVE_REWARD_PER_ETH = 100;

/** Marketplace price index (ETH), keyed by physical serial number. */
export const HARDWARE_PRICES: Record<string, number> = {
  "HW-RTX3090-88421": 0.45,
  "HW-SAM980P-51203": 0.06,
  "HW-RAM32GB-77192": 0.03,
  "HW-NZXTZ490-10492": 0.08,
  "HW-RGBFAN-33910": 0.015,
};

/** Fallback pricing for hardware minted at runtime, by category. */
const CATEGORY_FALLBACK_PRICES: Record<string, number> = {
  GPU: 0.45,
  Motherboard: 0.08,
  SSD: 0.06,
  RAM: 0.03,
  Cooling: 0.015,
};

/** Resolves a listing price, falling back to the category index for fresh mints. */
export function priceOf(
  prices: Record<string, number>,
  serialNumber: string,
  category?: string
): number {
  return (
    prices[serialNumber] ??
    (category ? CATEGORY_FALLBACK_PRICES[category] : undefined) ??
    0.05
  );
}

interface UserWallet {
  address: string;
  balanceETH: number;
  balanceHWAVE: number;
  ownedTokens: number[];
}

function freshWallet(): UserWallet {
  return {
    address: USER_ADDRESS,
    balanceETH: INITIAL_BALANCE_ETH,
    balanceHWAVE: INITIAL_BALANCE_HWAVE,
    ownedTokens: [],
  };
}

interface BlockchainState {
  chain: Block[];
  selectedBlockNumber: number | null;
  userWallet: UserWallet;
  hardwarePrices: Record<string, number>;

  setSelectedBlockNumber: (blockNum: number | null) => void;
  mineBlock: (drafts: Omit<Transaction, "txHash">[]) => Block;
  addTransactionAndMine: (tx: Omit<Transaction, "txHash" | "timestamp">) => Block;
  purchaseHardware: (
    tokenId: number,
    serialNumber: string,
    hardwareName: string,
    priceETH: number
  ) => boolean;
  setPrice: (serialNumber: string, priceETH: number) => void;
  resetChain: () => void;
}

function freshState() {
  return {
    chain: buildGenesisChain(),
    selectedBlockNumber: 2,
    userWallet: freshWallet(),
    hardwarePrices: { ...HARDWARE_PRICES },
  };
}

export const useBlockchainEngine = create<BlockchainState>()(
  persist(
    (set, get) => ({
      ...freshState(),

      setSelectedBlockNumber: (num) => set({ selectedBlockNumber: num }),

      mineBlock: (drafts) => {
        const { chain, userWallet } = get();
        const parent = chain[chain.length - 1];
        const newBlock = sealBlock(
          parent.blockNumber + 1,
          parent.hash,
          Date.now(),
          userWallet.address,
          drafts
        );

        set((state) => ({
          chain: [...state.chain, newBlock],
          selectedBlockNumber: newBlock.blockNumber,
        }));

        return newBlock;
      },

      addTransactionAndMine: (txData) => get().mineBlock([{ ...txData, timestamp: Date.now() }]),

      purchaseHardware: (tokenId, serialNumber, hardwareName, priceETH) => {
        const wallet = get().userWallet;
        if (wallet.ownedTokens.includes(tokenId)) return false;
        if (wallet.balanceETH < priceETH) return false;

        get().mineBlock([
          {
            type: "PURCHASE",
            from: `${FACTORY_ADDRESS} (Factory)`,
            to: wallet.address,
            tokenId,
            serialNumber,
            hardwareName,
            amountETH: priceETH,
            details: `Direct Autonomous Purchase of ${hardwareName} (Token #${tokenId}) • Ownership Transferred to Buyer`,
            timestamp: Date.now(),
          },
        ]);

        set((state) => ({
          userWallet: {
            ...state.userWallet,
            balanceETH: parseFloat((state.userWallet.balanceETH - priceETH).toFixed(4)),
            balanceHWAVE: parseFloat(
              (state.userWallet.balanceHWAVE + priceETH * HWAVE_REWARD_PER_ETH).toFixed(2)
            ),
            ownedTokens: [...state.userWallet.ownedTokens, tokenId],
          },
        }));

        return true;
      },

      setPrice: (serialNumber, priceETH) =>
        set((state) => ({
          hardwarePrices: { ...state.hardwarePrices, [serialNumber]: priceETH },
        })),

      resetChain: () => set(freshState()),
    }),
    {
      name: "hardwave-blockchain-engine",
      version: 2,
      // v1 persisted placeholder digests; rebuild so the chain verifies cryptographically.
      migrate: () => freshState(),
    }
  )
);
