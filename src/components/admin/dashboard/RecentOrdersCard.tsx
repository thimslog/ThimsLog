"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { RecentOrder, formatMoney, formatDate } from "./types";

interface RecentOrdersCardProps {
  orders: RecentOrder[];
  totalOrdersCount: number;
  loading: boolean;
}

export function RecentOrdersCard({
  orders,
  totalOrdersCount,
  loading,
}: RecentOrdersCardProps) {
  return (
    <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-sky-600 dark:text-sky-400" />
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
            Recent Customer Orders
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {totalOrdersCount} total sales
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3">Product / Category</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Quantity</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-sky-600" />
                    <span>Loading sales feed...</span>
                  </div>
                </td>
              </tr>
            ) : !orders || orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No customer orders completed yet.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                    <div className="truncate max-w-[170px]">{ord.productName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {ord.categoryName}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {ord.userId ? (
                      <Link
                        href={`/admin/users/${ord.userId}`}
                        className="group block"
                        title="View customer details"
                      >
                        <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate max-w-[130px]">
                          {ord.buyerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {ord.buyerEmail}
                        </div>
                      </Link>
                    ) : (
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                          {ord.buyerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {ord.buyerEmail}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-semibold">
                      {ord.quantity} pcs
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    {formatMoney(ord.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-400 whitespace-nowrap text-[11px]">
                    {formatDate(ord.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
