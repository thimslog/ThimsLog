"use client";

import React from "react";
import { Wallet, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { Metrics, formatMoney } from "./types";

interface TransactionMetricsCardsProps {
  metrics: Metrics | null;
}

export function TransactionMetricsCards({ metrics }: TransactionMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Wallet Funding Deposits */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Wallet Deposits
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(metrics?.totalFundingVolume || 0)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics?.totalFundingCount ?? 0} settled deposits
          </p>
        </div>
      </div>

      {/* 2. Order Payments / Sales */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Order Purchases
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatMoney(metrics?.totalPaymentVolume || 0)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics?.totalPaymentCount ?? 0} account purchases
          </p>
        </div>
      </div>

      {/* 3. Pending Transactions */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
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

      {/* 4. Total Logged Records */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Logged
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalCountAll ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics?.successCount ?? 0} completed records
          </p>
        </div>
      </div>
    </div>
  );
}
