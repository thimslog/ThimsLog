"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import {
  Plus,
  MoreVertical,
} from "lucide-react";

import { Topbar } from "@/components/admin/topbar";
import { StatusPill } from "@/components/admin/status-pill";
import { AddAdminModal } from "@/components/admin/add-admin-modal";

import { AdminRecord } from "@/lib/types";
import { useAdminPage } from "@/context/admin-page-context";

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  SUPPORT: "Support",

  // Keep these in case old/mock records use lowercase.
  super_admin: "Super admin",
  admin: "Admin",
  support: "Support",
};

const PAGE_SIZE = 10;

interface AdminApiRecord {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  isVerified: boolean;
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

interface AdminsResponse {
  success: boolean;
  message: string;
  data: {
    admins: AdminApiRecord[];
    pagination: Pagination;
  };
}

export default function AdminsPage() {
  const { setPageTitle } = useAdminPage();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: rawData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "admins-list", page],
    queryFn: () =>
      apiGet<AdminsResponse>(`/api/admin?page=${page}&limit=${PAGE_SIZE}`),
    staleTime: 30 * 1000,
  });

  const admins: AdminRecord[] = (rawData?.data?.admins || []).map((admin) => ({
    id: admin.id,
    name: `${admin.firstName} ${admin.lastName}`,
    email: admin.email,
    role: admin.role as AdminRecord["role"],
    status: admin.isVerified ? "active" : "active",
    lastActive: admin.updatedAt || admin.createdAt,
    createdAt: admin.createdAt,
  }));

  const pagination = rawData?.data?.pagination || null;
  const error = queryError ? (queryError as any).message || "Failed to fetch admins" : "";

  useEffect(() => {
    setPageTitle({
      title: "Admins",
      subtitle: pagination
        ? `${pagination.total} added admins`
        : "Admin Accounts",
    });
  }, [setPageTitle, pagination]);

  const handleAdminCreated = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["admin", "admins-list"] });
  };

  return (
    <>
      <main className="space-y-4 p-6">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-all shadow-xs"
          >
            <Plus size={16} />
            Add admin
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-[13px] text-rose-600 dark:text-rose-400">
            <span>{error}</span>

            <button
              onClick={() => refetch()}
              className="font-medium underline cursor-pointer hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
                <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Created</th>
                  <th className="px-5 py-3.5 font-semibold text-right" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[13px] text-sky-700 dark:text-sky-400"
                    >
                      Loading admins...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[13px] text-slate-400 dark:text-slate-500"
                    >
                      No admin accounts found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        {admin.name}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[13px] text-slate-600 dark:text-slate-300">
                        {admin.email}
                      </td>

                      <td className="px-5 py-3.5 text-[13px]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                          {roleLabel[admin.role] ?? admin.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusPill
                          label={admin.status === "active" ? "Active" : "Suspended"}
                          tone={admin.status === "active" ? "good" : "bad"}
                        />
                      </td>

                      <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
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

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} admins)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <AddAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleAdminCreated}
      />
    </>
  );
}