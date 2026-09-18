"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  TransactionRecord,
  Metrics,
  Pagination,
  TransactionMetricsCards,
  TransactionFilters,
  TransactionTable,
  TransactionPagination,
  TransactionDetailsModal,
  SyncPaymentModal,
} from "@/components/admin/transactions";

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

  // Verification & Feedback State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "warn" | "error";
    message: string;
  } | null>(null);

  // Modals & Clipboard State
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
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

  // Handle browser Back / Forward history
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

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Stat Cards */}
      <TransactionMetricsCards metrics={metrics} />

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

      {/* Error state */}
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
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        onOpenSyncModal={() => setShowSyncModal(true)}
        onRefresh={handleRefresh}
        loading={loading}
        appliedSearch={appliedSearch}
        totalTransactions={pagination?.total}
      />

      {/* Transactions Table & Pagination Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
        <TransactionTable
          transactions={transactions}
          loading={loading}
          verifyingId={verifyingId}
          copiedRef={copiedRef}
          onCopy={handleCopy}
          onQueryTransaction={handleQueryTransaction}
          onSelectTransaction={(tx) => setSelectedTx(tx)}
        />

        {pagination && (
          <TransactionPagination
            pagination={pagination}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onQueryTransaction={handleQueryTransaction}
        verifyingId={verifyingId}
      />

      {/* Sync Paymonetra Transfer Modal */}
      <SyncPaymentModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSuccess={() => fetchTransactions(page, statusFilter, typeFilter, appliedSearch)}
      />
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
