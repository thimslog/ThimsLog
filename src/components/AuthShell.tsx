'use client';

import { ShieldCheck, ArrowLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '@/context/theme-context';

function AuthShellInner({
  children,
  title,
  subtitle,
  maxWidth = 'max-w-md',
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  maxWidth?: string;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#060a14] text-slate-900 dark:text-slate-200 overflow-hidden flex items-center justify-center px-5 py-12 transition-colors duration-200">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-175 h-125 bg-sky-500/10 dark:bg-sky-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-100 h-100 bg-blue-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className={`relative w-full ${maxWidth}`}>
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon size={16} className="text-slate-700" />
            ) : (
              <Sun size={16} className="text-amber-400" />
            )}
          </button>
        </div>

        <div className="bg-white/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-8">
            <Image
              src={theme === 'dark' ? '/thimslog.png' : '/thimslogblack.png'}
              alt="ThimsLog"
              width={40}
              height={40}
              className="w-9 h-9 object-contain"
            />
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thims<span className="text-sky-600 dark:text-sky-400">Log</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthShell(props: {
  children: ReactNode;
  title: string;
  subtitle: string;
  maxWidth?: string;
}) {
  return (
    <ThemeProvider>
      <AuthShellInner {...props} />
    </ThemeProvider>
  );
}
