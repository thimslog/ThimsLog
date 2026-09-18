"use client";

import React from "react";
import {
  Landmark,
  Building2,
  Copy,
  Check,
  Zap,
  Loader2,
} from "lucide-react";
import { WalletData } from "./types";

interface WalletVirtualAccountCardProps {
  wallet: WalletData | null;
  loading: boolean;
  generating: boolean;
  copiedField: string | null;
  userName?: string;
  onGenerateAccount: () => void;
  onCopyField: (text: string, fieldName: string) => void;
}

export default function WalletVirtualAccountCard({
  wallet,
  loading,
  generating,
  copiedField,
  userName,
  onGenerateAccount,
  onCopyField,
}: WalletVirtualAccountCardProps) {
  const hasVirtualAccount = Boolean(wallet?.accountNumber);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Zap size={22} className="text-sky-600 dark:text-sky-400 fill-sky-500" />
          Instant Funding
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Transfer to any of these virtual accounts to fund your wallet instantly.
        </p>
      </div>

      {/* Virtual Account Container */}
      <div className="max-w-xl mx-auto">
        {loading ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="text-sky-600 dark:text-sky-400 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading wallet details...
            </p>
          </div>
        ) : !hasVirtualAccount ? (
          /* Empty State: No Virtual Account Yet */
          <div className="rounded-3xl border-2 border-dashed border-sky-300 dark:border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 transition-all shadow-xs">
            {/* Center Bank Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-500 dark:to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
              <Landmark size={30} />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                No Virtual Account Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate a dedicated virtual account to receive instant transfers
                and auto-fund your wallet.
              </p>
            </div>

            <button
              type="button"
              onClick={onGenerateAccount}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating Account...</span>
                </>
              ) : (
                <span>+ Generate Virtual Account</span>
              )}
            </button>
          </div>
        ) : (
          /* Active Virtual Account Card */
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all space-y-6">
              {/* Card Header with Bank and Active Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Bank Provider
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {wallet?.bankName || "Wema Bank"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Credit
                </span>
              </div>

              {/* Account Number Display */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    Account Number
                  </p>
                  <p className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider select-all">
                    {wallet?.accountNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onCopyField(wallet?.accountNumber || "", "accountNumber")}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {copiedField === "accountNumber" ? (
                    <>
                      <Check size={15} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Account Name
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {wallet?.accountName || userName || "Account Owner"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCopyField(wallet?.accountName || userName || "", "accountName")
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy account name"
                  >
                    {copiedField === "accountName" ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Bank Name
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {wallet?.bankName || "Wema Bank"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyField(wallet?.bankName || "Wema Bank", "bankName")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy bank name"
                  >
                    {copiedField === "bankName" ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Note */}
              <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-500/20 p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-xs">
                  <Zap size={14} className="fill-sky-500 text-sky-500" />
                  <span>How to Fund Your Wallet:</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside pl-1">
                  <li>Open your bank app or internet banking.</li>
                  <li>
                    Transfer any amount to <strong>{wallet?.accountNumber}</strong> (
                    {wallet?.bankName || "Wema Bank"}).
                  </li>
                  <li>Your wallet balance will credit automatically within seconds.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
