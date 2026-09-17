"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Package,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import DisclaimerBanner from "./dashboard/DisclaimerBanner";
import QuickActionsBar from "./dashboard/QuickActionsBar";
import BalanceCard from "./dashboard/BalanceCard";
import { PlatformIcon } from "@/lib/platform-icons";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";

interface AccountTypeDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: number;
}

interface CategoryDTO {
  id: string;
  name: string;
  description: string | null;
  accountTypes: AccountTypeDTO[];
}

interface PurchasedAccount {
  id: string;
  name?: string | null;
  username: string;
  loginInstructions?: string | null;
  notes?: string | null;
}

interface RecentOrder {
  id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  accountType: {
    id: string;
    name: string;
  } | null;
  accounts: PurchasedAccount[];
}

interface DashboardContentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  createdAt: Date | string;
  wallet?: {
    balance: any;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
  };
}

interface DashboardContentProps {
  user: DashboardContentUser;
}

const formatNaira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [paymentNotice, setPaymentNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();

    const paymentStatus = searchParams.get("payment");
    const amount = searchParams.get("amount");

    if (paymentStatus === "success") {
      const formattedAmount = amount
        ? `₦${Number(amount).toLocaleString()}`
        : "your funds";
      setPaymentNotice({
        type: "success",
        message: `Payment successful! ${formattedAmount} has been credited to your wallet balance.`,
      });

      refreshUser();
      const timer = setTimeout(() => {
        refreshUser();
      }, 1500);

      router.replace("/dashboard");
      return () => clearTimeout(timer);
    } else if (paymentStatus === "failed") {
      setPaymentNotice({
        type: "error",
        message: "Payment could not be completed or was cancelled.",
      });
      router.replace("/dashboard");
    } else if (paymentStatus === "processing") {
      setPaymentNotice({
        type: "info",
        message: "Your payment is currently processing. Your balance will update automatically once confirmed.",
      });
      router.replace("/dashboard");
    }
  }, [searchParams, refreshUser, router]);

  // Load catalog & recent orders
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingData(true);
        const [catRes, ordRes] = await Promise.all([
          fetch("/api/inventory/user/categories").then((r) => r.json()).catch(() => ({ data: [] })),
          fetch("/api/inventory/user/orders").then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        if (catRes.data) {
          setCategories(catRes.data);
        }
        if (ordRes.data) {
          setRecentOrders(ordRes.data.slice(0, 3)); // show top 3 recent orders
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Flatten popular / in-stock account types
  const featuredAccountTypes = categories
    .flatMap((c) => c.accountTypes)
    .filter((t) => t.available > 0)
    .slice(0, 4);

  return (
    <main className="space-y-6 font-sans">
      {/* Payment Notice Notification */}
      {paymentNotice && (
        <div
          className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all shadow-2xs ${
            paymentNotice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : paymentNotice.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300"
              : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-500/20 text-sky-800 dark:text-sky-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentNotice.type === "success" && (
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {paymentNotice.type === "error" && (
              <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            {paymentNotice.type === "info" && (
              <Loader2 size={20} className="text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
            )}
            <p className="text-xs font-semibold">{paymentNotice.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Disclaimer Banner */}
      <DisclaimerBanner>
        This platform provides authentic digital assets and verified social inventory for legitimate use only.
      </DisclaimerBanner>

      {/* Quick Actions Shortcuts */}
      <QuickActionsBar />

      {/* Wallet Balance Card */}
      <BalanceCard
        name={user.firstName}
        balance={Number(user?.wallet?.balance ?? 0)}
      />

      {/* ======================================================================= */}
      {/* FEATURED / IN-STOCK SOCIAL ACCOUNTS GRID                                */}
      {/* ======================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trending Social Accounts
            </h2>
          </div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            <span>View All Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : featuredAccountTypes.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#0b101b] rounded-2xl border border-slate-200/80 dark:border-white/10 text-center text-xs text-slate-400">
            No products currently in stock. Check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredAccountTypes.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <PlatformIcon name={item.name} size={16} className="w-8 h-8 rounded-xl" />
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {item.available} in stock
                    </span>
                  </div>

                  <h3 className="mt-3 text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {item.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatNaira(item.price)}
                  </span>
                  <Link
                    href={`/dashboard/products/${item.id}`}
                    className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    Buy
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* RECENT ORDERS & QUICK CREDENTIALS ACCESS                                 */}
      {/* ======================================================================= */}
      {recentOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Order Deliveries
              </h2>
            </div>
            <Link
              href="/dashboard/order-history"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map((ord) => {
              const firstAcc = ord.accounts?.[0];
              const title = ord.accountType?.name || "Purchased Account";

              return (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4.5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name={title} size={14} className="w-7 h-7 rounded-lg" />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {ord.quantity} pcs • {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {firstAcc && (
                    <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-medium text-sky-600 dark:text-sky-400 truncate max-w-[140px]">
                          {firstAcc.username || firstAcc.id}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${firstAcc.username || firstAcc.id} | ${firstAcc.loginInstructions || ""}`,
                              ord.id
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          {copiedKey === ord.id ? (
                            <Check size={11} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                          <span>{copiedKey === ord.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      {firstAcc.loginInstructions && (
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate select-all">
                          {firstAcc.loginInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNaira(ord.totalAmount)}
                    </span>
                    <Link
                      href="/dashboard/order-history"
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      View Credentials <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};

export default DashboardContent;
