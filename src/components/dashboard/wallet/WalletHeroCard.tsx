"use client";

import React from "react";
import { RotateCw, Send } from "lucide-react";

interface WalletHeroCardProps {
  balance: number;
  currency: string;
  loading: boolean;
  refreshing: boolean;
  userName?: string;
  onRefresh: () => void;
  onOpenTransfer: () => void;
}

export default function WalletHeroCard({
  balance,
  currency,
  loading,
  refreshing,
  userName,
  onRefresh,
  onOpenTransfer,
}: WalletHeroCardProps) {
  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
  }).format(balance || 0);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-700 dark:from-sky-700 dark:via-sky-800 dark:to-slate-900 text-white p-8 sm:p-10 shadow-lg shadow-sky-600/15 transition-all">
      {/* Decorative Background Circles */}
      <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-sky-100 opacity-90">
            AVAILABLE FUNDS
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Balance"
            aria-label="Refresh Balance"
          >
            <RotateCw
              size={14}
              className={refreshing ? "animate-spin text-white" : ""}
            />
          </button>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight select-none">
          {loading ? "••••••••" : formattedBalance}
        </h1>

        {userName && (
          <p className="text-xs sm:text-sm text-sky-100/90 font-medium">
            Account Owner:{" "}
            <span className="font-semibold text-white">{userName}</span>
          </p>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenTransfer}
            className="inline-flex items-center gap-1.5 bg-white text-sky-700 hover:bg-sky-50 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-sky-900/20 hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Send size={14} />
            <span>Send Money to User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
