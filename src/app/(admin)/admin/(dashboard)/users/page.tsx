"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";

import { Topbar } from "@/components/admin/topbar";
import { StatusPill } from "@/components/admin/status-pill";
import { useAdminPage } from "@/context/admin-page-context";

const PAGE_SIZE = 10;

interface UserApiRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  // isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
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
  // status: "active" | "banned";
  joinedAt: string;
  lastActive: string;
}

export default function UsersPage() {
  const { setPageTitle } = useAdminPage();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(
    async (requestedPage = page) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/user/getAllUsers?page=${requestedPage}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: UsersResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.message || "Failed to fetch users");
        }

        const mappedUsers: UserRecord[] = data.data.users.map((user) => ({
          id: user.id,

          name: `${user.firstName} ${user.lastName}`.trim(),

          email: user.email,

          username: user.userName,
          // status: user.isVerified
          //   ? "active"
          //   : "banned",

          joinedAt: user.createdAt,

          lastActive: user.updatedAt || user.createdAt,
        }));

        setUsers(mappedUsers);

        setPagination(data.data.pagination);

        setPage(data.data.pagination.page);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch users",
        );
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    setPageTitle({
      title: "Users",
      subtitle: pagination
        ? `${pagination.total} registered customers`
        : "Registered customers",
    });
  }, [setPageTitle, pagination]);

  return (
    <>
      <main className="space-y-4 p-6">
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-400">
            <span>{error}</span>

            <button
              onClick={() => fetchUsers(page)}
              className="font-medium underline cursor-pointer hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
                <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Username</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Last active</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[13px] text-sky-700 dark:text-sky-400"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[13px] text-slate-400 dark:text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          {user.name}
                        </Link>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[13px] text-slate-600 dark:text-slate-300">
                        {user.email}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[13px] text-sky-700 dark:text-sky-400">
                        @{user.username}
                      </td>

                      <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-colors"
                        >
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => fetchUsers(page - 1)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => fetchUsers(page + 1)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
