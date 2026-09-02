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
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-150 bg-sky-500/20 blur-[140px] rounded-full" />
      <div className="absolute top-20 -right-32 w-100 h-100 bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-sky-300 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-pulse-ring" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
            Trusted by 18,000+ traders across 90+ countries
          </div>

          <h1
            className="mt-7 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Trade Digital Assets
            <br className="hidden sm:block" />{' '}
            <span className="text-gradient">Without the Risk</span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            ThimsLog is the escrow-first exchange for premium accounts. Every deal is
            shielded, every seller is vetted, and every handoff happens in seconds — not days.
          </p>

          <div
            className="mt-9 flex flex-col sm:flex-row items-center gap-3 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-400 text-ink-950 font-semibold hover:bg-sky-300 transition-all hover:shadow-glow hover:-translate-y-0.5"
            >
              Start trading free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass text-white font-medium hover:bg-white/10 transition-colors"
            >
              See how it works
            </a>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >
            {pills.map((p) => (
              <div
                key={p.label}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass text-xs font-medium text-slate-300"
              >
                <p.icon className="w-3.5 h-3.5 text-sky-400" />
                {p.label}
              </div>
            ))}
          </div>

          <div
            className="mt-14 grid grid-cols-3 gap-4 sm:gap-10 w-full max-w-2xl animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl sm:text-4xl font-bold text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
