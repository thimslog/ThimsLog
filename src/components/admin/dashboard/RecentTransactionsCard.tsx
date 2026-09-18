"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import { RecentTransaction, formatMoney, formatDate, getToneForStatus } from "./types";

interface RecentTransactionsCardProps {
  transactions: RecentTransaction[];
  loading: boolean;
  verifyingId: string | null;
  onQueryTransaction: (txId: string) => void;
}

export function RecentTransactionsCard({
  transactions,
  loading,
  verifyingId,
  onQueryTransaction,
}: RecentTransactionsCardProps) {
  return (
    <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
            Recent Gateway Transactions
          </h2>
        </div>
        <Link
          href="/admin/transactions"
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
        >
          <span>View All Transactions</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-sky-600" />
                    <span>Loading transactions...</span>
                  </div>
                </td>
              </tr>
            ) : !transactions || transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No recent transactions logged.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isPending = tx.status === "PENDING";
                const isVerifying = verifyingId === tx.id;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {tx.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {tx.customerEmail}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(tx.amountRequested)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill label={tx.status} tone={getToneForStatus(tx.status)} />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => onQueryTransaction(tx.id)}
                          disabled={isVerifying}
                          className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <RefreshCw size={11} className={isVerifying ? "animate-spin" : ""} />
                          <span>{isVerifying ? "Querying..." : "Query"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(tx.createdAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
