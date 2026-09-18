"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  RefreshCw,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatMoney } from "./types";

interface PaymonetraBalanceCardProps {
  balance?: number;
  collectedAmount?: number;
  collectedReady?: number;
  collectedClearing?: number;
  settledAmount?: number;
  ledgerBalance?: number;
  currency?: string;
  mode?: string;
  refreshing: boolean;
  disabled?: boolean;
  onRefresh: () => void;
}

export function PaymonetraBalanceCard({
  balance = 0,
  collectedAmount,
  collectedReady,
  collectedClearing,
  settledAmount,
  ledgerBalance,
  mode = "live",
  refreshing,
  disabled = false,
  onRefresh,
}: PaymonetraBalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const displayReady = collectedReady !== undefined ? collectedReady : balance;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-sky-50/30 dark:from-slate-900 dark:via-[#0c1322] dark:to-slate-950 text-slate-900 dark:text-white p-6 sm:p-7 shadow-xs dark:shadow-xl transition-colors duration-200">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mb-16" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Brand Badge & Balance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-white/10 hover:bg-sky-100 dark:hover:bg-white/15 border border-sky-200/80 dark:border-white/10 rounded-full text-[11px] font-semibold tracking-wide uppercase text-sky-700 dark:text-sky-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Paymonetra Gateway</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Merchant Account
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              {mode}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Ready Balance (Available for Payout)
              </p>
              <button
                type="button"
                onClick={() => setShowBalance((prev) => !prev)}
                className="w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title={showBalance ? "Hide balance" : "Show balance"}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>

            <div className="flex items-baseline gap-3 mt-1 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white select-none">
                {showBalance ? formatMoney(displayReady) : "••••••••"}
              </h2>
              {ledgerBalance !== undefined && ledgerBalance !== displayReady && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono select-none">
                  (Ledger: {showBalance ? formatMoney(ledgerBalance) : "••••••••"})
                </span>
              )}
            </div>
          </div>

          {/* Breakdown Pills: Collected, Clearing, Settled */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {collectedAmount !== undefined && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
                <ArrowDownToLine size={12} className="text-sky-600 dark:text-sky-400" />
                <span className="text-slate-500 dark:text-slate-400">Total Collected:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white select-none">
                  {showBalance ? formatMoney(collectedAmount) : "••••••••"}
                </span>
              </div>
            )}

            {collectedClearing !== undefined && collectedClearing > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <Clock size={12} className="text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700/80 dark:text-amber-400/80">Clearing:</span>
                <span className="font-mono font-semibold text-amber-900 dark:text-amber-200 select-none">
                  {showBalance ? formatMoney(collectedClearing) : "••••••••"}
                </span>
              </div>
            )}

            {settledAmount !== undefined && settledAmount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700/80 dark:text-emerald-400/80">Settled:</span>
                <span className="font-mono font-semibold text-emerald-900 dark:text-emerald-200 select-none">
                  {showBalance ? formatMoney(settledAmount) : "••••••••"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || disabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/15 dark:active:bg-white/20 border border-slate-200 dark:border-white/15 rounded-xl text-xs font-semibold text-slate-700 dark:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Paymonetra balance"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-300"}
            />
            <span>{refreshing ? "Checking..." : "Refresh Balance"}</span>
          </button>

          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-sky-600/20 dark:shadow-sky-950/50"
          >
            <CreditCard size={14} />
            <span>View Transactions</span>
          </Link>

          <a
            href="https://business.paymonetra.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-xs"
            title="Open Paymonetra Dashboard"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Paymonetra Portal</span>
          </a>
        </div>
      </div>
    </section>
  );
}
