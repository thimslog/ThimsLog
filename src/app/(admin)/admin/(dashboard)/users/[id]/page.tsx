"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Receipt,
  Package,
  Search,
  Trash2,
} from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  UserDetail,
  WalletDetail,
  TransactionDetail,
  OrderDetail,
  UserStats,
  UserProfileCard,
  UserWalletCard,
  UserStatsCards,
  UserTransactionsTable,
  UserOrdersTable,
  UserOrderDetailModal,
  UserTransactionModal,
  UserDeleteModal,
} from "@/components/admin/user-detail";

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SingleUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { setPageTitle } = useAdminPage();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active Tab: 'transactions' | 'orders'
  const [activeTab, setActiveTab] = useState<"transactions" | "orders">("transactions");
  const [tableSearch, setTableSearch] = useState("");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }
      toast.success(data.message || "User deleted successfully");
      router.push("/admin/users");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setPageTitle({
      title: "User Details",
      subtitle: "Full customer profile, wallet, transactions, and order history",
    });
  }, [setPageTitle]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/users/${id}`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load user details");
      }

      setUser(data.data.user);
      setWallet(data.data.wallet);
      setTransactions(data.data.transactions || []);
      setOrders(data.data.orders || []);
      setStats(data.data.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load user details");
      toast.error(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQueryTransaction = async (txId: string) => {
    setVerifyingId(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/verify`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to query transaction");
      }

      if (data.updated) {
        toast.success(data.message || "Transaction verified & updated!");
      } else {
        toast.info(data.message || "Transaction is still pending on gateway.");
      }

      await fetchUserDetails();
    } catch (err: any) {
      toast.error(err.message || "Error querying transaction");
    } finally {
      setVerifyingId(null);
    }
  };

  const getToneForStatus = (status: string): "good" | "warn" | "bad" | "neutral" => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
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

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      tx.merchantReference.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q) ||
      tx.status.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q)
    );
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    const titleMatch = o.accountType?.name?.toLowerCase().includes(q);
    const catMatch = o.accountType?.category?.toLowerCase().includes(q);
    const idMatch = o.id.toLowerCase().includes(q);
    const accMatch = o.accounts.some(
      (a) =>
        a.username?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q)
    );
    return titleMatch || catMatch || idMatch || accMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="animate-spin text-sky-600" size={24} />
          <span className="text-sm font-medium">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 space-y-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
        <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <p className="font-bold">Error loading user</p>
          <p className="mt-1">{error || "User could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Back Button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-2xs transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Users List
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>ID:</span>
            <span className="text-slate-700 dark:text-slate-300 select-all font-semibold">
              {user.id}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(user.id, "userId")}
              className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy user ID"
            >
              {copiedKey === "userId" ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete User</span>
          </button>
        </div>
      </div>

      {/* Profile & Wallet Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserProfileCard
          user={user}
          copiedKey={copiedKey}
          onCopy={handleCopy}
          formatDate={formatDate}
        />
        <UserWalletCard
          user={user}
          wallet={wallet}
          copiedKey={copiedKey}
          onCopy={handleCopy}
          formatMoney={formatMoney}
        />
      </div>

      {/* Financial Metrics Row */}
      <UserStatsCards
        stats={stats}
        ordersCount={orders.length}
        formatMoney={formatMoney}
      />

      {/* Scrollable Data Tables Section with Tabs */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
        {/* Navigation Tabs Header & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "transactions"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Receipt size={14} />
              <span>Transactions</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "transactions"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Package size={14} />
              <span>Order History</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "orders"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                {orders.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={
                  activeTab === "transactions"
                    ? "Filter transactions..."
                    : "Filter orders or accounts..."
                }
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <button
              type="button"
              onClick={fetchUserDetails}
              className="p-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Refresh data"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Tab 1: Transactions Table */}
        {activeTab === "transactions" && (
          <UserTransactionsTable
            transactions={filteredTransactions}
            verifyingId={verifyingId}
            copiedKey={copiedKey}
            onCopy={handleCopy}
            onQueryTransaction={handleQueryTransaction}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            formatMoney={formatMoney}
            formatDate={formatDate}
            getToneForStatus={getToneForStatus}
          />
        )}

        {/* Tab 2: Orders Table */}
        {activeTab === "orders" && (
          <UserOrdersTable
            orders={filteredOrders}
            copiedKey={copiedKey}
            onCopy={handleCopy}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            formatMoney={formatMoney}
            formatDate={formatDate}
            getToneForStatus={getToneForStatus}
          />
        )}
      </div>

      {/* Modals */}
      <UserOrderDetailModal
        selectedOrder={selectedOrder}
        copiedKey={copiedKey}
        onClose={() => setSelectedOrder(null)}
        onCopy={handleCopy}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />

      <UserTransactionModal
        selectedTx={selectedTx}
        onClose={() => setSelectedTx(null)}
        formatMoney={formatMoney}
        formatDate={formatDate}
        getToneForStatus={getToneForStatus}
      />

      <UserDeleteModal
        isOpen={showDeleteModal}
        user={user}
        wallet={wallet}
        deleting={deleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleDeleteUser}
        formatMoney={formatMoney}
      />
    </div>
  );
}
