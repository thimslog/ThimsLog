"use client";

import React from "react";
import { Eye, Check, Copy } from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { StatusPill } from "@/components/admin/status-pill";
import { OrderDetail } from "./types";

interface UserOrdersTableProps {
  orders: OrderDetail[];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onSelectOrder: (order: OrderDetail) => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
  getToneForStatus: (status: string) => "good" | "warn" | "bad" | "neutral";
}

export default function UserOrdersTable({
  orders,
  copiedKey,
  onCopy,
  onSelectOrder,
  formatMoney,
  formatDate,
  getToneForStatus,
}: UserOrdersTableProps) {
  return (
    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
      <table className="w-full text-left text-sm font-sans">
        <thead className="sticky top-0 z-10 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060a14] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          <tr>
            <th className="px-5 py-3.5">Product / Category</th>
            <th className="px-5 py-3.5">Order ID</th>
            <th className="px-5 py-3.5">Quantity</th>
            <th className="px-5 py-3.5">Total Amount</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5 text-right">View Accounts</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-normal">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                No orders placed by this user yet.
              </td>
            </tr>
          ) : (
            orders.map((ord) => {
              const title = ord.accountType?.name || "Social Account";
              return (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Product / Category */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <PlatformIcon
                        name={title}
                        size={14}
                        className="w-8 h-8 rounded-lg shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                          {title}
                        </p>
                        {ord.accountType?.category && (
                          <p className="text-[11px] text-slate-400 font-normal">
                            {ord.accountType.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Order ID */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                      <span>{ord.id.slice(0, 8)}...</span>
                      <button
                        onClick={() => onCopy(ord.id, ord.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {copiedKey === ord.id ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 px-2 py-0.5 rounded-md text-xs">
                      {ord.quantity} pcs
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatMoney(ord.totalAmount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusPill
                      label={ord.status}
                      tone={getToneForStatus(ord.status)}
                    />
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap font-normal">
                    {formatDate(ord.createdAt)}
                  </td>

                  {/* View Accounts */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(ord)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Accounts ({ord.accounts.length})</span>
                    </button>
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
