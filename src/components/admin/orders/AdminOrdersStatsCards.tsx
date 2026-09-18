"use client";

import React from "react";
import { ShoppingBag, Package, TrendingUp } from "lucide-react";
import { OrderMetrics } from "./types";

interface AdminOrdersStatsCardsProps {
  metrics: OrderMetrics | null;
  formatMoney: (val: number | string | null | undefined) => string;
}

export default function AdminOrdersStatsCards({
  metrics,
  formatMoney,
}: AdminOrdersStatsCardsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Sales Volume */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Total Order Sales
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(metrics?.totalSalesVolume || 0)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {metrics?.totalOrdersCount ?? 0} completed orders
          </p>
        </div>
      </div>

      {/* Total Accounts Delivered */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Accounts Delivered
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics?.totalAccountsDelivered ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Items dispatched to customers
          </p>
        </div>
      </div>

      {/* Total Orders Logged */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Total Orders
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalOrdersCount ?? 0}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lifetime purchases recorded
          </p>
        </div>
      </div>
    </section>
  );
}
