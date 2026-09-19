"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  AdminAuditLogRecord,
  AuditLogsResponse,
  AuditMetricsCards,
  AuditFilters,
  AuditTable,
  AuditPagination,
  AuditDetailModal,
} from "@/components/admin/audit-logs";

function AdminAuditLogsContent() {
  const { setPageTitle } = useAdminPage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialAction = searchParams.get("action") || "ALL";
  const initialEntityType = searchParams.get("entityType") || "ALL";
  const initialAdmin = searchParams.get("admin") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [actionFilter, setActionFilter] = useState(initialAction);
  const [entityTypeFilter, setEntityTypeFilter] = useState(initialEntityType);
  const [adminFilter, setAdminFilter] = useState(initialAdmin);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);

  const [exportingCsv, setExportingCsv] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogRecord | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: "20",
  });
  if (actionFilter !== "ALL") queryParams.append("action", actionFilter);
  if (entityTypeFilter !== "ALL") queryParams.append("entityType", entityTypeFilter);
  if (adminFilter !== "ALL") queryParams.append("admin", adminFilter);
  if (appliedSearch.trim()) queryParams.append("search", appliedSearch.trim());

  const {
    data: rawData,
    isLoading: loading,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "admin",
      "audit-logs",
      page,
      actionFilter,
      entityTypeFilter,
      adminFilter,
      appliedSearch,
    ],
    queryFn: () =>
      apiGet<AuditLogsResponse>(`/api/admin/audit-logs?${queryParams.toString()}`),
    staleTime: 15 * 1000,
  });

  const logs = rawData?.data?.logs || [];
  const pagination = rawData?.data?.pagination || null;
  const metrics = rawData?.data?.metrics || null;
  const adminOptions = rawData?.data?.filterOptions?.admins || [];
  const error = queryError
    ? (queryError as any).message || "Failed to load audit logs"
    : "";

  useEffect(() => {
    setPageTitle({
      title: "Admin Audit Logs",
      subtitle: pagination
        ? `${pagination.total.toLocaleString()} total audit events logged`
        : "System activity and security ledger",
    });
  }, [setPageTitle, pagination]);

  const updateUrl = (
    newPage: number,
    newAction: string,
    newEntity: string,
    newAdmin: string,
    newSearch: string
  ) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (newAction !== "ALL") params.set("action", newAction);
    if (newEntity !== "ALL") params.set("entityType", newEntity);
    if (newAdmin !== "ALL") params.set("admin", newAdmin);
    if (newSearch.trim()) params.set("search", newSearch.trim());

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(newPage, actionFilter, entityTypeFilter, adminFilter, appliedSearch);
  };

  const handleActionChange = (newAction: string) => {
    setActionFilter(newAction);
    setPage(1);
    updateUrl(1, newAction, entityTypeFilter, adminFilter, appliedSearch);
  };

  const handleEntityTypeChange = (newEntity: string) => {
    setEntityTypeFilter(newEntity);
    setPage(1);
    updateUrl(1, actionFilter, newEntity, adminFilter, appliedSearch);
  };

  const handleAdminChange = (newAdmin: string) => {
    setAdminFilter(newAdmin);
    setPage(1);
    updateUrl(1, actionFilter, entityTypeFilter, newAdmin, appliedSearch);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setAppliedSearch(val);
      setPage(1);
      updateUrl(1, actionFilter, entityTypeFilter, adminFilter, val);
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setAppliedSearch(searchQuery);
    setPage(1);
    updateUrl(1, actionFilter, entityTypeFilter, adminFilter, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setPage(1);
    updateUrl(1, actionFilter, entityTypeFilter, adminFilter, "");
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Audit logs refreshed");
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = new URLSearchParams({ export: "true" });
      if (actionFilter !== "ALL") params.append("action", actionFilter);
      if (entityTypeFilter !== "ALL") params.append("entityType", entityTypeFilter);
      if (adminFilter !== "ALL") params.append("admin", adminFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const json: AuditLogsResponse = await res.json();
      if (!res.ok || !json.success) {
        throw new Error("Failed to load audit logs for export");
      }

      const list = json.data.logs || [];
      if (list.length === 0) {
        toast.info("No audit logs found to export");
        return;
      }

      const headers = [
        "Log ID",
        "Timestamp (UTC)",
        "Admin Email",
        "Action",
        "Entity Type",
        "Entity Label",
        "Description",
        "IP Address",
        "User Agent",
      ];

      const csvRows = [headers.join(",")];

      list.forEach((l) => {
        const row = [
          `"${l.id}"`,
          `"${new Date(l.createdAt).toISOString()}"`,
          `"${(l.adminEmail || "").replace(/"/g, '""')}"`,
          `"${(l.action || "").replace(/"/g, '""')}"`,
          `"${(l.entityType || "N/A").replace(/"/g, '""')}"`,
          `"${(l.entityLabel || "N/A").replace(/"/g, '""')}"`,
          `"${(l.description || "").replace(/"/g, '""')}"`,
          `"${(l.ipAddress || "N/A").replace(/"/g, '""')}"`,
          `"${(l.userAgent || "N/A").replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateTag = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `ThimsLog-Audit-Logs-${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${list.length} audit logs to CSV`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to export audit logs");
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* 1. Metrics Overview Cards */}
      <AuditMetricsCards metrics={metrics} loading={loading} />

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Filter, Search & Export Bar */}
      <AuditFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        actionFilter={actionFilter}
        onActionChange={handleActionChange}
        entityTypeFilter={entityTypeFilter}
        onEntityTypeChange={handleEntityTypeChange}
        adminFilter={adminFilter}
        onAdminChange={handleAdminChange}
        adminOptions={adminOptions}
        onRefresh={handleRefresh}
        onExportCsv={handleExportCsv}
        exportingCsv={exportingCsv}
        loading={loading || isRefetching}
        appliedSearch={appliedSearch}
        totalLogs={pagination?.total}
      />

      {/* 3. Audit Activity Ledger Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden">
        <AuditTable
          logs={logs}
          loading={loading || isRefetching}
          onSelectLog={(log) => setSelectedLog(log)}
        />

        {pagination && (
          <AuditPagination
            pagination={pagination}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* 4. Detail / Metadata Inspector Modal */}
      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={20} className="animate-spin text-sky-600" />
            <span>Loading admin audit logs...</span>
          </div>
        </div>
      }
    >
      <AdminAuditLogsContent />
    </Suspense>
  );
}
