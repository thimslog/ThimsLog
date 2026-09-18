"use client";

import React from "react";
import { Wallet, Copy, Check } from "lucide-react";
import { UserDetail, WalletDetail } from "./types";

interface UserWalletCardProps {
  user: UserDetail;
  wallet: WalletDetail | null;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  formatMoney: (val: number | string | null | undefined) => string;
}

export default function UserWalletCard({
  user,
  wallet,
  copiedKey,
  onCopy,
  formatMoney,
}: UserWalletCardProps) {
  return (
    <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs flex flex-col justify-between space-y-6">
      {/* Header & Balance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-700 text-white shadow-md">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-sky-100">
            WALLET BALANCE
          </span>
          <p className="text-3xl sm:text-4xl font-black mt-0.5 select-none">
            {formatMoney(wallet?.balance || 0)}
          </p>
          <p className="text-xs text-sky-100/90 mt-1">
            Currency: <span className="font-bold text-white">{wallet?.currency || "NGN"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Virtual Account Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Bank Provider</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {wallet?.bankName || "Wema Bank"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Account Number</span>
            {wallet?.accountNumber && (
              <button
                onClick={() => onCopy(wallet.accountNumber!, "accountNum")}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "accountNum" ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copiedKey === "accountNum" ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
          <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
            {wallet?.accountNumber || "No account generated"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Account Name</span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {wallet?.accountName || `${user.firstName} ${user.lastName}`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Customer Gateway Reference</span>
          <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
            {wallet?.paymonetraCustomer || `wallet_${user.id}`}
          </p>
        </div>
      </div>
    </div>
  );
}
