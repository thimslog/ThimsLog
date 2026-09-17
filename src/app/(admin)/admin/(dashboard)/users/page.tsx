"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  RefreshCw,
  Wallet,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 10;

interface WalletInfo {
  balance: string | number;
  currency: string;
}

interface UserApiRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
  wallet?: WalletInfo | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: UserApiRecord[];
    pagination: Pagination;
  };
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  balance: number;
  currency: string;
  joinedAt: string;
  lastActive: string;
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

function UsersContent() {
  const { setPageTitle } = useAdminPage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial params
  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialSearch = searchParams.get("search") || "";

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core fetch function
  const fetchUsers = useCallback(async (targetPage: number, search: string) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(`/api/user/getAllUsers?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const data: UsersResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch users");
      }

      const mappedUsers: UserRecord[] = data.data.users.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.userName ||
          "Unnamed User",
        email: user.email,
        username: user.userName,
        phoneNumber: user.phoneNumber,
        balance:
          user.wallet?.balance !== undefined ? Number(user.wallet.balance) : 0,
        currency: user.wallet?.currency || "NGN",
        joinedAt: user.createdAt,
        lastActive: user.updatedAt || user.createdAt,
      }));

      setUsers(mappedUsers);
      setPagination(data.data.pagination);
      setPage(data.data.pagination.page);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Live debounce for typing in search input (350ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const clean = value.trim();
      setDebouncedSearch(clean);
      setPage(1);

      // Sync URL
      const params = new URLSearchParams();
      if (clean) params.set("search", clean);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });

      fetchUsers(1, clean);
    }, 350);
  };

  // Immediate search on Form Submit / Enter Key
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const clean = searchQuery.trim();
    setDebouncedSearch(clean);
    setPage(1);

    const params = new URLSearchParams();
    if (clean) params.set("search", clean);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });

    fetchUsers(1, clean);
  };

  // Clear search input
  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);

    router.replace(pathname, { scroll: false });
    fetchUsers(1, "");
  };

  // Handle Page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;

    setPage(newPage);

    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (debouncedSearch) params.set("search", debouncedSearch);

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });

    fetchUsers(newPage, debouncedSearch);
  };

  // Refresh current list
  const handleRefresh = () => {
    fetchUsers(page, debouncedSearch);
    toast.success("User list refreshed");
  };

  // Initial load
  useEffect(() => {
    fetchUsers(initialPage, initialSearch);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchUsers, initialPage, initialSearch]);

  // Update Page Title
  useEffect(() => {
    setPageTitle({
      title: "Users",
      subtitle: pagination
        ? `${pagination.total} registered customer${pagination.total === 1 ? "" : "s"}`
        : "Registered customers",
    });
  }, [setPageTitle, pagination]);

  return (
    <main className="space-y-4 p-6">
      {/* Error notification */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-400">
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="font-medium underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0b101b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Live Search Input Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md flex items-center"
        >
          <Search
            size={16}
            className="absolute left-3.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, @username or phone..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 dark:focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md cursor-pointer transition-colors"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Refresh & Action Controls */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh user list"
          >
            <RefreshCw
              size={14}
              className={`text-slate-500 dark:text-slate-400 ${loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Search Filter Badge */}
      {debouncedSearch && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Search results for{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{debouncedSearch}&rdquo;
              </strong>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Reset filter
            </button>
          </div>
          {pagination && (
            <span>{pagination.total} match{pagination.total === 1 ? "" : "es"} found</span>
          )}
        </div>
      )}

      {/* Users Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
              <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Wallet Balance</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-slate-100 dark:divide-white/5 text-xs transition-opacity duration-150 ${
                loading ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              {loading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-[13px] text-slate-400"
                  >
                    <div className="flex items-center justify-center gap-2.5">
                      <Loader2 size={18} className="animate-spin text-sky-600 dark:text-sky-400" />
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-[13px] text-slate-400 dark:text-slate-500"
                  >
                    {debouncedSearch
                      ? `No customers found matching "${debouncedSearch}"`
                      : "No users found in database."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Customer Name */}
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-2"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[160px]">{user.name}</span>
                      </Link>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300 text-[12px]">
                      {user.email}
                    </td>

                    {/* Username */}
                    <td className="px-5 py-3.5 font-mono text-sky-700 dark:text-sky-400 font-medium">
                      @{user.username}
                    </td>

                    {/* Wallet Balance */}
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[12px]">
                        <Wallet size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>{formatMoney(user.balance)}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(user.joinedAt)}
                    </td>

                    {/* Last Active */}
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(user.lastActive)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span> ({pagination.total} total customers)
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous button */}
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {/* Page number indicators */}
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

            {/* Next button */}
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Loader2 size={20} className="animate-spin text-sky-600 dark:text-sky-400" />
            <span>Loading customer directory...</span>
          </div>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
