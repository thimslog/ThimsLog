"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Copy,
  Check,
  X,
  Wallet,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { StatusPill } from "@/components/admin/status-pill";
import { useAdminPage } from "@/context/admin-page-context";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userName?: string;
}

interface TransactionRecord {
  id: string;
  walletId: string;
  type: "FUNDING" | "PAYMENT" | "REFUND";
  status: "PENDING" | "SUCCESS" | "FAILED" | "UNDERPAID" | "OVERPAID" | "EXPIRED";
  amountRequested: string | number;
  amount: string | number | null;
  merchantReference: string;
  paymonetraReference?: string | null;
  collectionReference?: string | null;
  provider: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  wallet: {
    user: UserInfo;
    balance?: string | number;
  };
}

interface Metrics {
  totalCountAll: number;
  totalSuccessVolume: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTransactionsPage() {
  const { setPageTitle } = useAdminPage();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Requerying state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "warn" | "error";
    message: string;
  } | null>(null);

  // Selected for modal
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (
      requestedPage = page,
      status = statusFilter,
      type = typeFilter,
      search = appliedSearch
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: "15",
        });

        if (status !== "ALL") params.append("status", status);
        if (type !== "ALL") params.append("type", type);
        if (search) params.append("search", search);

        const res = await fetch(`/api/admin/transactions?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Failed to fetch transactions");
        }

        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
        setMetrics(data.data.metrics);
        setPage(data.data.pagination.page);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, typeFilter, appliedSearch]
  );

  useEffect(() => {
    fetchTransactions(1, statusFilter, typeFilter, appliedSearch);
  }, [statusFilter, typeFilter, appliedSearch]);

  useEffect(() => {
    setPageTitle({
      title: "Transactions",
      subtitle: pagination
        ? `${pagination.total} transactions found`
        : "Manage and query payments",
    });
  }, [setPageTitle, pagination]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  const handleQueryTransaction = async (txId: string) => {
    setVerifyingId(txId);
    setActionFeedback(null);

    try {
      const res = await fetch(`/api/admin/transactions/${txId}/verify`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to query transaction");
      }

      if (data.updated) {
        setActionFeedback({
          type: "success",
          message: data.message || "Transaction status updated successfully!",
        });
      } else {
        setActionFeedback({
          type: "warn",
          message:
            data.message ||
            "Transaction was queried. Gateway reported it is still pending.",
        });
      }

      // Refresh list and modal
      await fetchTransactions(page, statusFilter, typeFilter, appliedSearch);

      if (selectedTx && selectedTx.id === txId && data.transaction) {
        setSelectedTx(data.transaction);
      }
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "An error occurred while querying payment",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    setTimeout(() => setCopiedRef(null), 2000);
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

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Settled Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatMoney(metrics?.totalSuccessVolume || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {metrics?.successCount ?? 0} completed payments
            </p>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending Queries
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-600">
              {metrics?.pendingCount ?? 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Requires query or settlement
            </p>
          </div>
        </div>

        {/* Successful Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Successful
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {metrics?.successCount ?? 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Successful operations</p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Recorded
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {metrics?.totalCountAll ?? 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Across all users & types
            </p>
          </div>
        </div>
      </div>

      {/* Action Alerts / Feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : actionFeedback.type === "warn"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === "success" && (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            )}
            {actionFeedback.type === "warn" && (
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            )}
            {actionFeedback.type === "error" && (
              <XCircle size={18} className="text-red-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            onClick={() => fetchTransactions(page)}
            className="font-semibold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference, User Email, Name..."
            className="w-full pl-10 pr-20 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-sky-700 text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-sky-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Queryable)</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="FUNDING">Funding</option>
            <option value="PAYMENT">Payment</option>
            <option value="REFUND">Refund</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() =>
              fetchTransactions(page, statusFilter, typeFilter, appliedSearch)
            }
            title="Refresh Transactions"
            className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-sky-700" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Merchant Ref</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-sky-700" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const user = tx.wallet?.user;
                  const isPending = tx.status === "PENDING";
                  const isVerifying = verifyingId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {user?.firstName?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          {tx.type === "FUNDING" ? (
                            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                              <ArrowDownLeft size={14} />
                            </span>
                          ) : tx.type === "PAYMENT" ? (
                            <span className="p-1 rounded bg-sky-50 text-sky-600">
                              <ArrowUpRight size={14} />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-amber-50 text-amber-600">
                              <RotateCcw size={14} />
                            </span>
                          )}
                          <span>{tx.type}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {formatMoney(tx.amount || tx.amountRequested)}
                        </div>
                        {tx.amount && tx.amount !== tx.amountRequested && (
                          <div className="text-[11px] text-slate-400">
                            Req: {formatMoney(tx.amountRequested)}
                          </div>
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-600 truncate max-w-[140px]">
                            {tx.merchantReference}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(tx.merchantReference, tx.id)
                            }
                            title="Copy Reference"
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {copiedRef === tx.id ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
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
                              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer disabled:opacity-60"
                              title="Query status from Paymontera"
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View full details"
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

        {/* Pagination Footer */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-900">{pagination.page}</span> of{" "}
              <span className="font-semibold text-slate-900">{pagination.totalPages}</span> (
              {pagination.total} total)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  fetchTransactions(
                    page - 1,
                    statusFilter,
                    typeFilter,
                    appliedSearch
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  fetchTransactions(
                    page + 1,
                    statusFilter,
                    typeFilter,
                    appliedSearch
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150 backdrop-blur-xs"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Transaction Details
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedTx.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500">
                  Settled Amount
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatMoney(selectedTx.amount || selectedTx.amountRequested)}
                </p>
                {selectedTx.amount && (
                  <p className="text-xs text-slate-400">
                    Amount Requested: {formatMoney(selectedTx.amountRequested)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <StatusPill
                  label={selectedTx.status}
                  tone={getToneForStatus(selectedTx.status)}
                />
                <p className="text-xs font-semibold text-slate-500 mt-2 uppercase">
                  {selectedTx.type}
                </p>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <UserIcon size={14} />
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Name:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedTx.wallet?.user?.firstName}{" "}
                      {selectedTx.wallet?.user?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{" "}
                    <span className="font-semibold text-slate-800 truncate">
                      {selectedTx.wallet?.user?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedTx.wallet?.user?.phoneNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Username:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      @{selectedTx.wallet?.user?.userName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gateway References */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedTx.provider || "paymonetra"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Merchant Reference</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedTx.merchantReference}
                  </span>
                </div>

                {selectedTx.paymonetraReference && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Paymonetra Reference</span>
                    <span className="font-mono font-medium text-slate-900">
                      {selectedTx.paymonetraReference}
                    </span>
                  </div>
                )}

                {selectedTx.collectionReference && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Collection Reference</span>
                    <span className="font-mono font-medium text-slate-900">
                      {selectedTx.collectionReference}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Created At</span>
                  <span className="text-slate-700">
                    {formatDate(selectedTx.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-700">
                    {formatDate(selectedTx.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Raw Gateway Metadata (if available) */}
              {selectedTx.metadata && (
                <div className="mt-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Gateway Raw Metadata
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] overflow-x-auto max-h-40 font-mono">
                    {JSON.stringify(selectedTx.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer / Query action if pending */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedTx.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleQueryTransaction(selectedTx.id)}
                  disabled={verifyingId === selectedTx.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw
                    size={14}
                    className={
                      verifyingId === selectedTx.id ? "animate-spin" : ""
                    }
                  />
                  <span>
                    {verifyingId === selectedTx.id
                      ? "Querying Gateway..."
                      : "Query Payment from Paymonetra"}
                  </span>
                </button>
              ) : (
                <div className="text-xs text-slate-400">
                  Status settled as {selectedTx.status}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
