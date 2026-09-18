"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Search,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Calendar,
  Mail,
  User as UserIcon,
  FileText,
  Globe,
  Users,
  Check,
  Key,
  FileSpreadsheet,
  Code2,
} from "lucide-react";
import { PlatformIcon } from "@/lib/platform-icons";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import {
  downloadOrderAsTxt,
  downloadOrderAsCsv,
  downloadAllOrdersAsCsv,
  extractComboString,
} from "@/lib/export-orders";

interface PurchasedAccount {
  id: string;
  name?: string | null;
  username: string;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  notes?: string | null;
  loginInstructions?: string | null;
  status?: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  accountType: {
    id: string;
    name: string;
    category?: string;
  } | null;
  accounts: PurchasedAccount[];
}

const formatNaira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/user/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
        // Expand the first order by default
        if (json.data.length > 0) {
          setExpandedOrders({ [json.data[0].id]: true });
        }
      } else {
        toast.error(json.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyWithFeedback = (text: string, label: string, keyId?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
    toast.success(`${label} copied to clipboard`);
  };

  // Helper to format clean account credentials WITHOUT any order IDs or database UUIDs
  const formatAccountForClipboard = (acc: PurchasedAccount) => {
    const lines: string[] = [];
    if (acc.username) lines.push(`Username: ${acc.username}`);
    if (acc.email) lines.push(`Email: ${acc.email}`);
    if (acc.loginInstructions) lines.push(`Credentials / Login: ${acc.loginInstructions}`);
    if (acc.url) lines.push(`Profile Link: ${acc.url}`);
    if (acc.country) lines.push(`Country: ${acc.country}`);
    if (acc.followers) lines.push(`Followers: ${acc.followers.toLocaleString()}`);
    if (acc.notes) lines.push(`Notes & Instructions: ${acc.notes}`);

    if (lines.length === 0) {
      return acc.loginInstructions || acc.username || "";
    }
    return lines.join("\n");
  };

  // Copy all accounts in an order without order ID
  const copyAllOrderCredentials = (order: OrderItem) => {
    if (!order.accounts || order.accounts.length === 0) {
      toast.error("No delivered accounts in this order");
      return;
    }

    const text = order.accounts
      .map((acc, idx) => {
        const header = order.accounts.length > 1 ? `--- Account #${idx + 1} ---` : "";
        const details = formatAccountForClipboard(acc);
        return header ? `${header}\n${details}` : details;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    toast.success(`Copied details for ${order.accounts.length} account(s)`);
  };

  // Copy combo user:pass:2fa lines
  const copyCombos = (order: OrderItem) => {
    if (!order.accounts || order.accounts.length === 0) {
      toast.error("No delivered accounts in this order");
      return;
    }
    const text = order.accounts.map((acc) => extractComboString(acc)).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${order.accounts.length} combo line(s) to clipboard`);
  };

  // Copy JSON
  const copyJson = (order: OrderItem) => {
    if (!order.accounts || order.accounts.length === 0) {
      toast.error("No delivered accounts in this order");
      return;
    }
    const cleanAccounts = order.accounts.map((acc) => ({
      product: order.accountType?.name,
      username: acc.username,
      email: acc.email,
      credentials: acc.loginInstructions,
      notes: acc.notes,
      country: acc.country,
      followers: acc.followers,
      combo: extractComboString(acc),
    }));
    navigator.clipboard.writeText(JSON.stringify(cleanAccounts, null, 2));
    toast.success("Copied accounts JSON array to clipboard");
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const typeMatch = o.accountType?.name?.toLowerCase().includes(q);
    const idMatch = o.id.toLowerCase().includes(q);
    const accMatch = o.accounts.some(
      (a) =>
        a.username?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q)
    );
    return typeMatch || idMatch || accMatch;
  });

  return (
    <div className="max-w-6xl mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Order History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Access credentials, login details, usernames, emails, notes, and receipts for all purchased accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => downloadAllOrdersAsCsv(filteredOrders)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Download CSV spreadsheet of all delivered accounts"
            >
              <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Export All (CSV)</span>
            </button>
          )}

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by username, email, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-normal"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-sky-600 dark:text-sky-400 animate-spin" />
          <p className="text-xs font-normal text-slate-400">Loading your purchase history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-2xs">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Orders Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-normal">
            {search ? `No orders matched "${search}"` : "You have not purchased any social accounts yet. Browse the catalog to get started."}
          </p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            const title = order.accountType?.name || "Social Account Pack";

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0b101b] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xs transition-all"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <PlatformIcon
                      name={title}
                      size={18}
                      className="w-10 h-10 rounded-xl shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {title}
                        </h3>
                        <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 px-2 py-0.5 rounded-md">
                          {order.quantity} pcs
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-normal">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                        Total Paid
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatNaira(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    {/* Multi-Format Action Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 border-b border-slate-200/60 dark:border-white/5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Delivered Accounts ({order.accounts.length})
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 1. Copy All (Clean Card) */}
                        <button
                          type="button"
                          onClick={() => copyAllOrderCredentials(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Copy all accounts in standard card format"
                        >
                          <Copy size={11} />
                          <span>Copy All</span>
                        </button>

                        {/* 2. Copy Combos (user:pass:2fa) */}
                        <button
                          type="button"
                          onClick={() => copyCombos(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/60 dark:border-sky-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Copy all accounts as user:pass:2fa combo strings"
                        >
                          <Key size={11} />
                          <span>Copy Combos</span>
                        </button>

                        {/* 3. Copy JSON */}
                        <button
                          type="button"
                          onClick={() => copyJson(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-200/60 dark:border-purple-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Copy accounts structured JSON array"
                        >
                          <Code2 size={11} />
                          <span>JSON</span>
                        </button>

                        {/* 4. Download TXT */}
                        <button
                          type="button"
                          onClick={() => downloadOrderAsTxt(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Download .TXT file"
                        >
                          <FileText size={11} />
                          <span>.TXT</span>
                        </button>

                        {/* 5. Download CSV */}
                        <button
                          type="button"
                          onClick={() => downloadOrderAsCsv(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Download .CSV spreadsheet"
                        >
                          <FileSpreadsheet size={11} />
                          <span>.CSV</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5 mt-1">
                      {order.accounts.map((acc, idx) => {
                        const accKey = `${order.id}-${acc.id || idx}`;

                        return (
                          <div
                            key={acc.id || idx}
                            className="bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4.5 text-xs space-y-3 shadow-2xs"
                          >
                            {/* Top Bar with Account Index, Username, Email, & Master Copy */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                                  #{idx + 1}
                                </span>

                                {/* Username */}
                                {acc.username && (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 font-mono font-semibold text-xs">
                                    <UserIcon size={12} />
                                    <span>@{acc.username}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyWithFeedback(acc.username, "Username", `user-${accKey}`)}
                                      className="p-0.5 hover:text-sky-900 dark:hover:text-white transition-colors cursor-pointer ml-1"
                                      title="Copy username only"
                                    >
                                      {copiedKey === `user-${accKey}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                    </button>
                                  </div>
                                )}

                                {/* Email */}
                                {acc.email && (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-xs">
                                    <Mail size={12} />
                                    <span>{acc.email}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyWithFeedback(acc.email!, "Email", `email-${accKey}`)}
                                      className="p-0.5 hover:text-purple-900 dark:hover:text-white transition-colors cursor-pointer ml-1"
                                      title="Copy email only"
                                    >
                                      {copiedKey === `email-${accKey}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                    </button>
                                  </div>
                                )}

                                {/* Country / Region */}
                                {acc.country && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                                    <Globe size={11} />
                                    {acc.country}
                                  </span>
                                )}

                                {/* Followers */}
                                {typeof acc.followers === "number" && acc.followers > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                                    <Users size={11} />
                                    {acc.followers.toLocaleString()} followers
                                  </span>
                                )}

                                {/* Profile URL Link */}
                                {acc.url && (
                                  <a
                                    href={acc.url.startsWith("http") ? acc.url : `https://${acc.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-sky-600 dark:text-sky-400 hover:underline text-[11px] font-medium"
                                  >
                                    <ExternalLink size={11} />
                                    <span>Profile Link</span>
                                  </a>
                                )}
                              </div>

                              {/* Copy Entire Account Details */}
                              <button
                                type="button"
                                onClick={() =>
                                  copyWithFeedback(
                                    formatAccountForClipboard(acc),
                                    "Account credentials",
                                    `all-${accKey}`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Copy all details for this account"
                              >
                                {copiedKey === `all-${accKey}` ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                                <span>{copiedKey === `all-${accKey}` ? "Copied" : "Copy Account Details"}</span>
                              </button>
                            </div>

                            {/* Login Instructions / Credentials Box */}
                            {acc.loginInstructions && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Key size={12} className="text-amber-500" />
                                    Login Format / Credentials:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyWithFeedback(
                                        acc.loginInstructions!,
                                        "Login credentials",
                                        `creds-${accKey}`
                                      )
                                    }
                                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedKey === `creds-${accKey}` ? (
                                      <Check size={11} className="text-emerald-500" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                    <span>{copiedKey === `creds-${accKey}` ? "Copied" : "Copy Credentials"}</span>
                                  </button>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all border border-slate-200/60 dark:border-white/5">
                                  {acc.loginInstructions}
                                </div>
                              </div>
                            )}

                            {/* Notes & Special Instructions */}
                            {acc.notes && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText size={12} className="text-slate-400" />
                                  Notes & Instructions:
                                </span>
                                <div className="p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-amber-200/40 dark:border-amber-500/10">
                                  {acc.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

