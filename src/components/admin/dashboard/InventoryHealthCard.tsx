"use client";

import React from "react";
import Link from "next/link";
import { Layers, ChevronRight, CheckCircle2 } from "lucide-react";
import { LowStockProduct, formatMoney } from "./types";

interface InventoryHealthCardProps {
  lowStockProducts: LowStockProduct[];
}

export function InventoryHealthCard({
  lowStockProducts,
}: InventoryHealthCardProps) {
  return (
    <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-amber-500" />
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
            Low Stock & Restock Alerts
          </h2>
        </div>
        <Link
          href="/admin/inventory"
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
        >
          <span>Manage</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="p-4 flex-1">
        {!lowStockProducts || lowStockProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Stock levels healthy
            </p>
            <p className="text-[11px] mt-0.5">
              All products currently have 4+ accounts in stock.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {p.category} • {formatMoney(p.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border ${
                      p.available === 0
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                    }`}
                  >
                    {p.available === 0 ? "OUT OF STOCK" : `${p.available} left`}
                  </span>

                  <Link
                    href="/admin/inventory"
                    className="px-2.5 py-1 text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-100 rounded-lg border border-sky-200/60 dark:border-sky-500/20 transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
