"use client";

import React from "react";
import { X } from "lucide-react";
import {
  TransactionRow,
  formatMoney,
  formatDateTime,
  formatType,
  statusStyles,
  isDebit,
} from "./types";

interface TransactionDetailsModalProps {
  transaction: TransactionRow | null;
  onClose: () => void;
}

export function TransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <dt className="text-slate-500 dark:text-slate-400">Type</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {formatType(transaction.type)}
            </dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <dt className="text-slate-500 dark:text-slate-400">Status</dt>
            <dd
              className={`font-semibold ${
                statusStyles[transaction.status] ?? "text-slate-900 dark:text-white"
              }`}
            >
              {formatType(transaction.status)}
            </dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <dt className="text-slate-500 dark:text-slate-400">Amount</dt>
            <dd
              className={`font-bold ${
                isDebit(transaction.type)
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isDebit(transaction.type) ? "-" : "+"}
              {formatMoney(transaction.amount)}
            </dd>
          </div>

          {/* Recipient Details for Sent Transfers */}
          {transaction.type === "TRANSFER_SENT" && transaction.metadata?.recipientUsername && (
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <dt className="text-slate-500 dark:text-slate-400">Recipient</dt>
              <dd className="font-semibold text-slate-900 dark:text-white text-right">
                {transaction.metadata.recipientName}{" "}
                <span className="text-sky-600 dark:text-sky-400">
                  (@{transaction.metadata.recipientUsername})
                </span>
              </dd>
            </div>
          )}

          {/* Sender Details for Received Transfers */}
          {transaction.type === "TRANSFER_RECEIVED" && transaction.metadata?.senderUsername && (
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <dt className="text-slate-500 dark:text-slate-400">Sender</dt>
              <dd className="font-semibold text-slate-900 dark:text-white text-right">
                {transaction.metadata.senderName}{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  (@{transaction.metadata.senderUsername})
                </span>
              </dd>
            </div>
          )}

          {/* Note */}
          {transaction.metadata?.note && (
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <dt className="text-slate-500 dark:text-slate-400">Note</dt>
              <dd className="font-medium text-slate-900 dark:text-white italic text-right max-w-[200px]">
                "{transaction.metadata.note}"
              </dd>
            </div>
          )}

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <dt className="text-slate-500 dark:text-slate-400">Provider</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {transaction.provider === "thimslog_internal" ? "Thimslog P2P" : transaction.provider}
            </dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <dt className="text-slate-500 dark:text-slate-400">Reference</dt>
            <dd className="font-mono text-xs text-slate-900 dark:text-white truncate ml-4">
              {transaction.merchantReference}
            </dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-slate-500 dark:text-slate-400">Date</dt>
            <dd className="font-medium text-slate-900 dark:text-white">
              {formatDateTime(transaction.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
