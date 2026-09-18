"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  RefreshCw,
  Eye,
  Check,
  Copy,
} from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import { TransactionDetail } from "./types";

interface UserTransactionsTableProps {
  transactions: TransactionDetail[];
  verifyingId: string | null;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onQueryTransaction: (txId: string) => void;
  onSelectTransaction: (tx: TransactionDetail) => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
  getToneForStatus: (status: string) => "good" | "warn" | "bad" | "neutral";
}

export default function UserTransactionsTable({
  transactions,
  verifyingId,
  copiedKey,
  onCopy,
  onQueryTransaction,
  onSelectTransaction,
  formatMoney,
  formatDate,
  getToneForStatus,
}: UserTransactionsTableProps) {
  return (
    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060a14] text-[11px] uppercase tracking-wider text-slate-400 font-bold">
          <tr>
            <th className="px-5 py-3.5">Type</th>
            <th className="px-5 py-3.5">Amount</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Merchant Reference</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                No transactions found for this user.
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
                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          tx.type === "FUNDING"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                            : tx.type === "PAYMENT"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                        }`}
                      >
                        {tx.type === "FUNDING" ? (
                          <ArrowDownLeft size={13} />
                        ) : tx.type === "PAYMENT" ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tx.type}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5">
                    <p
                      className={`font-extrabold ${
                        tx.type === "PAYMENT"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {tx.type === "PAYMENT" ? "-" : "+"}
                      {formatMoney(tx.amount || tx.amountRequested)}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusPill
                      label={tx.status}
                      tone={getToneForStatus(tx.status)}
                    />
                  </td>

                  {/* Reference */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                      <span className="truncate max-w-[140px]">
                        {tx.merchantReference}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy(tx.merchantReference, tx.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {copiedKey === tx.id ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onQueryTransaction(tx.id)}
                          disabled={isVerifying}
                          className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
                          title="Query status from Paymonetra"
                        >
                          <RefreshCw
                            size={12}
                            className={isVerifying ? "animate-spin" : ""}
                          />
                          <span>{isVerifying ? "Checking..." : "Query"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
