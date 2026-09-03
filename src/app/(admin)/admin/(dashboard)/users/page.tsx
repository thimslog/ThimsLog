"use client";

import { useCallback, useEffect, useState } from "react";

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
      {/* <Topbar
        title="Users"
        subtitle={
          pagination
            ? `${pagination.total} registered customers`
            : "Registered customers"
        }
      /> */}

      <main className="space-y-4 p-6">
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            <span>{error}</span>

            <button
              onClick={() => fetchUsers(page)}
              className="font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-card">
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white">
            <table className="w-full text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <tr className="text-[11.5px] uppercase tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">Name</th>

                  <th className="px-5 py-3 font-medium">Email</th>

                  <th className="px-5 py-3 font-medium">Status</th>

                  <th className="px-5 py-3 font-medium">Joined</th>

                  <th className="px-5 py-3 font-medium">Last active</th>

                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[13px] text-sky-900"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[13px] text-ink-muted"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#e5e7eb] last:border-b-0"
                    >
                      <td className="px-5 py-3 text-[13.5px] text-ink">
                        {user.name}
                      </td>

                      <td className="px-5 py-3 font-mono text-[13px] text-ink-muted">
                        {user.email}
                      </td>

                      <td className="px-5 py-3 font-mono text-[13px] text-ink-muted">
                        {user.username}
                      </td>

                      {/* <td className="px-5 py-3">
                        <StatusPill
                          label={
                            user.status === "active"
                              ? "Active"
                              : "Banned"
                          }
                          tone={
                            user.status === "active"
                              ? "good"
                              : "bad"
                          }
                        />
                      </td> */}

                      <td className="px-5 py-3 text-[13px] text-ink-muted">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3 text-[13px] text-ink-muted">
                        {new Date(user.lastActive).toLocaleString()}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <button
                          className="text-ink-faint transition-colors hover:text-ink"
                          aria-label="Row actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] text-ink-muted">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => fetchUsers(page - 1)}
                className="rounded-md border border-base-border px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-base-elevated disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => fetchUsers(page + 1)}
                className="rounded-md border border-base-border px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-base-elevated disabled:cursor-not-allowed disabled:opacity-40"
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
