"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Search,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Calendar,
} from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

interface PurchasedAccount {
  id: string;
  name?: string | null;
  username: string;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  notes?: string | null;
  loginInstructions?: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  accountType: {
    id: string;
    name: string;
    category?: string;
  } | null;
  accounts: PurchasedAccount[];
}

const formatNaira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/user/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
        // Expand the first order by default
        if (json.data.length > 0) {
          setExpandedOrders({ [json.data[0].id]: true });
        }
      } else {
        toast.error(json.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const copyAllOrderCredentials = (order: OrderItem) => {
    const lines = order.accounts.map((acc) => {
      const parts = [
        acc.username || acc.id,
        acc.loginInstructions || "",
        acc.notes || "",
      ].filter(Boolean);
      return parts.join(" | ");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success(`Copied credentials for ${order.accounts.length} account(s)`);
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const typeMatch = o.accountType?.name?.toLowerCase().includes(q);
    const idMatch = o.id.toLowerCase().includes(q);
    const accMatch = o.accounts.some(
      (a) =>
        a.username?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q)
    );
    return typeMatch || idMatch || accMatch;
  });

  return (
    <div className="max-w-6xl mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Access credentials, login details, and receipts for all purchased accounts.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search orders or accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-normal"
          />
        </div>
      </div>

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
            You have not purchased any social accounts yet. Browse the catalog to get started.
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
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            const title = order.accountType?.name || "Social Account Pack";

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0b101b] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xs transition-all"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <PlatformIcon
                      name={title}
                      size={18}
                      className="w-10 h-10 rounded-xl shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {title}
                        </h3>
                        <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 px-2 py-0.5 rounded-md">
                          {order.quantity} pcs
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-normal">
                        <span className="font-mono">ID: {order.id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                        Total Paid
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatNaira(order.totalAmount)}
                      </span>
                    </div>

                    <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Delivered Accounts ({order.accounts.length})
                      </span>
                      <button
                        onClick={() => copyAllOrderCredentials(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 border border-sky-200/60 dark:border-sky-500/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Copy size={13} /> Copy All Credentials
                      </button>
                    </div>

                    <div className="space-y-3 mt-2">
                      {order.accounts.map((acc, idx) => (
                        <div
                          key={acc.id || idx}
                          className="bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 rounded-xl p-4 text-xs space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="font-normal text-slate-400 text-xs">
                                #{idx + 1}
                              </span>
                              <span className="font-mono font-medium text-sky-600 dark:text-sky-400">
                                {acc.username || acc.name || acc.id}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                copyText(
                                  `${acc.username || acc.id} | ${acc.loginInstructions || ""} | ${acc.notes || ""}`,
                                  "Account details"
                                )
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy row"
                            >
                              <Copy size={13} />
                            </button>
                          </div>

                          {acc.loginInstructions && (
                            <div className="pt-1">
                              <span className="text-slate-400 text-[11px] uppercase font-medium block mb-1">
                                Login Format / Credentials:
                              </span>
                              <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all border border-slate-100 dark:border-white/5">
                                {acc.loginInstructions}
                              </div>
                            </div>
                          )}

                          {acc.notes && (
                            <div className="pt-1">
                              <span className="text-slate-400 text-[11px] uppercase font-medium block mb-0.5">
                                Notes & Instructions:
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 text-xs font-normal leading-relaxed">
                                {acc.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
