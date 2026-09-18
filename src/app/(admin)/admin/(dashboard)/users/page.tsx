"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  Pagination,
  UserRecord,
  UsersResponse,
  UsersSearchHeader,
  UsersTable,
  DeleteUserModal,
  UsersPagination,
} from "@/components/admin/users";

const PAGE_SIZE = 10;

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

  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        referralCode: user.referralCode,
        referredBy: user.referredBy
          ? {
              id: user.referredBy.id,
              name:
                `${user.referredBy.firstName || ""} ${user.referredBy.lastName || ""}`.trim() ||
                user.referredBy.userName,
              username: user.referredBy.userName,
            }
          : null,
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }
      toast.success(data.message || "User deleted successfully");
      setUserToDelete(null);
      fetchUsers(page, debouncedSearch);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting user");
    } finally {
      setDeleting(false);
    }
  };

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
      <UsersSearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onRefresh={handleRefresh}
        loading={loading}
        debouncedSearch={debouncedSearch}
        pagination={pagination}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        debouncedSearch={debouncedSearch}
        onSelectUserToDelete={(user) => setUserToDelete(user)}
      />

      {/* Pagination Footer */}
      <UsersPagination
        pagination={pagination}
        page={page}
        onPageChange={handlePageChange}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        userToDelete={userToDelete}
        deleting={deleting}
        onClose={() => setUserToDelete(null)}
        onConfirmDelete={handleDeleteUser}
      />
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
