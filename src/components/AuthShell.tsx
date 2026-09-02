'use client';

import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative min-h-screen bg-ink-950 overflow-hidden flex items-center justify-center px-5 py-12">
      {/* Background */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-125 bg-sky-500/15 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 -right-32 w-100 h-100 bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-card">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 shadow-glow">
              <ShieldCheck className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Thims<span className="text-sky-400">Log</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
