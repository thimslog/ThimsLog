"use client";

import React from "react";
import { Wallet, Clock, CheckCircle2, CreditCard } from "lucide-react";
import { Metrics, formatMoney } from "./types";

interface TransactionMetricsCardsProps {
  metrics: Metrics | null;
}

export function TransactionMetricsCards({ metrics }: TransactionMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Volume */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Settled Volume
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <Wallet size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(metrics?.totalSuccessVolume || 0)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics?.successCount ?? 0} completed payments
          </p>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pending Queries
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {metrics?.pendingCount ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Requires query or settlement
          </p>
        </div>
      </div>

      {/* Successful Transactions */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Successful
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics?.successCount ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Confirmed transactions
          </p>
        </div>
      </div>

      {/* Total Count */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Logged
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <CreditCard size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalCountAll ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across all users & types
          </p>
        </div>
      </div>
    </div>
  );
}
