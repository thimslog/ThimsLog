"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight, Package, CheckCircle2 } from "lucide-react";
import { UserStats } from "./types";

interface UserStatsCardsProps {
  stats: UserStats | null;
  ordersCount: number;
  formatMoney: (val: number | string | null | undefined) => string;
}

export default function UserStatsCards({
  stats,
  ordersCount,
  formatMoney,
}: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Funded */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Deposits
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {formatMoney(stats?.totalFunded || 0)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Lifetime funded volume</p>
      </div>

      {/* Total Spent */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <ArrowUpRight size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {formatMoney(stats?.totalSpent || 0)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Payments &amp; purchases</p>
      </div>

      {/* Total Orders */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
            Orders Placed
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-2">
          {stats?.totalOrders ?? ordersCount}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Completed product purchases</p>
      </div>

      {/* Successful Operations */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Success Txns
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {stats?.successCount ?? 0}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Completed transactions</p>
      </div>
    </div>
  );
}
