import { Search, MessagesSquare, CreditCard, PackageCheck } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    body: 'Browse curated listings across every major platform. Filter by price, rating, and verification level to find your match.',
  },
  {
    icon: MessagesSquare,
    step: '02',
    title: 'Negotiate',
    body: 'Open an encrypted chat with the seller. Ask questions, agree on terms, and lock in the deal — all on-platform.',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Fund Escrow',
    body: 'Pay into the ThimsLog escrow. The seller sees the funds are locked but cannot touch them until you confirm delivery.',
  },
  {
    icon: PackageCheck,
    step: '04',
    title: 'Receive & Release',
    body: 'Get your credentials through our secure channel. Once you confirm everything checks out, the escrow releases automatically.',
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
            The process
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Four steps. Zero guesswork.
          </h2>
          <p className="mt-5 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            From discovery to delivery, the entire flow is designed to protect you at every turn.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 120}>
              <div className="group relative h-full">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-sky-400/50 to-transparent" />
                )}

                <div className="relative p-7 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/20 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 h-full">
                  <div className="flex items-center justify-between">
                    <div className="grid place-items-center w-12 h-12 rounded-xl bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <s.icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <span className="font-display text-5xl font-extrabold text-slate-200 dark:text-white/5 group-hover:text-sky-200 dark:group-hover:text-white/10 transition-colors">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
