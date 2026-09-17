"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Loader2,
} from "lucide-react";

import { StatusPill } from "@/components/admin/status-pill";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";

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
  type: "FUNDING" | "PAYMENT" | "REFUND" | "TRANSFER_SENT" | "TRANSFER_RECEIVED" | string;
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
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AdminTransactionsContent() {
  const { setPageTitle } = useAdminPage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialStatus = searchParams.get("status") || "ALL";
  const initialType = searchParams.get("type") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedKeyRef = useRef<string>("");

  // Requerying state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "warn" | "error";
    message: string;
  } | null>(null);

  // Selected for modal
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Core fetch transactions function
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
        if (search.trim()) params.append("search", search.trim());

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

  // Initial load
  useEffect(() => {
    fetchTransactions(initialPage, initialStatus, initialType, initialSearch);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchTransactions, initialPage, initialStatus, initialType, initialSearch]);

  // Handle browser Back / Forward history buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const p = Math.max(Number(urlParams.get("page")) || 1, 1);
      const s = urlParams.get("status") || "ALL";
      const t = urlParams.get("type") || "ALL";
      const q = urlParams.get("search") || "";

      setPage(p);
      setStatusFilter(s);
      setTypeFilter(t);
      setAppliedSearch(q);
      setSearchQuery(q);
      fetchTransactions(p, s, t, q);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchTransactions]);

  useEffect(() => {
    setPageTitle({
      title: "Transactions",
      subtitle: pagination
        ? `${pagination.total} transactions found`
        : "Manage and query payments",
    });
  }, [setPageTitle, pagination]);

  const updateUrl = (
    newPage: number,
    newStatus: string,
    newType: string,
    newSearch: string,
    replace = false
  ) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (newStatus !== "ALL") params.set("status", newStatus);
    if (newType !== "ALL") params.set("type", newType);
    if (newSearch.trim()) params.set("search", newSearch.trim());

    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}`;
    if (replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    updateUrl(newPage, statusFilter, typeFilter, appliedSearch);
    fetchTransactions(newPage, statusFilter, typeFilter, appliedSearch);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    updateUrl(1, newStatus, typeFilter, appliedSearch);
    fetchTransactions(1, newStatus, typeFilter, appliedSearch);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    setPage(1);
    updateUrl(1, statusFilter, newType, appliedSearch);
    fetchTransactions(1, statusFilter, newType, appliedSearch);
  };

  // Live search debounce (350ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const clean = value.trim();
      setAppliedSearch(clean);
      setPage(1);
      updateUrl(1, statusFilter, typeFilter, clean, true);
      fetchTransactions(1, statusFilter, typeFilter, clean);
    }, 350);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const clean = searchQuery.trim();
    setAppliedSearch(clean);
    setPage(1);
    updateUrl(1, statusFilter, typeFilter, clean);
    fetchTransactions(1, statusFilter, typeFilter, clean);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery("");
    setAppliedSearch("");
    setPage(1);
    updateUrl(1, statusFilter, typeFilter, "");
    fetchTransactions(1, statusFilter, typeFilter, "");
  };

  const handleRefresh = () => {
    fetchTransactions(page, statusFilter, typeFilter, appliedSearch);
    toast.success("Transactions refreshed");
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
        const msg = data.message || "Transaction status updated successfully!";
        setActionFeedback({ type: "success", message: msg });
        toast.success(msg);
      } else {
        const msg = data.message || "Transaction was queried. Gateway reported it is still pending.";
        setActionFeedback({ type: "warn", message: msg });
        toast.info(msg);
      }

      // Refresh list and modal
      await fetchTransactions(page, statusFilter, typeFilter, appliedSearch);

      if (selectedTx && selectedTx.id === txId && data.transaction) {
        setSelectedTx(data.transaction);
      }
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "An error occurred while querying payment";
      setActionFeedback({ type: "error", message: errMsg });
      toast.error(errMsg);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    toast.success("Copied to clipboard!");
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
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Settled Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMoney(metrics?.totalSuccessVolume || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics?.successCount ?? 0} completed payments
            </p>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Queries
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics?.pendingCount ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requires query or settlement
            </p>
          </div>
        </div>

        {/* Successful Transactions */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Successful
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.successCount ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Confirmed transactions
            </p>
          </div>
        </div>

        {/* Total Count */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.totalCountAll ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all users & types
            </p>
          </div>
        </div>
      </div>

      {/* Action Alerts / Feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : actionFeedback.type === "warn"
              ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300"
              : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === "success" && (
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {actionFeedback.type === "warn" && (
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            {actionFeedback.type === "error" && (
              <XCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          <span>{error}</span>
          <button
            onClick={() => fetchTransactions(page, statusFilter, typeFilter, appliedSearch)}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#0b101b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by Reference, User Email, Name..."
            className="w-full pl-10 pr-20 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by transaction status"
            className="bg-slate-50 dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Queryable)</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            aria-label="Filter by transaction type"
            className="bg-slate-50 dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-600 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="FUNDING">Funding</option>
            <option value="PAYMENT">Payment</option>
            <option value="TRANSFER_SENT">Transfer Sent</option>
            <option value="TRANSFER_RECEIVED">Transfer Received</option>
            <option value="REFUND">Refund</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Transactions"
            className="px-3.5 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Search Filter Pill */}
      {appliedSearch && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Search results for{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{appliedSearch}&rdquo;
              </strong>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Clear filter
            </button>
          </div>
          {pagination && (
            <span>{pagination.total} transactions found</span>
          )}
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Customer / User</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Merchant Ref</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-slate-100 dark:divide-white/5 text-xs transition-opacity duration-150 ${
                loading ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-sky-600" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    No transactions found matching criteria.
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
                      className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        {user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {user.firstName?.[0] || "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-[11.5px] text-slate-400 truncate max-w-[140px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {tx.type === "FUNDING" && (
                            <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
                          )}
                          {tx.type === "PAYMENT" && (
                            <ArrowUpRight size={14} className="text-sky-500 shrink-0" />
                          )}
                          {tx.type === "TRANSFER_SENT" && (
                            <ArrowUpRight size={14} className="text-rose-500 shrink-0" />
                          )}
                          {tx.type === "TRANSFER_RECEIVED" && (
                            <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
                          )}
                          {tx.type === "REFUND" && (
                            <RotateCcw size={14} className="text-amber-500 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {tx.type === "TRANSFER_SENT"
                              ? "Transfer Out"
                              : tx.type === "TRANSFER_RECEIVED"
                              ? "Transfer In"
                              : tx.type}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-mono font-semibold">
                        <div className="text-slate-900 dark:text-white">
                          {formatMoney(tx.amountRequested)}
                        </div>
                        {tx.amount && Number(tx.amount) !== Number(tx.amountRequested) && (
                          <div className="text-[11px] text-slate-400">
                            Paid: {formatMoney(tx.amount)}
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
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                            {tx.merchantReference}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(tx.merchantReference, tx.id)
                            }
                            title="Copy Reference"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
                          >
                            {copiedRef === tx.id ? (
                              <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
                              className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
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
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span> (
              {pagination.total} total transactions)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => handlePageChange(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              {/* Numbered page buttons */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && pageNum - prev > 1;

                    return (
                      <div key={pageNum} className="flex items-center">
                        {hasGap && (
                          <span className="px-1 text-slate-400 text-xs select-none">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-7 min-w-[28px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            pageNum === page
                              ? "bg-sky-600 text-white font-bold shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <StatusPill
                  label={selectedTx.status}
                  tone={getToneForStatus(selectedTx.status)}
                />
                <span className="text-xs font-mono font-bold text-slate-500">
                  {selectedTx.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-4 text-xs">
              {/* Amount Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold">
                    Amount Requested
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {formatMoney(selectedTx.amountRequested)}
                  </span>
                </div>

                {selectedTx.amount && (
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">
                      Settled Amount
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatMoney(selectedTx.amount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer details */}
              <div className="space-y-2 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0b101b]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Customer Information
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedTx.wallet?.user?.firstName}{" "}
                      {selectedTx.wallet?.user?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Username</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400">
                      @{selectedTx.wallet?.user?.userName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                      {selectedTx.wallet?.user?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Wallet Balance</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(selectedTx.wallet?.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Merchant Reference</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedTx.merchantReference}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          selectedTx.merchantReference,
                          "modal-merchant-ref"
                        )
                      }
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {selectedTx.paymonetraReference && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-400">Paymonetra Reference</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-800 dark:text-slate-200">
                        {selectedTx.paymonetraReference}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            selectedTx.paymonetraReference!,
                            "modal-paymonetra-ref"
                          )
                        }
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {selectedTx.collectionReference && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-400">Collection Reference</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-800 dark:text-slate-200">
                        {selectedTx.collectionReference}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-400">Provider Gateway</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTx.provider || "PAYMONETRA"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Created At</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">
                    {formatDate(selectedTx.createdAt)}
                  </span>
                </div>
              </div>

              {/* Raw Gateway Metadata */}
              {selectedTx.metadata && (
                <div className="mt-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Gateway Raw Metadata
                  </span>
                  <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl text-[11px] overflow-x-auto max-h-40 font-mono border border-slate-800 dark:border-white/10">
                    {JSON.stringify(selectedTx.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer / Query action if pending */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
              {selectedTx.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleQueryTransaction(selectedTx.id)}
                  disabled={verifyingId === selectedTx.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
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
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Status settled as {selectedTx.status}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
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

export default function AdminTransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={20} className="animate-spin text-sky-600" />
            <span>Loading transactions dashboard...</span>
          </div>
        </div>
      }
    >
      <AdminTransactionsContent />
    </Suspense>
  );
}
