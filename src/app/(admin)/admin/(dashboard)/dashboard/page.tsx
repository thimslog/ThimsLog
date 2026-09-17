"use client"

import { useEffect } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { useAdminPage } from "@/context/admin-page-context";

const statusMap = {
  in_stock: { label: "In stock", tone: "good" as const },
  low_stock: { label: "Low stock", tone: "warn" as const },
  out_of_stock: { label: "Out of stock", tone: "bad" as const },
};

const categoryLabel = {
  inventory: "Inventory",
  // vpn: "VPN",
  // textplus: "TextPlus",
};

export default function DashboardPage() {
  const { setPageTitle } = useAdminPage();

  useEffect(() => {
    setPageTitle({
      title: "Dashboard",
      subtitle: "Snapshot of sales, users and inventory",
    });
  }, [setPageTitle]);

  return (
    <>
      <main className="p-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dashboard stats */}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">
              Inventory snapshot
            </h2>
            <a
              href="/admin/inventory"
              className="text-[12.5px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              View catalog
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="px-5 py-3.5">Item</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                    No recent inventory events.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
