"use client";

import React, { useMemo, useState, Suspense } from "react";
import {
  Boxes,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Box,
  Network,
  Copy,
  Check,
} from "lucide-react";
import {
  useBlockchainEngine,
  verifyChain,
  POW_DIFFICULTY,
  TECHNICIAN_ADDRESS,
} from "@/store/blockchainEngine";
import BlockchainGraph3D from "@/components/blockchain/BlockchainGraph3D";

type GraphMode = "3d" | "2d";

/** One-click copy for the long cryptographic values in the header panel. */
function CopyableHash({ label, value, tone }: { label: string; value: string; tone: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard is unavailable (insecure context) — the value stays selectable.
    }
  };

  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-sans font-bold">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-slate-400 hover:text-white cursor-pointer"
          title={`Copy ${label}`}
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>
      <p className={`text-[11px] break-all font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function BlockchainGraphExplorer() {
  const chain = useBlockchainEngine((s) => s.chain);
  const selectedBlockNumber = useBlockchainEngine((s) => s.selectedBlockNumber);
  const setSelectedBlockNumber = useBlockchainEngine((s) => s.setSelectedBlockNumber);
  const mineBlock = useBlockchainEngine((s) => s.mineBlock);
  const userWallet = useBlockchainEngine((s) => s.userWallet);

  const [mode, setMode] = useState<GraphMode>("3d");
  const [isMining, setIsMining] = useState(false);

  const activeBlock =
    chain.find((b) => b.blockNumber === selectedBlockNumber) || chain[chain.length - 1];

  // Every hash and Merkle root is re-derived; a mismatch means the chain was
  // tampered with in local storage.
  const integrity = useMemo(() => verifyChain(chain), [chain]);

  const totalTx = useMemo(
    () => chain.reduce((sum, b) => sum + b.transactions.length, 0),
    [chain]
  );

  const handleMineConsensusBlock = () => {
    setIsMining(true);
    // Yield a frame so the button can paint its mining state before the
    // proof-of-work search occupies the main thread.
    window.setTimeout(() => {
      mineBlock([
        {
          type: "TRANSFER",
          from: userWallet.address,
          to: `${TECHNICIAN_ADDRESS} (Secondary Custodian)`,
          tokenId: 1,
          serialNumber: "HW-RTX3090-88421",
          hardwareName: "NVIDIA RTX 3090 Founders Edition",
          amountETH: 0.005,
          details: "Autonomous Proof-of-Authority State Anchor • Verified by Consensus Node",
          timestamp: Date.now(),
        },
      ]);
      setIsMining(false);
    }, 30);
  };

  return (
    <div className="flex flex-col h-full gap-4 select-none">
      {/* ── 1. Chain header bar: height, integrity, view mode, mining ── */}
      <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-purple-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Sovereign DAG Graph
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
              Height #{chain.length - 1} • {totalTx} Tx • PoW 0x{"0".repeat(POW_DIFFICULTY)}
            </span>

            {integrity.valid ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={11} /> SHA-256 VERIFIED
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/40 text-red-400 flex items-center gap-1">
                <ShieldAlert size={11} /> TAMPERED AT #{integrity.brokenAt}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 3D / 2D view switch */}
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("3d")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === "3d"
                    ? "bg-purple-500/25 text-purple-200 border border-purple-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Box size={12} /> 3D
              </button>
              <button
                type="button"
                onClick={() => setMode("2d")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === "2d"
                    ? "bg-purple-500/25 text-purple-200 border border-purple-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Network size={12} /> 2D
              </button>
            </div>

            <button
              type="button"
              onClick={handleMineConsensusBlock}
              disabled={isMining}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-60 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
            >
              <Sparkles size={13} className={isMining ? "animate-spin" : ""} />
              <span>{isMining ? "Searching Nonce…" : "Mine Consensus Block"}</span>
            </button>
          </div>
        </div>

        {/* ── Graph viewport ── */}
        {mode === "3d" ? (
          <div className="h-[230px] rounded-2xl overflow-hidden border border-purple-500/20 bg-[#050313]">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-xs font-mono text-purple-300">
                  Initialising 3D graph…
                </div>
              }
            >
              <BlockchainGraph3D
                chain={chain}
                selectedBlockNumber={activeBlock.blockNumber}
                onSelect={setSelectedBlockNumber}
              />
            </Suspense>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 pr-2 hw-scroll">
            {chain.map((b, index) => {
              const isSelected = b.blockNumber === activeBlock.blockNumber;
              const isGenesis = b.blockNumber === 0;

              return (
                <React.Fragment key={b.hash}>
                  {/* Connecting laser line = previousHash pointer */}
                  {index > 0 && (
                    <div className="flex items-center shrink-0">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" />
                      <ArrowRight size={12} className="text-indigo-400 -ml-1.5" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedBlockNumber(b.blockNumber)}
                    className={`p-3.5 rounded-2xl border text-left transition-all shrink-0 cursor-pointer min-w-[170px] relative ${
                      isSelected
                        ? "bg-purple-500/25 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isGenesis
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {isGenesis ? "GENESIS #0" : `BLOCK #${b.blockNumber}`}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {b.transactions.length} Tx
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-purple-200 truncate font-bold">
                      {b.hash.substring(0, 16)}…
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                      Nonce: {b.nonce.toLocaleString()}
                    </p>

                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-ping" />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. Inspected block header & transactions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Cryptographic headers */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3 overflow-y-auto hw-scroll">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-400" />
              <span>Block Header #{activeBlock.blockNumber}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(activeBlock.timestamp).toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <CopyableHash
              label="Block Hash (SHA-256)"
              value={activeBlock.hash}
              tone="text-purple-300"
            />
            <CopyableHash
              label="Previous Block Hash"
              value={activeBlock.previousHash}
              tone="text-slate-300"
            />
            <CopyableHash
              label="Merkle Root (Transaction Tree)"
              value={activeBlock.merkleRoot}
              tone="text-indigo-300"
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">
                  PoW Nonce
                </span>
                <p className="text-amber-300 text-[11px] font-bold">
                  {activeBlock.nonce.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">
                  Gas Used
                </span>
                <p className="text-amber-300 text-[11px] font-bold">
                  {activeBlock.gasUsed.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans font-bold">
                Validator / Miner Address
              </span>
              <p className="text-emerald-300 text-[10px] break-all">{activeBlock.miner}</p>
            </div>
          </div>
        </div>

        {/* Transactions in this block */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Transactions ({activeBlock.transactions.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              STATUS: CONFIRMED
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 hw-scroll">
            {activeBlock.transactions.map((tx) => (
              <div
                key={tx.txHash}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      tx.type === "MINT"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : tx.type === "PURCHASE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : tx.type === "SERVICE"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    TX TYPE: {tx.type}
                  </span>
                  {tx.amountETH !== undefined && tx.amountETH > 0 && (
                    <span className="text-emerald-400 font-mono font-bold">{tx.amountETH} ETH</span>
                  )}
                </div>

                <p className="text-[11px] text-white font-bold leading-relaxed">{tx.details}</p>

                {tx.serialNumber && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <span>
                      Serial: <strong className="text-amber-300">{tx.serialNumber}</strong>
                    </span>
                    {tx.tokenId && <span>Token #{tx.tokenId}</span>}
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-500 break-all">
                  Hash: {tx.txHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
