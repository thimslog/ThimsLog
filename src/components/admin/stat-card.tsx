import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { DashboardStat } from "@/lib/types";

export function StatCard({ stat }: { stat: DashboardStat }) {
  const trendColor =
    stat.trend === "up" ? "text-good" : stat.trend === "down" ? "text-bad" : "text-ink-faint";
  const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;

  return (
    <div className="rounded-card border border-base-border bg-base-surface p-4">
      <p className="text-[12.5px] text-ink-faint">{stat.label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="font-display text-[24px] text-ink leading-none">{stat.value}</span>
        <span className={`flex items-center gap-0.5 text-[12px] font-mono ${trendColor}`}>
          <TrendIcon size={13} />
          {stat.delta}
        </span>
      </div>
    </div>
  );
}
