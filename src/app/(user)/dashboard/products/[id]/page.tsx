"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Headphones, Plus, Search } from "lucide-react";
import { getPlatformConfig, PlatformIcon } from "@/lib/platform-icons";

interface AccountDTO {
  id: string;
  username: string | null;
  email: string | null;
  country: string | null;
  followers: number | null;
  status: string;
}
interface DetailDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: number;
  accounts: AccountDTO[];
}

const formatNaira = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AccountTypePage() {
  const { accountTypeId } = useParams<{ accountTypeId: string }>();
  const [data, setData] = useState<DetailDTO | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/inventory/user/account-types/${accountTypeId}`)
      .then((r) => r.json())
      .then((j) => setData(j.data ?? null))
      .finally(() => setLoading(false));
  }, [accountTypeId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Not found
      </div>
    );

  //   const { Icon, bg } = getPlatformConfig(data.name);
  // Safely extract bg class (with fallback)
  const config = getPlatformConfig(data.name);
  const bg = config.bg ?? "bg-slate-500";
  const filtered = data.accounts.filter((a) =>
    (a.username ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div
            className={`relative h-32 ${bg} bg-opacity-10 flex items-end p-4`}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}
            >
              <PlatformIcon
                name={data.name}
                size={26}
                className="w-14 h-14 rounded-2xl"
              />
              {/* <Icon size={26} className="text-white" /> */}
            </div>
          </div>
          <div className="p-5">
            <h1 className="text-lg font-extrabold text-slate-900 leading-snug">
              {data.name}
            </h1>
            <span className="inline-block mt-2 text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
              {data.available} pcs available
            </span>
            <div className="mt-4 rounded-xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-300">Price Per Unit</span>
              <span className="font-bold">{formatNaira(data.price)}</span>
            </div>
            {data.description && (
              <div className="mt-4 rounded-xl border border-slate-100 p-4 text-sm text-slate-600">
                {data.description}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Available Accounts
            </h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username or preview"
                className="pl-9 pr-4 py-2 text-sm rounded-full border border-slate-100 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 w-72"
              />
            </div>
          </div>

          <div className="flex justify-end mb-2">
            <button
              onClick={() => setSelected(new Set(filtered.map((a) => a.id)))}
              className="inline-flex items-center gap-1 text-purple-600 text-sm font-semibold hover:text-purple-700"
            >
              <Plus size={14} /> Add All
            </button>
          </div>

          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 text-xs font-semibold text-slate-400 uppercase px-2 pb-3 border-b border-slate-100">
            <span>Network</span>
            <span>UID</span>
            <span className="text-right">Price</span>
            <span className="text-center">View</span>
            <span className="text-center">Select</span>
          </div>

          {filtered.map((account) => (
            <div
              key={account.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-2 py-3 border-b border-slate-50"
            >
              <div
                className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
              >
                {/* <Icon size={16} className="text-white" /> */}
                <PlatformIcon
                  name={data.name}
                  size={16}
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <span className="text-purple-600 font-semibold text-sm">
                {account.username ?? account.email ?? account.id}
              </span>
              <span className="text-right font-bold text-slate-900 text-sm">
                {formatNaira(data.price)}
              </span>
              <button className="mx-auto w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                <Eye size={14} />
              </button>
              <button
                onClick={() => toggleSelect(account.id)}
                className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-white ${selected.has(account.id) ? "bg-emerald-500" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                <Plus size={14} />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-10">
              No accounts match your search.
            </p>
          )}
        </div>
      </div>

      <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-purple-600 hover:bg-purple-50">
        <Headphones size={20} />
      </button>
    </div>
  );
}
