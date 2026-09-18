"use client";

import React from "react";
import {
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
import { OrderItem, PurchasedAccount } from "./types";
import {
  downloadOrderAsTxt,
  downloadOrderAsCsv,
  extractComboString,
} from "@/lib/export-orders";

interface OrderCardProps {
  order: OrderItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  copiedKey: string | null;
  copyWithFeedback: (text: string, label: string, keyId?: string) => void;
}

const formatNaira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  copiedKey,
  copyWithFeedback,
}: OrderCardProps) {
  const title = order.accountType?.name || "Social Account Pack";

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

  const copyAllOrderCredentials = () => {
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

  const copyCombos = () => {
    if (!order.accounts || order.accounts.length === 0) {
      toast.error("No delivered accounts in this order");
      return;
    }
    const text = order.accounts.map((acc) => extractComboString(acc)).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${order.accounts.length} combo line(s) to clipboard`);
  };

  const copyJson = () => {
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

  return (
    <div className="bg-white dark:bg-[#0b101b] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xs transition-all">
      {/* Order Summary Header */}
      <div
        onClick={onToggleExpand}
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
                onClick={copyAllOrderCredentials}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Copy all accounts in standard card format"
              >
                <Copy size={11} />
                <span>Copy All</span>
              </button>

              {/* 2. Copy Combos (user:pass:2fa) */}
              <button
                type="button"
                onClick={copyCombos}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/60 dark:border-sky-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Copy all accounts as user:pass:2fa combo strings"
              >
                <Key size={11} />
                <span>Copy Combos</span>
              </button>

              {/* 3. Copy JSON */}
              <button
                type="button"
                onClick={copyJson}
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
}
