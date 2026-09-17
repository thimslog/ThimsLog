"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  LifeBuoy,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Layers,
  ArrowRight,
  Loader2,
  Mail,
  Check,
} from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";

interface DashboardData {
  financials: {
    totalSettledRevenue: number;
    totalWalletLiability: number;
    pendingTransactionsCount: number;
    pendingTransactionsVolume: number;
    successCount: number;
    allTransactionsCount: number;
  };
  sales: {
    totalOrdersCount: number;
    totalSalesVolume: number;
    accountsSold: number;
    accountsAvailable: number;
    totalInventory: number;
  };
  users: {
    totalUsers: number;
    newUsersThisWeek: number;
  };
  support: {
    openTicketsCount: number;
    urgentTicketsCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    available: number;
  }>;
  recentOrders: Array<{
    id: string;
    productName: string;
    categoryName: string;
    buyerName: string;
    buyerEmail: string;
    quantity: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    type: "FUNDING" | "PAYMENT" | "REFUND";
    status: "PENDING" | "SUCCESS" | "FAILED" | "UNDERPAID" | "OVERPAID" | "EXPIRED";
    amountRequested: number;
    amount: number | null;
    merchantReference: string;
    createdAt: string;
  }>;
  recentTickets: Array<{
    id: string;
    subject: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    customerName: string;
    customerEmail: string;
    createdAt: string;
  }>;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminDashboardPage() {
  const { setPageTitle } = useAdminPage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (showToast) toast.success("Dashboard metrics refreshed");
      } else {
        toast.error(json.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPageTitle({
      title: "Dashboard Overview",
      subtitle: "Live telemetry, revenue, inventory health, and operations",
    });
    fetchDashboardData();
  }, [setPageTitle, fetchDashboardData]);

  const handleQueryTransaction = async (txId: string) => {
    setVerifyingId(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/verify`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.updated) {
        toast.success(result.message || "Transaction settled successfully!");
      } else {
        toast.info(result.message || "Gateway reported transaction still pending.");
      }
      fetchDashboardData();
    } catch {
      toast.error("Error verifying payment with gateway");
    } finally {
      setVerifyingId(null);
    }
  };

  const getToneForStatus = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "good";
      case "PENDING":
        return "warn";
      case "FAILED":
      case "EXPIRED":
        return "bad";
      default:
        return "neutral";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      case "HIGH":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "MEDIUM":
        return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20";
      default:
        return "bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-slate-200 dark:border-white/10";
    }
  };

  return (
    <main className="p-6 space-y-6 font-sans">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b101b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            System Live Telemetry
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-400 font-normal">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardData(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 1. TOP KPI METRICS CARDS                                                */}
      {/* ======================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Settled Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settled Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMoney(data?.financials.totalSettledRevenue || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {data?.financials.successCount ?? 0}
              </span>{" "}
              settled gateway deposits
            </p>
          </div>
        </div>

        {/* Customer Wallet Float */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              User Wallet Float
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {formatMoney(data?.financials.totalWalletLiability || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              Across <span className="font-semibold text-slate-900 dark:text-white">{data?.users.totalUsers ?? 0}</span> registered users
            </p>
          </div>
        </div>

        {/* Available Inventory vs Sold */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Available Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data?.sales.accountsAvailable ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-slate-900 dark:text-white">{data?.sales.accountsSold ?? 0}</span> accounts sold to date
            </p>
          </div>
        </div>

        {/* Action Required: Pending Queries & Open Tickets */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Actions Required
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {(data?.financials.pendingTransactionsCount ?? 0) + (data?.support.openTicketsCount ?? 0)}
              </h3>
              <span className="text-xs text-slate-400 font-medium">pending items</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{data?.financials.pendingTransactionsCount ?? 0} queryable tx</span>
              <span>•</span>
              <span>{data?.support.openTicketsCount ?? 0} open tickets</span>
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. RECENT ORDERS (60%) & LOW STOCK RESTOCK ALERTS (40%)                 */}
      {/* ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Delivered */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-sky-600 dark:text-sky-400" />
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Recent Customer Orders
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {data?.sales.totalOrdersCount ?? 0} total sales
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
                ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No customer orders completed yet.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                        <div className="truncate max-w-[170px]">{ord.productName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{ord.categoryName}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                          {ord.buyerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {ord.buyerEmail}
                        </div>
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

        {/* Low Stock & Restock Alert */}
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
            {!data?.lowStockProducts || data.lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Stock levels healthy</p>
                <p className="text-[11px] mt-0.5">All products currently have 4+ accounts in stock.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.lowStockProducts.map((p) => (
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
      </section>

      {/* ======================================================================= */}
      {/* 3. RECENT TRANSACTIONS & URGENT SUPPORT TICKETS QUEUE                    */}
      {/* ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Transactions & Payment Queries */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Recent Gateway Transactions
              </h2>
            </div>
            <Link
              href="/admin/transactions"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View All Transactions</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin text-sky-600" />
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No recent transactions logged.
                    </td>
                  </tr>
                ) : (
                  data.recentTransactions.map((tx) => {
                    const isPending = tx.status === "PENDING";
                    const isVerifying = verifyingId === tx.id;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {tx.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {tx.customerEmail}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {formatMoney(tx.amountRequested)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill label={tx.status} tone={getToneForStatus(tx.status)} />
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleQueryTransaction(tx.id)}
                              disabled={isVerifying}
                              className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
                            >
                              <RefreshCw size={11} className={isVerifying ? "animate-spin" : ""} />
                              <span>{isVerifying ? "Querying..." : "Query"}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDate(tx.createdAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Tickets Queue */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <LifeBuoy size={16} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Support Tickets Queue
              </h2>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View All ({data?.support.openTicketsCount ?? 0})</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {!data?.recentTickets || data.recentTickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Support queue clear</p>
                <p className="text-[11px] mt-0.5">No open tickets awaiting response.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.recentTickets.map((t) => (
                  <Link
                    key={t.id}
                    href="/admin/tickets"
                    className="block p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs truncate group-hover:text-sky-600 transition-colors">
                        {t.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{t.customerName}</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
