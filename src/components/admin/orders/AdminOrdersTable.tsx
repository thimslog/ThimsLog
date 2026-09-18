"use client";

import React from "react";
import Link from "next/link";
import { Copy, Check, ChevronLeft, ChevronRight, Loader2, Key } from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { AdminOrderRecord, Pagination } from "./types";

interface AdminOrdersTableProps {
  orders: AdminOrderRecord[];
  loading: boolean;
  debouncedSearch: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onSelectOrder: (order: AdminOrderRecord) => void;
  pagination: Pagination | null;
  page: number;
  onPageChange: (newPage: number) => void;
  formatMoney: (val: number | string | null | undefined) => string;
  formatDate: (iso: string) => string;
}

export default function AdminOrdersTable({
  orders,
  loading,
  debouncedSearch,
  copiedKey,
  onCopy,
  onSelectOrder,
  pagination,
  page,
  onPageChange,
  formatMoney,
  formatDate,
}: AdminOrdersTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
            <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <th className="px-5 py-3.5">Order ID</th>
              <th className="px-5 py-3.5">Customer / Buyer</th>
              <th className="px-5 py-3.5">Product & Category</th>
              <th className="px-5 py-3.5 text-center">Qty</th>
              <th className="px-5 py-3.5">Total Amount</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Date Placed</th>
              <th className="px-5 py-3.5 text-right">Items & Details</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y divide-slate-100 dark:divide-white/5 text-xs transition-opacity duration-150 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {loading && orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-[13px] text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <Loader2 size={18} className="animate-spin text-sky-600 dark:text-sky-400" />
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-[13px] text-slate-400 dark:text-slate-500"
                >
                  {debouncedSearch
                    ? `No orders found matching "${debouncedSearch}"`
                    : "No customer orders recorded yet."}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-5 py-3.5 font-mono text-[11.5px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy(order.id, `ord-${order.id}`)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Copy full Order ID"
                      >
                        {copiedKey === `ord-${order.id}` ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-3.5">
                    {order.buyerId ? (
                      <Link
                        href={`/admin/users/${order.buyerId}`}
                        className="group hover:underline block"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-xs group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center gap-1.5">
                          <span className="truncate max-w-[150px]">{order.buyerName}</span>
                        </p>
                        <p className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-medium">
                          @{order.buyerUsername}
                        </p>
                      </Link>
                    ) : (
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {order.buyerName}
                      </p>
                    )}
                  </td>

                  {/* Product & Category */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <PlatformIcon name={order.productName || order.categoryName} size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {order.productName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {order.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-3.5 text-center font-bold text-slate-900 dark:text-white">
                    {order.quantity}
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatMoney(order.totalAmount)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20"
                          : order.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11.5px]">
                    {formatDate(order.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Key size={12} />
                      <span>View Items ({order.accounts.length})</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={!pagination.hasPreviousPage || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(page + 1, pagination.totalPages))}
              disabled={!pagination.hasNextPage || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
