import { ArrowRight, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '18K+', label: 'Active traders' },
  { value: '64K+', label: 'Escrow deals' },
  { value: '99.8%', label: 'Delivery rate' },
];

const pills = [
  { icon: ShieldCheck, label: 'Escrow-protected' },
  { icon: BadgeCheck, label: 'Identity-verified sellers' },
  { icon: Zap, label: 'Instant handoff' },
];

export function Hero() {
  return (
    <section id="top" className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-150 bg-sky-500/15 dark:bg-sky-500/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-20 -right-32 w-100 h-100 bg-blue-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200/80 dark:border-white/10 bg-sky-50/80 dark:bg-white/5 text-xs font-medium text-sky-800 dark:text-sky-300 shadow-2xs animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75 animate-pulse-ring" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600 dark:bg-sky-400" />
            </span>
            Trusted by 18,000+ traders across 90+ countries
          </div>

          {/* Heading */}
          <h1
            className="mt-7 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Trade Digital Assets
            <br className="hidden sm:block" />{' '}
            <span className="text-gradient">Without the Risk</span>
          </h1>

          {/* Description */}
          <p
            className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            ThimsLog is the escrow-first exchange for premium accounts. Every deal is
            shielded, every seller is vetted, and every handoff happens in seconds — not days.
          </p>

          {/* Call to Actions */}
          <div
            className="mt-9 flex flex-col sm:flex-row items-center gap-3 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 font-semibold dark:hover:bg-sky-300 transition-all shadow-sm hover:shadow-glow hover:-translate-y-0.5"
            >
              Start trading free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white font-medium hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors shadow-2xs"
            >
              See how it works
            </a>
          </div>

          {/* Feature Pills */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >
            {pills.map((p) => (
              <div
                key={p.label}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
              >
                <p.icon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                {p.label}
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div
            className="mt-14 grid grid-cols-3 gap-4 sm:gap-10 w-full max-w-2xl animate-fade-up p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md shadow-xs"
            style={{ animationDelay: '400ms' }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
