"use client";

import React from "react";
import {
  Wallet,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import {
  TransactionRow,
  formatMoney,
  formatDateTime,
  formatType,
  statusStyles,
  isDebit,
} from "./types";

interface TransactionsTableProps {
  transactions: TransactionRow[];
  loading: boolean;
  error: string;
  verifyingId: string | null;
  onSelectTransaction: (tx: TransactionRow) => void;
  onVerifyTransaction: (id: string) => void;
}

export function TransactionsTable({
  transactions,
  loading,
  error,
  verifyingId,
  onSelectTransaction,
  onVerifyTransaction,
}: TransactionsTableProps) {
  const getTxIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_SENT":
        return <ArrowUpRight size={15} className="text-rose-500" />;
      case "TRANSFER_RECEIVED":
        return <ArrowDownLeft size={15} className="text-emerald-500" />;
      case "FUNDING":
        return <Wallet size={15} className="text-sky-500" />;
      case "PAYMENT":
        return <ShoppingCart size={15} className="text-rose-500" />;
      default:
        return <CreditCard size={15} className="text-sky-500" />;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xs transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-white/10">
              <th className="text-left px-6 py-4">View</th>
              <th className="text-left px-6 py-4">Type</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Balance</th>
              <th className="text-left px-6 py-4">Details</th>
              <th className="text-left px-6 py-4">Reference</th>
              <th className="text-left px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  Loading transactions...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-rose-600 dark:text-rose-400 font-medium"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && transactions.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  No transactions yet.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectTransaction(tx)}
                      className="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        {getTxIcon(tx.type)}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatType(tx.type)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    <span
                      className={
                        isDebit(tx.type)
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : "text-emerald-600 dark:text-emerald-400 font-bold"
                      }
                    >
                      {isDebit(tx.type) ? "-" : "+"}
                      {formatMoney(tx.amount)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 font-semibold ${
                      statusStyles[tx.status] ?? "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {formatType(tx.status)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <span className="line-through text-slate-400 dark:text-slate-600">
                      {formatMoney(tx.balanceBefore)}
                    </span>
                    <span className="mx-1">→</span>
                    <span
                      className={
                        isDebit(tx.type)
                          ? "text-slate-900 dark:text-white font-semibold"
                          : "text-sky-600 dark:text-sky-400 font-semibold"
                      }
                    >
                      {formatMoney(tx.balanceAfter)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs">
                    {tx.type === "TRANSFER_SENT" && tx.metadata?.recipientUsername ? (
                      <span>
                        To:{" "}
                        <strong className="text-sky-600 dark:text-sky-400">
                          @{tx.metadata.recipientUsername}
                        </strong>
                      </span>
                    ) : tx.type === "TRANSFER_RECEIVED" && tx.metadata?.senderUsername ? (
                      <span>
                        From:{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          @{tx.metadata.senderUsername}
                        </strong>
                      </span>
                    ) : (
                      <span>{tx.serviceId ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {tx.merchantReference
                      ? tx.merchantReference.slice(0, 12) + "..."
                      : tx.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === "PENDING" && tx.provider !== "thimslog_internal" && (
                      <button
                        onClick={() => onVerifyTransaction(tx.id)}
                        disabled={verifyingId === tx.id}
                        className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-60 cursor-pointer transition-colors"
                      >
                        <RefreshCw
                          size={11}
                          className={verifyingId === tx.id ? "animate-spin" : ""}
                        />
                        {verifyingId === tx.id ? "Checking..." : "Requery"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
