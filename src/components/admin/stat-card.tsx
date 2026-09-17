import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { DashboardStat } from "@/lib/types";

export function StatCard({ stat }: { stat: DashboardStat }) {
  const trendColor =
    stat.trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : stat.trend === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-400 dark:text-slate-500";
  const TrendIcon =
    stat.trend === "up"
      ? ArrowUpRight
      : stat.trend === "down"
      ? ArrowDownRight
      : Minus;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {stat.label}
      </p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
          {stat.value}
        </span>
        <span
          className={`flex items-center gap-0.5 text-xs font-mono font-medium ${trendColor}`}
        >
          <TrendIcon size={14} />
          {stat.delta}
        </span>
      </div>
    </div>
  );
}
