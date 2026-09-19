"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import {
  OrderItem,
  OrderHistoryHeader,
  OrderCard,
} from "@/components/dashboard/order-history";

export default function OrderHistoryPage() {
  const [search, setSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // React Query for User Orders
  const { data: ordersData, isLoading: loading } = useQuery({
    queryKey: ["inventory", "user", "orders"],
    queryFn: () => apiGet<{ success: boolean; data: OrderItem[] }>("/api/inventory/user/orders"),
    staleTime: 30 * 1000,
  });

  const orders = ordersData?.data || [];

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyWithFeedback = (text: string, label: string, keyId?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
    toast.success(`${label} copied to clipboard`);
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const typeMatch = o.accountType?.name?.toLowerCase().includes(q);
    const idMatch = o.id.toLowerCase().includes(q);
    const accMatch = o.accounts.some(
      (a) =>
        a.username?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q)
    );
    return typeMatch || idMatch || accMatch;
  });

  return (
    <div className="max-w-6xl mx-auto py-2 font-sans">
      {/* Header */}
      <OrderHistoryHeader
        ordersCount={orders.length}
        filteredOrders={filteredOrders}
        search={search}
        setSearch={setSearch}
      />

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-sky-600 dark:text-sky-400 animate-spin" />
          <p className="text-xs font-normal text-slate-400">Loading your purchase history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-2xs">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Orders Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-normal">
            {search
              ? `No orders matched "${search}"`
              : "You have not purchased any social accounts yet. Browse the catalog to get started."}
          </p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={
                expandedOrders[order.id] !== undefined
                  ? expandedOrders[order.id]
                  : idx === 0 // expand first order by default
              }
              onToggleExpand={() => toggleExpand(order.id)}
              copiedKey={copiedKey}
              copyWithFeedback={copyWithFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
