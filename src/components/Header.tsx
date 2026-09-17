'use client';

import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';

const links = [
  { label: 'Why ThimsLog', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'Process', href: '#process' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#060a14]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-xs'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link href="/" className="flex items-center justify-center group gap-0.5">
            <span>
              <Image
                src={theme === 'dark' ? '/thimslog.png' : '/thimslogblack.png'}
                alt="ThimsLog"
                width={70}
                height={70}
                className="w-12 h-12 object-contain"
              />
            </span>
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thims<span className="text-sky-600 dark:text-sky-400">Log</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon size={17} className="text-slate-700" />
              ) : (
                <Sun size={17} className="text-amber-400" />
              )}
            </button>

            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 transition-all shadow-sm hover:shadow-glow hover:-translate-y-0.5"
            >
              Create account
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="grid place-items-center w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="mx-4 mb-4 bg-white/95 dark:bg-[#0b101b]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/signin"
              className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="mt-2 px-4 py-3 text-center text-sm font-semibold rounded-xl bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950"
            >
              Create account
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
