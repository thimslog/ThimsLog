"use client";

import React from "react";
import { X, Copy, Check } from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { OrderDetail } from "./types";

interface UserOrderDetailModalProps {
  selectedOrder: OrderDetail | null;
  copiedKey: string | null;
  onClose: () => void;
  onCopy: (text: string, key: string) => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
}

export default function UserOrderDetailModal({
  selectedOrder,
  copiedKey,
  onClose,
  onCopy,
  formatMoney,
  formatDate,
}: UserOrderDetailModalProps) {
  if (!selectedOrder) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <PlatformIcon
              name={selectedOrder.accountType?.name || "Order"}
              size={18}
              className="w-9 h-9 rounded-xl"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedOrder.accountType?.name || "Order Details"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Order ID: {selectedOrder.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              Total Paid
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {formatMoney(selectedOrder.totalAmount)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              Quantity
            </span>
            <span className="font-medium text-purple-700 dark:text-purple-300">
              {selectedOrder.quantity} Accounts
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-medium">
              Date
            </span>
            <span className="font-normal text-slate-700 dark:text-slate-300">
              {formatDate(selectedOrder.createdAt)}
            </span>
          </div>
        </div>

        {/* Accounts Delivered List */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Purchased Account Credentials ({selectedOrder.accounts.length})
          </span>

          {selectedOrder.accounts.map((acc, idx) => (
            <div
              key={acc.id || idx}
              className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2.5 text-xs shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-normal text-slate-400 text-xs">
                    #{idx + 1}
                  </span>
                  <span className="font-mono font-medium text-purple-600 dark:text-purple-400">
                    {acc.username || acc.name || acc.id}
                  </span>
                </div>
                <button
                  onClick={() =>
                    onCopy(
                      `${acc.username || acc.id} | ${acc.loginInstructions || ""} | ${acc.notes || ""}`,
                      `acc_${idx}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  {copiedKey === `acc_${idx}` ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedKey === `acc_${idx}` ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {acc.loginInstructions && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-medium block mb-1">
                    Credentials / Login Instructions:
                  </span>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-xs text-slate-900 dark:text-white break-all select-all border border-slate-100 dark:border-white/5 font-normal">
                    {acc.loginInstructions}
                  </div>
                </div>
              )}

              {acc.notes && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-medium block mb-0.5">
                    Notes:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs font-normal leading-relaxed">
                    {acc.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

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
