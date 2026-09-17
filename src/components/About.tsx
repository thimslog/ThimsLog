import { ShieldCheck, BadgeCheck, Zap } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Escrow by Default',
    body: 'Funds are locked the moment you commit. They only release when you confirm the asset is in your hands — no exceptions.',
  },
  {
    icon: BadgeCheck,
    title: 'Seller Vetting',
    body: 'Every seller passes identity checks and a history review before they can list. You trade with people, not anonymous handles.',
  },
  {
    icon: Zap,
    title: 'Instant Handoff',
    body: 'Credentials and access are delivered through our secure channel the second the escrow clears. No waiting, no chasing.',
  },
];

export function About() {
  return (
    <section id="why" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            Why ThimsLog
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Built for people who got burned elsewhere.
          </h2>
          <p className="mt-5 text-slate-600 dark:text-slate-400 leading-relaxed text-base sm:text-lg">
            Most marketplaces leave you to trust a stranger and hope. ThimsLog removes the
            hope — every transaction is structured so neither side can lose.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="group relative h-full p-7 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/20 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <div className="grid place-items-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 ring-1 ring-sky-200/80 dark:ring-sky-400/20 group-hover:bg-sky-600 group-hover:ring-sky-600 dark:group-hover:bg-sky-400 dark:group-hover:ring-sky-300 transition-all duration-300">
                    <p.icon className="w-6 h-6 text-sky-600 group-hover:text-white dark:text-sky-400 dark:group-hover:text-slate-950 transition-colors" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
