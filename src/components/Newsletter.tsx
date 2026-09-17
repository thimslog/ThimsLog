'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 2800);
  };

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-white/[0.07] border border-slate-200 dark:border-white/10 p-8 sm:p-14 text-center shadow-xl dark:shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-sky-500/15 dark:bg-sky-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 shadow-glow">
                <Mail className="w-7 h-7" strokeWidth={2} />
              </div>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Get deal alerts first
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
                New listings, price drops, and platform updates — sent weekly.
                No spam, ever.
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 font-semibold dark:hover:bg-sky-300 transition-all shadow-sm hover:shadow-glow whitespace-nowrap cursor-pointer"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white dark:text-slate-950" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Join 12,000+ traders. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
