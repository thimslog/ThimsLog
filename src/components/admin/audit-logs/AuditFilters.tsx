"use client";

import React from "react";
import { Search, RotateCcw, Download, X, Loader2, Filter } from "lucide-react";

interface AuditFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  actionFilter: string;
  onActionChange: (val: string) => void;
  entityTypeFilter: string;
  onEntityTypeChange: (val: string) => void;
  adminFilter: string;
  onAdminChange: (val: string) => void;
  adminOptions: string[];
  onRefresh: () => void;
  onExportCsv: () => void;
  exportingCsv: boolean;
  loading: boolean;
  appliedSearch: string;
  totalLogs?: number;
}

const ACTION_OPTIONS = [
  { value: "ALL", label: "All Actions" },
  { value: "ADMIN_SIGNUP", label: "Admin Invited / Created" },
  { value: "ADMIN_PROFILE_UPDATED", label: "Admin Profile Updated" },
  { value: "ADMIN_PASSWORD_CHANGED", label: "Admin Password Changed" },
  { value: "DELETE_USER", label: "User Deleted" },
  { value: "TRANSACTION_VERIFIED", label: "Transaction Re-verified" },
  { value: "TRANSACTION_SYNCED", label: "Transaction Synced" },
  { value: "TICKET_UPDATED", label: "Ticket Updated" },
  { value: "TICKET_REPLIED", label: "Ticket Replied" },
  { value: "CATEGORY_CREATED", label: "Category Created" },
  { value: "CATEGORY_UPDATED", label: "Category Updated" },
  { value: "CATEGORY_DELETED", label: "Category Deleted" },
  { value: "PRODUCT_CREATED", label: "Product Created" },
  { value: "PRODUCT_UPDATED", label: "Product Updated" },
  { value: "PRODUCT_DELETED", label: "Product Deleted" },
  { value: "ACCOUNT_ADDED", label: "Stock Account Added" },
  { value: "ACCOUNT_UPDATED", label: "Stock Account Updated" },
  { value: "ACCOUNT_DELETED", label: "Stock Account Deleted" },
  { value: "HELP_LINK_CREATED", label: "Help Resource Created" },
  { value: "HELP_LINK_UPDATED", label: "Help Resource Updated" },
  { value: "HELP_LINK_DELETED", label: "Help Resource Deleted" },
];

const ENTITY_OPTIONS = [
  { value: "ALL", label: "All Entities" },
  { value: "ADMIN", label: "Admin System" },
  { value: "USER", label: "User Accounts" },
  { value: "TRANSACTION", label: "Transactions" },
  { value: "TICKET", label: "Support Tickets" },
  { value: "INVENTORY", label: "Catalog & Stock" },
  { value: "HELP_CENTER", label: "Help Center" },
];

export function AuditFilters({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  actionFilter,
  onActionChange,
  entityTypeFilter,
  onEntityTypeChange,
  adminFilter,
  onAdminChange,
  adminOptions,
  onRefresh,
  onExportCsv,
  exportingCsv,
  loading,
  appliedSearch,
  totalLogs,
}: AuditFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={onSearchSubmit} className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by admin email, action name, description, or IP..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Action, Entity & Admin Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => onActionChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs cursor-pointer"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => onEntityTypeChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs cursor-pointer"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Admin Email Filter */}
          {adminOptions.length > 0 && (
            <select
              value={adminFilter}
              onChange={(e) => onAdminChange(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">All Admins</option>
              {adminOptions.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Audit Logs"
          >
            <RotateCcw size={15} className={loading ? "animate-spin text-sky-600" : ""} />
          </button>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={exportingCsv || loading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Export CSV Audit Trail"
          >
            {exportingCsv ? (
              <Loader2 size={14} className="animate-spin text-sky-600" />
            ) : (
              <Download size={14} className="text-slate-500" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Applied Filters Status Banner */}
      {(appliedSearch || actionFilter !== "ALL" || entityTypeFilter !== "ALL" || adminFilter !== "ALL") && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Filtered by:</span>
          {appliedSearch && (
            <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-500/20 font-medium">
              Search: "{appliedSearch}"
              <button type="button" onClick={onClearSearch}>
                <X size={12} />
              </button>
            </span>
          )}
          {actionFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-500/20 font-medium">
              Action: {actionFilter}
              <button type="button" onClick={() => onActionChange("ALL")}>
                <X size={12} />
              </button>
            </span>
          )}
          {entityTypeFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-500/20 font-medium">
              Entity: {entityTypeFilter}
              <button type="button" onClick={() => onEntityTypeChange("ALL")}>
                <X size={12} />
              </button>
            </span>
          )}
          {adminFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-500/20 font-medium">
              Admin: {adminFilter}
              <button type="button" onClick={() => onAdminChange("ALL")}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
