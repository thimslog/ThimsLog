"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones } from "lucide-react";
import { getPlatformConfig, PlatformIcon } from "@/lib/platform-icons";

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

const formatNaira = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;



function AvailabilityTag({ available }: { available: number }) {
  return available > 0 ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {available} Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      Out of Stock
    </span>
  );
}

function AccountTypeCard({
  accountType,
  onBuy,
}: {
  accountType: AccountTypeDTO;
  onBuy: (id: string) => void;
}) {
  const soldOut = accountType.available <= 0;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col transition-colors ${
        soldOut
          ? "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5"
          : "bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 shadow-xs hover:shadow-md"
      }`}
    >
      {soldOut && (
        <div className="absolute -right-10 top-4 w-36 rotate-45 bg-rose-500 text-white text-[10px] font-bold tracking-wider text-center py-1 shadow-sm">
          SOLD OUT
        </div>
      )}
      <PlatformIcon name={accountType.name} />
      <h3
        className={`mt-4 text-sm font-bold leading-snug ${
          soldOut ? "text-slate-400 dark:text-slate-600" : "text-slate-900 dark:text-white"
        }`}
      >
        {accountType.name}
      </h3>
      <div className="mt-3">
        <AvailabilityTag available={accountType.available} />
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <span
          className={`font-bold ${
            soldOut ? "text-slate-300 dark:text-slate-600 line-through" : "text-sky-600 dark:text-sky-400"
          }`}
        >
          {formatNaira(accountType.price)}
        </span>
        {soldOut ? (
          <button
            disabled
            className="bg-slate-100 dark:bg-white/5 text-slate-400 text-xs font-semibold px-5 py-2 rounded-xl cursor-not-allowed"
          >
            Sold Out
          </button>
        ) : (
          <button
            onClick={() => onBuy(accountType.id)}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-xs font-semibold px-6 py-2 rounded-xl transition-all shadow-sm hover:shadow-glow cursor-pointer"
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory/user/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-2">
      {categories.map((category) => (
        <section key={category.id} className="mb-10">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-white/10">
            <PlatformIcon name={category.name} />
            <div>
              <h2 className="text-base font-extrabold tracking-wide text-slate-900 dark:text-white">
                {category.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {category.accountTypes.length} account types available
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {category.accountTypes.map((t) => (
              <AccountTypeCard
                key={t.id}
                accountType={t}
                onBuy={(id) => router.push(`/catalog/${id}`)}
              />
            ))}
          </div>
        </section>
      ))}
      <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
        <Headphones size={20} />
      </button>
    </div>
  );
}
