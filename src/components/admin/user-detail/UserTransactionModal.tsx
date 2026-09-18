"use client";

import React from "react";
import { X } from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import { TransactionDetail } from "./types";

interface UserTransactionModalProps {
  selectedTx: TransactionDetail | null;
  onClose: () => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
  getToneForStatus: (status: string) => "good" | "warn" | "bad" | "neutral";
}

export default function UserTransactionModal({
  selectedTx,
  onClose,
  formatMoney,
  formatDate,
  getToneForStatus,
}: UserTransactionModalProps) {
  if (!selectedTx) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Transaction Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">
              Amount
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatMoney(selectedTx.amount || selectedTx.amountRequested)}
            </p>
          </div>
          <StatusPill
            label={selectedTx.status}
            tone={getToneForStatus(selectedTx.status)}
          />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <span className="text-slate-400">Type</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
              {selectedTx.type}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
            <span className="text-slate-400">Merchant Reference</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">
              {selectedTx.merchantReference}
            </span>
          </div>
          {selectedTx.paymonetraReference && (
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-400">Gateway Reference</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {selectedTx.paymonetraReference}
              </span>
            </div>
          )}
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Created Date</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatDate(selectedTx.createdAt)}
            </span>
          </div>
        </div>

        {selectedTx.metadata && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Metadata
            </span>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36">
              {JSON.stringify(selectedTx.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
