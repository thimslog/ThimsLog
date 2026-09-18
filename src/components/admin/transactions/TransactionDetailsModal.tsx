"use client";

import React from "react";
import { X, RefreshCw } from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import {
  TransactionRecord,
  formatMoney,
  formatDate,
  getToneForStatus,
} from "./types";

interface TransactionDetailsModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
  onQueryTransaction: (id: string) => void;
  verifyingId: string | null;
}

export function TransactionDetailsModal({
  transaction,
  onClose,
  onQueryTransaction,
  verifyingId,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <StatusPill
              label={transaction.status}
              tone={getToneForStatus(transaction.status)}
            />
            <span className="text-xs font-mono font-bold text-slate-500">
              {transaction.type}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Info */}
        <div className="space-y-4 text-xs">
          {/* Amount Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">
                Amount Requested
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formatMoney(transaction.amountRequested)}
              </span>
            </div>

            {transaction.amount && (
              <div className="text-right">
                <span className="text-slate-400 block text-[11px] uppercase font-bold">
                  Settled Amount
                </span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(transaction.amount)}
                </span>
              </div>
            )}
          </div>

          {/* Customer details */}
          <div className="space-y-2 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0b101b]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer Information
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.wallet?.user?.firstName}{" "}
                  {transaction.wallet?.user?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Username</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  @{transaction.wallet?.user?.userName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                  {transaction.wallet?.user?.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Wallet Balance
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatMoney(transaction.wallet?.balance ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* References & Technical details */}
          <div className="space-y-1.5 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Transaction Details
            </span>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-400">Merchant Reference</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {transaction.merchantReference}
              </span>
            </div>

            {transaction.paymonetraReference && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Paymonetra Ref</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {transaction.paymonetraReference}
                </span>
              </div>
            )}

            {transaction.collectionReference && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Collection Ref</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {transaction.collectionReference}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-400">Provider Gateway</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.provider || "PAYMONETRA"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Created At</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">
                {formatDate(transaction.createdAt)}
              </span>
            </div>
          </div>

          {/* Raw Gateway Metadata */}
          {transaction.metadata && (
            <div className="mt-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Gateway Raw Metadata
              </span>
              <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl text-[11px] overflow-x-auto max-h-40 font-mono border border-slate-800 dark:border-white/10">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer / Query action if pending */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
          {transaction.status === "PENDING" ? (
            <button
              type="button"
              onClick={() => onQueryTransaction(transaction.id)}
              disabled={verifyingId === transaction.id}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={verifyingId === transaction.id ? "animate-spin" : ""}
              />
              <span>
                {verifyingId === transaction.id
                  ? "Querying Gateway..."
                  : "Query Payment from Paymonetra"}
              </span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Status settled as {transaction.status}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
