"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
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
  const queryClient = useQueryClient();

  // Read initial params
  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (debouncedSearch.trim()) {
    queryParams.append("search", debouncedSearch.trim());
  }

  const {
    data: rawData,
    isLoading: loading,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", page, debouncedSearch],
    queryFn: () =>
      apiGet<UsersResponse>(`/api/user/getAllUsers?${queryParams.toString()}`),
    staleTime: 30 * 1000,
  });

  const users: UserRecord[] = (rawData?.data?.users || []).map((user) => ({
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

  const pagination = rawData?.data?.pagination || null;
  const error = queryError ? (queryError as any).message || "Failed to fetch users" : "";

  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      apiMutate<{ success: boolean; message?: string }>(
        `/api/admin/users/${userId}`,
        "DELETE"
      ),
    onSuccess: (res) => {
      toast.success(res.message || "User deleted successfully");
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "An error occurred while deleting user");
    },
  });

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id);
  };

  const deleting = deleteMutation.isPending;

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
  };

  // Refresh current list
  const handleRefresh = async () => {
    await refetch();
    toast.success("User list refreshed");
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

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
