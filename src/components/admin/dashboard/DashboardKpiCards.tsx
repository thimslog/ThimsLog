"use client";

import React from "react";
import { TrendingUp, Wallet, Package, AlertTriangle } from "lucide-react";
import { formatMoney } from "./types";

interface DashboardKpiCardsProps {
  settledRevenue: number;
  settledCount: number;
  walletLiability: number;
  totalUsers: number;
  accountsAvailable: number;
  accountsSold: number;
  pendingTransactionsCount: number;
  openTicketsCount: number;
}

export function DashboardKpiCards({
  settledRevenue,
  settledCount,
  walletLiability,
  totalUsers,
  accountsAvailable,
  accountsSold,
  pendingTransactionsCount,
  openTicketsCount,
}: DashboardKpiCardsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Settled Revenue */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Settled Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(settledRevenue)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {settledCount}
            </span>{" "}
            settled gateway deposits
          </p>
        </div>
      </div>

      {/* Customer Wallet Float */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            User Wallet Float
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Wallet size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {formatMoney(walletLiability)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            Across{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalUsers}
            </span>{" "}
            registered users
          </p>
        </div>
      </div>

      {/* Available Inventory vs Sold */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Available Accounts
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Package size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {accountsAvailable}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-900 dark:text-white">
              {accountsSold}
            </span>{" "}
            accounts sold to date
          </p>
        </div>
      </div>

      {/* Action Required: Pending Queries & Open Tickets */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Actions Required
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingTransactionsCount + openTicketsCount}
            </h3>
            <span className="text-xs text-slate-400 font-medium">pending items</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>{pendingTransactionsCount} queryable tx</span>
            <span>•</span>
            <span>{openTicketsCount} open tickets</span>
          </p>
        </div>
      </div>
    </section>
  );
}
