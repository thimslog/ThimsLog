"use client";

import React from "react";
import { RotateCcw, Search, FileSpreadsheet } from "lucide-react";
import { OrderItem } from "./types";
import { downloadAllOrdersAsCsv } from "@/lib/export-orders";

interface OrderHistoryHeaderProps {
  ordersCount: number;
  filteredOrders: OrderItem[];
  search: string;
  setSearch: (val: string) => void;
}

export default function OrderHistoryHeader({
  ordersCount,
  filteredOrders,
  search,
  setSearch,
}: OrderHistoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80 dark:border-white/10">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <RotateCcw className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Order History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
          Access credentials, login details, usernames, emails, notes, and receipts for all purchased accounts.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {ordersCount > 0 && (
          <button
            type="button"
            onClick={() => downloadAllOrdersAsCsv(filteredOrders)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Download CSV spreadsheet of all delivered accounts"
          >
            <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Export All (CSV)</span>
          </button>
        )}

        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by username, email, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-normal"
          />
        </div>
      </div>
    </div>
  );
}
