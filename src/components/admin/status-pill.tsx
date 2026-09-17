type Tone = "good" | "warn" | "bad" | "neutral";

const toneClasses: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warn: "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  bad: "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  neutral: "bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-white/5 dark:text-slate-300 dark:border-white/10",
};

export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide ${toneClasses[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      <span>{label}</span>
    </span>
  );
}
