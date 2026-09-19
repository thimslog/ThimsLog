"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Check,
  Eye,
  X,
  Copy,
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { PlatformIcon, getPlatformConfig } from "@/lib/platform-icons";
import { toast } from "@/components/ui/toast";
import { apiGet, apiMutate } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

interface AccountItem {
  id: string;
  name?: string | null;
  username: string;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  status: string;
  notes?: string | null;
  loginInstructions?: string | null;
}

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: number;
  accounts: AccountItem[];
}

const formatNaira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProductPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const accountTypeId = params?.id as string;

  // React Query for Product Detail & Accounts
  const {
    data: productResponse,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["inventory", "product", accountTypeId],
    queryFn: () =>
      apiGet<{ success: boolean; data: ProductDetail; walletBalance?: number }>(
        `/api/inventory/user/account-types/${accountTypeId}`
      ),
    enabled: Boolean(accountTypeId),
    staleTime: 60 * 1000,
  });

  const product = productResponse?.data || null;
  const walletBalance =
    typeof productResponse?.walletBalance === "number"
      ? productResponse.walletBalance
      : Number(user?.wallet?.balance ?? 0);

  // Cart & Search State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [previewAccount, setPreviewAccount] = useState<AccountItem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [purchasedOrder, setPurchasedOrder] = useState<any | null>(null);

  // React Query Mutation for Checkout
  const checkoutMutation = useMutation({
    mutationFn: (accountIds: string[]) =>
      apiMutate<{ success: boolean; data: any; code?: string; message?: string }>(
        "/api/inventory/user/checkout",
        {
          method: "POST",
          body: {
            accountTypeId: product?.id,
            accountIds,
          },
        }
      ),
    onSuccess: (data) => {
      toast.success("Purchase successful! Accounts delivered.");
      setPurchasedOrder(data.data);
      setSelectedIds([]);
      // Invalidate queries across the app
      queryClient.invalidateQueries({ queryKey: ["inventory", "product", accountTypeId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "user", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (err: any) => {
      if (err.message?.includes("INSUFFICIENT_FUNDS")) {
        toast.error("Insufficient funds! Please top up your wallet.");
      } else if (err.message?.includes("ACCOUNTS_UNAVAILABLE")) {
        toast.error("Some accounts were just taken! Refreshing list...");
        refetch();
      } else {
        toast.error(err.message || "Failed to process purchase");
      }
    },
  });

  const purchasing = checkoutMutation.isPending;

  // Selected Accounts objects
  const selectedAccounts = useMemo(() => {
    if (!product?.accounts) return [];
    const map = new Map(product.accounts.map((a) => [a.id, a]));
    return selectedIds
      .map((id) => map.get(id))
      .filter((a): a is AccountItem => Boolean(a));
  }, [product, selectedIds]);

  // Filtered available accounts
  const filteredAccounts = useMemo(() => {
    if (!product?.accounts) return [];
    if (!searchQuery.trim()) return product.accounts;

    const q = searchQuery.toLowerCase().trim();
    return product.accounts.filter(
      (a) =>
        a.username?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [product, searchQuery]);

  // Cart Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (filteredAccounts.length === 0) return;
    const allFilteredIds = filteredAccounts.map((a) => a.id);
    const newSelected = Array.from(new Set([...selectedIds, ...allFilteredIds]));
    setSelectedIds(newSelected);
    toast.info(`Added ${allFilteredIds.length} accounts to selection`);
  };

  const handleClearSelected = () => {
    setSelectedIds([]);
  };

  const handleCopyCart = () => {
    if (selectedAccounts.length === 0) {
      toast.warn("No accounts selected in cart to copy");
      return;
    }
    const text = selectedAccounts.map((a) => a.username || a.id).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${selectedAccounts.length} account IDs to clipboard`);
  };

  const handleCopyCheckoutIds = () => {
    if (selectedAccounts.length === 0) return;
    const text = selectedAccounts.map((a) => a.username || a.id).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Account IDs copied to clipboard");
  };

  // Cost calculation
  const unitPrice = product?.price || 0;
  const totalCost = unitPrice * selectedAccounts.length;
  const isInsufficient = walletBalance < totalCost;
  const remainingBalance = walletBalance - totalCost;

  // Checkout execution
  const handleConfirmPurchase = () => {
    if (selectedAccounts.length === 0) {
      toast.error("Please select at least one account to buy");
      return;
    }
    if (isInsufficient) {
      toast.error("Insufficient wallet balance. Please fund your wallet.");
      return;
    }
    checkoutMutation.mutate(selectedIds);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading product inventory...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-8 bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Product Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            The requested product category or account type is not available.
          </p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-3 px-2 sm:px-4">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft size={15} /> Back to Catalog
        </Link>

        {/* Live Wallet Balance Pill */}
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors shadow-xs"
        >
          <Wallet size={14} className="text-purple-600 dark:text-purple-400" />
          <span>Balance:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatNaira(walletBalance)}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: PRODUCT DETAIL CARD                                       */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 sticky top-6">
          <div className="relative overflow-hidden bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm">
            {/* Background Faded Watermark Icon */}
            <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none transform scale-150 rotate-12">
              <PlatformIcon name={product.name} size={140} className="w-36 h-36" />
            </div>

            {/* Platform Icon Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <PlatformIcon
                name={product.name}
                size={26}
                className="w-14 h-14 rounded-2xl shadow-sm ring-4 ring-white dark:ring-slate-900"
              />
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                {product.available} pcs available
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
              {product.name}
            </h1>

            {/* Price Banner Card (Black Box) */}
            <div className="mt-5 bg-slate-950 dark:bg-black rounded-2xl p-4 text-white flex items-center justify-between shadow-sm">
              <span className="text-xs font-normal text-slate-400">
                Price Per Unit
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                {formatNaira(product.price)}
              </span>
            </div>

            {/* Description & Details */}
            <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-5">
              {product.description ? (
                <div className="font-normal whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">
                  High quality social account with verified configuration and instant delivery.
                </p>
              )}

              {/* Login Format Box */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Login Format
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 rounded-xl p-3 font-mono text-[11px] text-purple-900 dark:text-purple-300 break-all select-all font-normal">
                  ID | PASSWORD | 2FA | MAIL | MAIL PASSWORD | RECOVERY MAIL
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: SELECTED ACCOUNTS + AVAILABLE ACCOUNTS TABLE              */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* ------------------------------------------------------------------- */}
          {/* TOP CARD: SELECTED ACCOUNTS                                         */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white dark:bg-[#0b101b] rounded-3xl border border-purple-100 dark:border-purple-950/40 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                Selected Accounts ({selectedAccounts.length})
              </h2>
              {selectedAccounts.length > 0 && (
                <button
                  onClick={handleClearSelected}
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200/60 dark:border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            {selectedAccounts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-normal text-slate-400 dark:text-slate-500">
                  No accounts selected yet. Click the <span className="font-semibold text-purple-600">+</span> icon in the table below to select accounts.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-4 max-h-64 overflow-y-auto pr-1">
                {selectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlatformIcon
                        name={product.name}
                        size={14}
                        className="w-7 h-7 rounded-lg shrink-0"
                      />
                      <span className="font-medium font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                        {account.username || account.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {formatNaira(product.price)}
                      </span>
                      <button
                        onClick={() => setPreviewAccount(account)}
                        className="p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Preview details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleSelect(account.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Remove from selection"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Action: Buy Account Button */}
            {selectedAccounts.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-normal block">Total Cost</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatNaira(totalCost)}
                  </span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-medium text-xs px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  Buy Account ({selectedAccounts.length})
                </button>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* BOTTOM CARD: AVAILABLE ACCOUNTS TABLE                               */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 shadow-sm">
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Available Accounts
              </h2>

              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by username or prev..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Action buttons: + Add All / Copy Cart */}
            <div className="flex items-center justify-end gap-2.5 mb-4">
              <button
                onClick={handleSelectAll}
                className="bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold px-4 py-2 rounded-xl border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add All
              </button>
              <button
                onClick={handleCopyCart}
                className="bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-300 text-xs font-semibold px-4 py-2 rounded-xl border border-sky-200/60 dark:border-sky-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy size={14} /> Copy Cart
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    <th className="pb-3 pl-2">NETWORK</th>
                    <th className="pb-3">UID</th>
                    <th className="pb-3">PRICE</th>
                    <th className="pb-3 text-center">VIEW</th>
                    <th className="pb-3 text-center">SELECT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No available accounts match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const isSelected = selectedIds.includes(acc.id);
                      return (
                        <tr
                          key={acc.id}
                          className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                            isSelected ? "bg-purple-50/40 dark:bg-purple-950/20" : ""
                          }`}
                        >
                          {/* NETWORK */}
                          <td className="py-3 pl-2">
                            <PlatformIcon
                              name={product.name}
                              size={14}
                              className="w-8 h-8 rounded-lg"
                            />
                          </td>

                          {/* UID */}
                          <td className="py-3 font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                              onClick={() => setPreviewAccount(acc)}>
                            {acc.username || acc.id}
                          </td>

                          {/* PRICE */}
                          <td className="py-3 font-bold text-slate-900 dark:text-white">
                            {formatNaira(product.price)}
                          </td>

                          {/* VIEW */}
                          <td className="py-3 text-center">
                            <button
                              onClick={() => setPreviewAccount(acc)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="View account preview"
                            >
                              <Eye size={15} />
                            </button>
                          </td>

                          {/* SELECT */}
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleToggleSelect(acc.id)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                              }`}
                              title={isSelected ? "Remove" : "Add to cart"}
                            >
                              {isSelected ? <Check size={16} /> : <Plus size={16} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* PREVIEW ACCOUNT MODAL                                                   */}
      {/* ======================================================================= */}
      {previewAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0b101b] w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setPreviewAccount(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <PlatformIcon name={product.name} size={20} className="w-10 h-10 rounded-xl" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Account Details
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                  {previewAccount.username || previewAccount.id}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-2 border border-slate-100 dark:border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {product.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNaira(product.price)}
                  </span>
                </div>
                {previewAccount.country && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Country:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {previewAccount.country}
                    </span>
                  </div>
                )}
                {typeof previewAccount.followers === "number" && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Followers:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {previewAccount.followers.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    AVAILABLE
                  </span>
                </div>
              </div>

              {previewAccount.notes && (
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {previewAccount.notes}
                  </p>
                </div>
              )}

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-purple-800 dark:text-purple-300">
                <span className="font-bold block mb-0.5">🔒 Delivery Notice</span>
                <p className="text-[11px] leading-relaxed">
                  Full login credentials, 2FA backup codes, and email passwords will be revealed immediately upon completing payment.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewAccount(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleToggleSelect(previewAccount.id);
                  setPreviewAccount(null);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                  selectedIds.includes(previewAccount.id)
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {selectedIds.includes(previewAccount.id) ? "Remove from Selection" : "Add to Selection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* CHECKOUT MODAL (MATCHES DESIGN EXACTLY)                                 */}
      {/* ======================================================================= */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0b101b] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <PlatformIcon name={product.name} size={18} className="w-8 h-8 rounded-xl" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {product.name}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary Card */}
            <div className="mt-5 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {product.name}
                </span>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedAccounts.length} ITEMS
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {acc.username || acc.id}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNaira(product.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-200 dark:border-white/10 pt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Subtotal</span>
                <span className="text-base font-black text-purple-700 dark:text-purple-400">
                  {formatNaira(totalCost)}
                </span>
              </div>

              {/* Copy All IDs button */}
              <button
                onClick={handleCopyCheckoutIds}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy size={13} /> Copy All IDs
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Discount (Level 0 · 0%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  -₦0
                </span>
              </div>
            </div>

            {/* Payment Wallet Box (Dark Box) */}
            <div className="mt-5 bg-[#0d131f] text-white rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider">
                <span className="text-slate-300 uppercase">PAYMENT WALLET</span>
                <span className="text-white text-sm">{formatNaira(walletBalance)}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">COST</span>
                  <span className="text-rose-400 font-extrabold text-sm">
                    -{formatNaira(totalCost)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">REMAINING</span>
                  {isInsufficient ? (
                    <span className="text-rose-400 font-extrabold text-sm">
                      Insufficient
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-extrabold text-sm">
                      {formatNaira(remainingBalance)}
                    </span>
                  )}
                </div>
              </div>

              {isInsufficient && (
                <div className="pt-2 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[11px] text-rose-300">
                  <span>Balance is low for this order.</span>
                  <Link
                    href="/dashboard/wallet"
                    className="font-bold underline text-white hover:text-rose-200"
                  >
                    Fund Wallet →
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                disabled={purchasing}
                className="flex-1 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={purchasing || isInsufficient}
                className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isInsufficient
                    ? "bg-slate-300 dark:bg-white/10 text-slate-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white"
                }`}
              >
                {purchasing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Confirm Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* PURCHASE SUCCESS MODAL                                                  */}
      {/* ======================================================================= */}
      {purchasedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0b101b] w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Order Completed!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You have successfully purchased {purchasedOrder.quantity} account(s). Total: {formatNaira(purchasedOrder.totalCost)}
            </p>

            <div className="mt-5 p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-xs text-left">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {purchasedOrder.orderId?.slice(0, 13)}...
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNaira(purchasedOrder.remainingBalance)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setPurchasedOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Shopping
              </button>
              <Link
                href="/dashboard/order-history"
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                View Orders <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
