"use client";

import React from "react";
import { ShoppingBag, X, Copy } from "lucide-react";
import { AdminOrderRecord } from "./types";

interface AdminOrderDetailsModalProps {
  selectedOrder: AdminOrderRecord | null;
  onClose: () => void;
  onCopy: (text: string, key: string) => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
}

export default function AdminOrderDetailsModal({
  selectedOrder,
  onClose,
  onCopy,
  formatMoney,
  formatDate,
}: AdminOrderDetailsModalProps) {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-sky-600 dark:text-sky-400" />
              Order #{selectedOrder.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Buyer:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedOrder.buyerName}
              </span>{" "}
              (@{selectedOrder.buyerUsername}) • {formatDate(selectedOrder.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Order Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Product
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {selectedOrder.productName}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Quantity
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedOrder.quantity} item(s)
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Unit Price
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {formatMoney(selectedOrder.unitPrice)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Paid
              </span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatMoney(selectedOrder.totalAmount)}
              </p>
            </div>
          </div>

          {/* Delivered Account Logins */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Delivered Account Credentials ({selectedOrder.accounts.length})</span>
              <span className="text-[11px] font-normal text-slate-400 lowercase">
                dispatched to buyer
              </span>
            </h4>

            {selectedOrder.accounts.length === 0 ? (
              <p className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 text-center italic">
                No account credential payload attached.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedOrder.accounts.map((acc, idx) => (
                  <div
                    key={acc.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        Account #{idx + 1}
                      </span>
                      {acc.username && (
                        <button
                          type="button"
                          onClick={() => onCopy(acc.username || "", `acc-${acc.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          <Copy size={11} />
                          <span>Copy Login</span>
                        </button>
                      )}
                    </div>

                    {/* Username / Login Credential */}
                    {acc.username && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-200/60 dark:border-white/5 font-mono text-xs break-all select-all text-slate-800 dark:text-slate-200">
                        {acc.username}
                      </div>
                    )}

                    {/* Notes or instructions */}
                    {acc.loginInstructions && (
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Instructions:
                        </span>{" "}
                        {acc.loginInstructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
