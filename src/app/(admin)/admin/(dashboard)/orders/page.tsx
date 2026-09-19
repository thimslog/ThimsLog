"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  AdminOrderRecord,
  OrderMetrics,
  Pagination,
  AdminOrdersStatsCards,
  AdminOrdersFilters,
  AdminOrdersTable,
  AdminOrderDetailsModal,
} from "@/components/admin/orders";

const PAGE_SIZE = 15;

const formatMoney = (val: number | string | null | undefined) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string) => {
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
};

function AdminOrdersContent() {
  const { setPageTitle } = useAdminPage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialStatus = searchParams.get("status") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [exporting, setExporting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRecord | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
  if (debouncedSearch.trim()) queryParams.append("search", debouncedSearch.trim());

  const {
    data: rawData,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "orders", page, statusFilter, debouncedSearch],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: {
          orders: AdminOrderRecord[];
          metrics: OrderMetrics;
          pagination: Pagination;
        };
      }>(`/api/admin/orders?${queryParams.toString()}`),
    staleTime: 30 * 1000,
  });

  const orders = rawData?.data?.orders || [];
  const metrics = rawData?.data?.metrics || null;
  const pagination = rawData?.data?.pagination || null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  // Sync URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [page, debouncedSearch, statusFilter, pathname, router]);

  useEffect(() => {
    setPageTitle({
      title: "Order History",
      subtitle: "Track, inspect, and manage customer account purchases and delivered credentials",
    });
  }, [setPageTitle]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  const handleStatusFilter = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Orders refreshed");
  };

  // 1-Click CSV Export for Admin Orders
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        export: "true",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success || !json.data?.orders) {
        throw new Error(json.message || "Failed to fetch orders for export");
      }

      const rows: AdminOrderRecord[] = json.data.orders;
      if (rows.length === 0) {
        toast.info("No orders found to export");
        return;
      }

      const headers = [
        "Order ID",
        "Date (UTC)",
        "Customer Name",
        "Username",
        "Customer Email",
        "Product Name",
        "Category",
        "Quantity",
        "Unit Price (NGN)",
        "Total Amount (NGN)",
        "Status",
      ];

      const csvRows = [headers.join(",")];

      rows.forEach((o) => {
        const row = [
          `"${o.id}"`,
          `"${new Date(o.createdAt).toISOString()}"`,
          `"${(o.buyerName || "").replace(/"/g, '""')}"`,
          `"${(o.buyerUsername || "").replace(/"/g, '""')}"`,
          `"${(o.buyerEmail || "").replace(/"/g, '""')}"`,
          `"${(o.productName || "").replace(/"/g, '""')}"`,
          `"${(o.categoryName || "").replace(/"/g, '""')}"`,
          o.quantity,
          o.unitPrice,
          o.totalAmount,
          `"${o.status}"`,
        ];
        csvRows.push(row.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ThimsLog-Orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${rows.length} orders successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      {/* 1. KPI Summary Cards */}
      <AdminOrdersStatsCards metrics={metrics} formatMoney={formatMoney} />

      {/* 2. Search, Status Filters & Action Toolbar */}
      <AdminOrdersFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        loading={loading || isRefetching}
        exporting={exporting}
        statusFilter={statusFilter}
        onStatusFilter={handleStatusFilter}
      />

      {/* 3. Orders Table */}
      <AdminOrdersTable
        orders={orders}
        loading={loading}
        debouncedSearch={debouncedSearch}
        copiedKey={copiedKey}
        onCopy={copyToClipboard}
        onSelectOrder={(order) => setSelectedOrder(order)}
        pagination={pagination}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />

      {/* 4. Order Delivered Items Details Modal */}
      <AdminOrderDetailsModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCopy={copyToClipboard}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
