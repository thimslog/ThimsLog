"use client";

import React from "react";
import { Search, RotateCcw, RefreshCw, X, Download, Loader2 } from "lucide-react";

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  onOpenSyncModal: () => void;
  onRefresh: () => void;
  onExportCsv?: () => void;
  exportingCsv?: boolean;
  loading: boolean;
  appliedSearch: string;
  totalTransactions?: number;
}

export function TransactionFilters({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onOpenSyncModal,
  onRefresh,
  onExportCsv,
  exportingCsv = false,
  loading,
  appliedSearch,
  totalTransactions,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#0b101b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Search Input */}
        <form onSubmit={onSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Reference, User Email, Name..."
            className="w-full pl-10 pr-20 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by transaction status"
            className="bg-slate-50 dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Queryable)</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Filter by transaction type"
            className="bg-slate-50 dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="FUNDING">Funding</option>
            <option value="PAYMENT">Payment</option>
            <option value="TRANSFER_SENT">Transfer Sent</option>
            <option value="TRANSFER_RECEIVED">Transfer Received</option>
            <option value="REFUND">Refund</option>
          </select>

          {/* Export CSV Button */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              disabled={exportingCsv}
              title="Export filtered transactions as CSV spreadsheet"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              {exportingCsv ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              <span>Export CSV</span>
            </button>
          )}

          {/* Sync Paymonetra Transfer Button */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Import or resolve a missing Paymonetra transfer"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Sync Transfer</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Transactions"
            className="px-3.5 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Search Filter Pill */}
      {appliedSearch && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Search results for{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{appliedSearch}&rdquo;
              </strong>
            </span>
            <button
              onClick={onClearSearch}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Clear filter
            </button>
          </div>
          {totalTransactions !== undefined && (
            <span>{totalTransactions} transactions found</span>
          )}
        </div>
      )}
    </div>
  );
}
