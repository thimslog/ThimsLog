"use client";

import React from "react";
import { Search, RefreshCw, X } from "lucide-react";
import { Pagination } from "./types";

interface UsersSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  onRefresh: () => void;
  loading: boolean;
  debouncedSearch: string;
  pagination: Pagination | null;
}

export default function UsersSearchHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onRefresh,
  loading,
  debouncedSearch,
  pagination,
}: UsersSearchHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0b101b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Live Search Input Form */}
        <form
          onSubmit={onSearchSubmit}
          className="relative flex-1 max-w-md flex items-center"
        >
          <Search
            size={16}
            className="absolute left-3.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, @username or phone..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 dark:focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md cursor-pointer transition-colors"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Refresh & Action Controls */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh user list"
          >
            <RefreshCw
              size={14}
              className={`text-slate-500 dark:text-slate-400 ${
                loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Search Filter Badge */}
      {debouncedSearch && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Search results for{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{debouncedSearch}&rdquo;
              </strong>
            </span>
            <button
              onClick={onClearSearch}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Reset filter
            </button>
          </div>
          {pagination && (
            <span>
              {pagination.total} match{pagination.total === 1 ? "" : "es"} found
            </span>
          )}
        </div>
      )}
    </div>
  );
}
