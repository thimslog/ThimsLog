"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Plus,
  MoreVertical,
} from "lucide-react";

import { Topbar } from "@/components/admin/topbar";
import { StatusPill } from "@/components/admin/status-pill";
import { AddAdminModal } from "@/components/admin/add-admin-modal";

import { AdminRecord } from "@/lib/types";

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
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchAdmins = useCallback(
    async (requestedPage = page) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin?page=${requestedPage}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: AdminsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message ||
              "Failed to fetch admins",
          );
        }

        const mappedAdmins: AdminRecord[] =
          data.data.admins.map((admin) => ({
            id: admin.id,

            name: `${admin.firstName} ${admin.lastName}`,

            email: admin.email,

            role: admin.role as AdminRecord["role"],

            status: admin.isVerified
              ? "active"
              : "active",

            lastActive: admin.updatedAt
              || admin.createdAt,

            createdAt: admin.createdAt,
          }));

        setAdmins(mappedAdmins);

        setPagination(data.data.pagination);

        setPage(data.data.pagination.page);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch admins",
        );
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchAdmins(1);
  }, []);

  async function handleAdminCreated() {
    // Go back to page 1 because the new admin
    // is sorted to the top by createdAt.
    await fetchAdmins(1);
  }

  return (
    <>
      <Topbar
        title="Admins"
        subtitle={
          pagination
            ? `${pagination.total} admin accounts`
            : "Admin accounts"
        }
      />

      <main className="space-y-4 p-6">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-900 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-sky-900/90"
          >
            <Plus size={15} />
            Add admin
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            <span>{error}</span>

            <button
              onClick={() => fetchAdmins(page)}
              className="font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-card">
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white">
            <table className="w-full text-left">
              <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <tr className="text-[11.5px] uppercase tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">
                    Name
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Role
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Last active
                  </th>

                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[13px] text-ink-muted"
                    >
                      Loading admins...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-[13px] text-ink-muted"
                    >
                      No admin accounts found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-[#e5e7eb] last:border-b-0"
                    >
                      <td className="px-5 py-3 text-[13.5px] text-ink">
                        {admin.name}
                      </td>

                      <td className="px-5 py-3 font-mono text-[13px] text-ink-muted">
                        {admin.email}
                      </td>

                      <td className="px-5 py-3 text-[13px] text-ink-muted">
                        {roleLabel[admin.role] ??
                          admin.role}
                      </td>

                      <td className="px-5 py-3">
                        <StatusPill
                          label={
                            admin.status === "active"
                              ? "Active"
                              : "Suspended"
                          }
                          tone={
                            admin.status === "active"
                              ? "good"
                              : "bad"
                          }
                        />
                      </td>

                      <td className="px-5 py-3 text-[13px] text-ink-muted">
                        {new Date(
                          admin.lastActive,
                        ).toLocaleString()}
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

        {/* Pagination */}
        {!loading &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-ink-muted">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    fetchAdmins(page - 1)
                  }
                  className="rounded-md border border-base-border px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-base-elevated disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    fetchAdmins(page + 1)
                  }
                  className="rounded-md border border-base-border px-3 py-1.5 text-[12.5px] text-ink-muted transition-colors hover:bg-base-elevated disabled:cursor-not-allowed disabled:opacity-40"
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