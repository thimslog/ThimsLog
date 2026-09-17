"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User as UserIcon,
  Wallet,
  Building2,
  Copy,
  Check,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { StatusPill } from "@/components/admin/status-pill";
import { toast } from "@/components/ui/toast";

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletDetail {
  id: string;
  balance: number;
  currency: string;
  paymonetraCustomer: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  virtualAccountReference: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TransactionDetail {
  id: string;
  walletId: string;
  type: string;
  status: string;
  amountRequested: number | string;
  amount: number | string | null;
  merchantReference: string;
  paymonetraReference?: string | null;
  collectionReference?: string | null;
  provider: string;
  metadata?: any;
  createdAt: string;
}

interface UserStats {
  totalTransactions: number;
  totalFunded: number;
  totalSpent: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

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
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);

  useEffect(() => {
    setPageTitle({
      title: "User Details",
      subtitle: "Full customer profile, wallet, and transaction history",
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
      setTransactions(data.data.transactions);
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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Back Button & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Users List
        </Link>

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
      </div>

      {/* User Information Profile Card & Virtual Account Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-sky-500/20 shrink-0">
              {user.firstName?.[0] || "U"}
              {user.lastName?.[0] || ""}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                @{user.userName || "user"}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Customer
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail size={13} /> Email
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <span className="truncate max-w-[170px]">{user.email}</span>
                <button
                  onClick={() => handleCopy(user.email, "email")}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "email" ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone size={13} /> Phone
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user.phoneNumber || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} /> Joined Date
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Virtual Account & Wallet Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs flex flex-col justify-between space-y-6">
          {/* Header & Balance Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-700 text-white shadow-md">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-sky-100">
                WALLET BALANCE
              </span>
              <p className="text-3xl sm:text-4xl font-black mt-0.5 select-none">
                {formatMoney(wallet?.balance || 0)}
              </p>
              <p className="text-xs text-sky-100/90 mt-1">
                Currency: <span className="font-bold text-white">{wallet?.currency || "NGN"}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <Wallet size={24} />
              </div>
            </div>
          </div>

          {/* Virtual Account Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Bank Provider</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {wallet?.bankName || "Wema Bank"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Account Number</span>
                {wallet?.accountNumber && (
                  <button
                    onClick={() => handleCopy(wallet.accountNumber!, "accountNum")}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "accountNum" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === "accountNum" ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
              <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
                {wallet?.accountNumber || "No account generated"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Account Name</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {wallet?.accountName || `${user.firstName} ${user.lastName}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Customer Gateway Reference</span>
              <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
                {wallet?.paymonetraCustomer || `wallet_${user.id}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Funded */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Deposits
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatMoney(stats?.totalFunded || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Lifetime funded volume</p>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatMoney(stats?.totalSpent || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Payments &amp; purchases</p>
        </div>

        {/* Successful Operations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Successful
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {stats?.successCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Completed transactions</p>
        </div>

        {/* Pending Queries */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {stats?.pendingCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Awaiting gateway verification</p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transaction History ({transactions.length})
              </h3>
              <p className="text-xs text-slate-400">
                All funding, payments, and settlements for this user
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchUserDetails}
            className="p-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Merchant Reference</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No transactions recorded for this user yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPending = tx.status === "PENDING";
                  const isVerifying = verifyingId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              tx.type === "FUNDING"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                                : tx.type === "PAYMENT"
                                ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                            }`}
                          >
                            {tx.type === "FUNDING" ? (
                              <ArrowDownLeft size={14} />
                            ) : tx.type === "PAYMENT" ? (
                              <ArrowUpRight size={14} />
                            ) : (
                              <RotateCcw size={14} />
                            )}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {tx.type}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatMoney(tx.amount || tx.amountRequested)}
                        </p>
                        {tx.amount && tx.amount !== tx.amountRequested && (
                          <p className="text-[11px] text-slate-400">
                            Req: {formatMoney(tx.amountRequested)}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusPill
                          label={tx.status}
                          tone={getToneForStatus(tx.status)}
                        />
                      </td>

                      {/* Reference */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                          <span className="truncate max-w-[140px]">
                            {tx.merchantReference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.merchantReference, tx.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {copiedKey === tx.id ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleQueryTransaction(tx.id)}
                              disabled={isVerifying}
                              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
                              title="Query status from Paymonetra"
                            >
                              <RefreshCw
                                size={12}
                                className={isVerifying ? "animate-spin" : ""}
                              />
                              <span>{isVerifying ? "Checking..." : "Query"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400">
                  Amount
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatMoney(selectedTx.amount || selectedTx.amountRequested)}
                </p>
              </div>
              <StatusPill
                label={selectedTx.status}
                tone={getToneForStatus(selectedTx.status)}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {selectedTx.type}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Merchant Reference</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {selectedTx.merchantReference}
                </span>
              </div>
              {selectedTx.paymonetraReference && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Gateway Reference</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">
                    {selectedTx.paymonetraReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Created Date</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(selectedTx.createdAt)}
                </span>
              </div>
            </div>

            {selectedTx.metadata && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Metadata
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36">
                  {JSON.stringify(selectedTx.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
