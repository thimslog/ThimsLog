"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, RefreshCw, ArrowDownToLine, Clock, CheckCircle2 } from "lucide-react";
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
  const displayReady = collectedReady !== undefined ? collectedReady : balance;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900 via-[#0c1322] to-slate-950 text-white p-6 sm:p-7 shadow-xl">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mb-16" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Brand Badge & Balance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-[11px] font-semibold tracking-wide uppercase text-sky-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Paymonetra Gateway</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Merchant Account</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {mode}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Ready Balance (Available for Payout)
            </p>
            <div className="flex items-baseline gap-3 mt-1 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                {formatMoney(displayReady)}
              </h2>
              {ledgerBalance !== undefined && ledgerBalance !== displayReady && (
                <span className="text-xs text-slate-400 font-mono">
                  (Ledger: {formatMoney(ledgerBalance)})
                </span>
              )}
            </div>
          </div>

          {/* Breakdown Pills: Collected, Clearing, Settled */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {collectedAmount !== undefined && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                <ArrowDownToLine size={12} className="text-sky-400" />
                <span className="text-slate-400">Total Collected:</span>
                <span className="font-mono font-semibold text-white">
                  {formatMoney(collectedAmount)}
                </span>
              </div>
            )}

            {collectedClearing !== undefined && collectedClearing > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <Clock size={12} className="text-amber-400" />
                <span className="text-amber-400/80">Clearing:</span>
                <span className="font-mono font-semibold text-amber-200">
                  {formatMoney(collectedClearing)}
                </span>
              </div>
            )}

            {settledAmount !== undefined && settledAmount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-emerald-400/80">Settled:</span>
                <span className="font-mono font-semibold text-emerald-200">
                  {formatMoney(settledAmount)}
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Paymonetra balance"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-sky-400" : "text-slate-300"}
            />
            <span>{refreshing ? "Checking..." : "Refresh Balance"}</span>
          </button>

          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-sky-950/50"
          >
            <CreditCard size={14} />
            <span>View Transactions</span>
          </Link>

          <a
            href="https://business.paymonetra.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
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
