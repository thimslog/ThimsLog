import {
  ShieldCheck,
  MessageSquare,
  LayoutGrid,
  Lock,
  Star,
  Wallet,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const features = [
  {
    icon: ShieldCheck,
    title: 'Escrow Shield',
    body: 'Funds sit in a neutral vault until you confirm delivery. Disputes are resolved by our team within 24 hours.',
    badge: 'Core',
    color: 'sky',
  },
  {
    icon: MessageSquare,
    title: 'Encrypted Chat',
    body: 'Negotiate directly with sellers in end-to-end encrypted messages. Your conversation never leaves the platform.',
    badge: 'Live',
    color: 'cyan',
  },
  {
    icon: LayoutGrid,
    title: 'Curated Listings',
    body: 'Smart categories and filters help you find the exact account you need in seconds, not hours.',
    badge: 'Browse',
    color: 'blue',
  },
  {
    icon: Lock,
    title: 'Dispute Resolution',
    body: 'Something went wrong? Our mediation team reviews evidence and refunds you within one business day.',
    badge: 'Safe',
    color: 'amber',
  },
  {
    icon: Star,
    title: 'Reputation Engine',
    body: 'Every trader carries a transparent history of deals, ratings, and response times. No hidden feedback.',
    badge: 'Rated',
    color: 'rose',
  },
  {
    icon: Wallet,
    title: 'Vault Wallet',
    body: 'Load your balance once and checkout in a single tap. No re-entering card details on every purchase.',
    badge: 'Pay',
    color: 'teal',
  },
];

const colorMap: Record<
  string,
  { bg: string; ring: string; text: string; hoverBg: string; badge: string }
> = {
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    ring: 'ring-sky-200 dark:ring-sky-400/20',
    text: 'text-sky-600 dark:text-sky-400',
    hoverBg: 'group-hover:bg-sky-600 group-hover:text-white dark:group-hover:bg-sky-400 dark:group-hover:text-slate-950',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 border border-sky-100 dark:border-transparent',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    ring: 'ring-cyan-200 dark:ring-cyan-400/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    hoverBg: 'group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 border border-cyan-100 dark:border-transparent',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    ring: 'ring-blue-200 dark:ring-blue-400/20',
    text: 'text-blue-600 dark:text-blue-400',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-slate-950',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-transparent',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'ring-amber-200 dark:ring-amber-400/20',
    text: 'text-amber-600 dark:text-amber-400',
    hoverBg: 'group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-400 dark:group-hover:text-slate-950',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-100 dark:border-transparent',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    ring: 'ring-rose-200 dark:ring-rose-400/20',
    text: 'text-rose-600 dark:text-rose-400',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-400 dark:group-hover:text-slate-950',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-100 dark:border-transparent',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    ring: 'ring-teal-200 dark:ring-teal-400/20',
    text: 'text-teal-600 dark:text-teal-400',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-400 dark:group-hover:text-slate-950',
    badge: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 border border-teal-100 dark:border-transparent',
  },
};

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            What you get
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Every tool a serious trader needs
          </h2>
          <p className="mt-5 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Six systems working together so you can focus on the deal, not the danger.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group relative h-full p-7 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/20 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
                  <div className="relative flex items-start justify-between">
                    <div
                      className={`grid place-items-center w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} ${c.hoverBg} transition-all duration-300`}
                    >
                      <f.icon
                        className={`w-6 h-6 ${c.text} transition-colors`}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${c.badge}`}
                    >
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="relative mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
