"use client";

import React from "react";
import { Search, RefreshCw, Download, Loader2, X } from "lucide-react";

interface AdminOrdersFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  loading: boolean;
  exporting: boolean;
  statusFilter: string;
  onStatusFilter: (status: string) => void;
}

export default function AdminOrdersFilters({
  searchQuery,
  onSearchChange,
  onRefresh,
  onExportCSV,
  loading,
  exporting,
  statusFilter,
  onStatusFilter,
}: AdminOrdersFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by buyer, @username, product, category, or order ID..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={exporting || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Export filtered orders to CSV"
          >
            {exporting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
        {["ALL", "COMPLETED", "PENDING", "FAILED"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === st
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {st === "ALL" ? "All Statuses" : st}
          </button>
        ))}
      </div>
    </section>
  );
}
