"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "./types";

interface TransactionPaginationProps {
  pagination: Pagination;
  page: number;
  onPageChange: (newPage: number) => void;
}

export function TransactionPagination({
  pagination,
  page,
  onPageChange,
}: TransactionPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing page{" "}
        <span className="font-bold text-slate-900 dark:text-white">
          {pagination.page}
        </span>{" "}
        of{" "}
        <span className="font-bold text-slate-900 dark:text-white">
          {pagination.totalPages}
        </span>{" "}
        ({pagination.total} total transactions)
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {/* Numbered page buttons */}
        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => {
              return (
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.page) <= 1
              );
            })
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const hasGap = prev && pageNum - prev > 1;

              return (
                <div key={pageNum} className="flex items-center">
                  {hasGap && (
                    <span className="px-1 text-slate-400 text-xs select-none">
                      ...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`h-7 min-w-[28px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      pageNum === page
                        ? "bg-sky-600 text-white font-bold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                </div>
              );
            })}
        </div>

        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
