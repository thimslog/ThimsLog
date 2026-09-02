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

const colorMap: Record<string, { bg: string; ring: string; text: string; hoverBg: string; badge: string }> = {
  sky: { bg: 'bg-sky-500/10', ring: 'ring-sky-400/20', text: 'text-sky-400', hoverBg: 'group-hover:bg-sky-400', badge: 'bg-sky-500/10 text-sky-300' },
  cyan: { bg: 'bg-cyan-500/10', ring: 'ring-cyan-400/20', text: 'text-cyan-400', hoverBg: 'group-hover:bg-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300' },
  blue: { bg: 'bg-blue-500/10', ring: 'ring-blue-400/20', text: 'text-blue-400', hoverBg: 'group-hover:bg-blue-400', badge: 'bg-blue-500/10 text-blue-300' },
  amber: { bg: 'bg-amber-500/10', ring: 'ring-amber-400/20', text: 'text-amber-400', hoverBg: 'group-hover:bg-amber-400', badge: 'bg-amber-500/10 text-amber-300' },
  rose: { bg: 'bg-rose-500/10', ring: 'ring-rose-400/20', text: 'text-rose-400', hoverBg: 'group-hover:bg-rose-400', badge: 'bg-rose-500/10 text-rose-300' },
  teal: { bg: 'bg-teal-500/10', ring: 'ring-teal-400/20', text: 'text-teal-400', hoverBg: 'group-hover:bg-teal-400', badge: 'bg-teal-500/10 text-teal-300' },
};

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/50 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            What you get
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Every tool a serious trader needs
          </h2>
          <p className="mt-5 text-slate-400">
            Six systems working together so you can focus on the deal, not the danger.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group relative h-full p-7 rounded-2xl glass border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
                  <div className="relative flex items-start justify-between">
                    <div className={`grid place-items-center w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} ${c.hoverBg} transition-all duration-300`}>
                      <f.icon className={`w-6 h-6 ${c.text} group-hover:text-ink-950 transition-colors`} strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${c.badge}`}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="relative mt-5 font-display text-xl font-bold text-white">
                    {f.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm text-slate-400 leading-relaxed">
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
