"use client";

import React from "react";
import {
  Boxes,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Key,
  Flame,
  Layers,
  Sparkles,
  Cpu,
  Coins,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { THEME } from "@/theme/designSystem";
import { useBlockchainEngine, Block, Transaction } from "@/store/blockchainEngine";

export default function BlockchainGraphExplorer() {
  const { chain, selectedBlockNumber, setSelectedBlockNumber, mineBlock, userWallet } =
    useBlockchainEngine();

  const activeBlock =
    chain.find((b) => b.blockNumber === selectedBlockNumber) || chain[chain.length - 1];

  const handleMineMockBlock = () => {
    const mockTx: Transaction = {
      txHash: `0xmock_${Date.now()}`,
      type: "TRANSFER",
      from: userWallet.address,
      to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Secondary Custodian)",
      tokenId: 1,
      serialNumber: "HW-RTX3090-88421",
      hardwareName: "NVIDIA RTX 3090 Founders Edition",
      amountETH: 0.005,
      details: "Autonomous Proof-of-Authority State Anchor • Verified by Consensus Node",
      timestamp: Date.now(),
    };
    mineBlock([mockTx]);
  };

  return (
    <div className="flex flex-col h-full space-y-4 select-none">
      {/* ── 1. Interactive Chain Flow Node Graph ── */}
      <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes size={18} className="text-purple-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Sovereign Blockchain DAG Graph (Height: #{chain.length - 1})
            </span>
          </div>

          <button
            type="button"
            onClick={handleMineMockBlock}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
          >
            <Sparkles size={13} className="text-purple-400 animate-spin" />
            <span>Mine Consensus Block</span>
          </button>
        </div>

        {/* Horizontal Visual Graph Chain */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 pr-2 scrollbar-thin scrollbar-thumb-purple-500/20">
          {chain.map((b, index) => {
            const isSelected = b.blockNumber === activeBlock.blockNumber;
            const isGenesis = b.blockNumber === 0;

            return (
              <React.Fragment key={b.blockNumber}>
                {/* Connecting Laser Line */}
                {index > 0 && (
                  <div className="flex items-center shrink-0">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" />
                    <ArrowRight size={12} className="text-indigo-400 -ml-1.5" />
                  </div>
                )}

                {/* Block Node Card */}
                <button
                  type="button"
                  onClick={() => setSelectedBlockNumber(b.blockNumber)}
                  className={`p-3.5 rounded-2xl border text-left transition-all shrink-0 cursor-pointer min-w-[170px] relative group ${
                    isSelected
                      ? "bg-purple-500/25 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-102"
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
                    {b.hash.substring(0, 14)}...
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                    Nonce: {b.nonce}
                  </p>

                  {/* Active Indicator Pip */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-ping" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── 2. Inspected Block Header & Merkle Details ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Left: Cryptographic Headers */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-400" />
              <span>Block Header #{activeBlock.blockNumber}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(activeBlock.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans font-bold">
                Block Hash (SHA-256)
              </span>
              <p className="text-purple-300 font-bold text-[11px] break-all">{activeBlock.hash}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans font-bold">
                Previous Block Hash
              </span>
              <p className="text-slate-300 text-[11px] break-all">{activeBlock.previousHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">
                  Merkle Root
                </span>
                <p className="text-indigo-300 text-[10px] truncate">{activeBlock.merkleRoot}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">
                  Nonce & Gas
                </span>
                <p className="text-amber-300 text-[10px] font-bold">
                  N: {activeBlock.nonce} • G: {activeBlock.gasUsed}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans font-bold">
                Validator / Miner Address
              </span>
              <p className="text-emerald-300 text-[10px] truncate">{activeBlock.miner}</p>
            </div>
          </div>
        </div>

        {/* Right: Transactions in this Block */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Transactions ({activeBlock.transactions.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              STATUS: CONFIRMED
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {activeBlock.transactions.map((tx, txi) => (
              <div
                key={tx.txHash + txi}
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
                    <span className="text-emerald-400 font-mono font-bold">
                      {tx.amountETH} ETH
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-white font-bold leading-relaxed">{tx.details}</p>

                {tx.serialNumber && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <span>Serial: <strong className="text-amber-300">{tx.serialNumber}</strong></span>
                    {tx.tokenId && <span>Token #{tx.tokenId}</span>}
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-500 truncate">
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
