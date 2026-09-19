"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuditPaginationData } from "./types";

interface AuditPaginationProps {
  pagination: AuditPaginationData;
  page: number;
  onPageChange: (newPage: number) => void;
}

export function AuditPagination({
  pagination,
  page,
  onPageChange,
}: AuditPaginationProps) {
  const { total, totalPages, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-xs">
      <div className="text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{start}</span> to{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{end}</span> of{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> audit records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <div className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs">
          Page {page} of {totalPages || 1}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
