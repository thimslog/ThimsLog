'use client';

import { ShieldCheck, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const links = [
  { label: 'Why ThimsLog', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'Process', href: '#process' },
  { label: 'Voices', href: '#voices' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong shadow-cad' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link href="/" className="flex items-center justify-center group">
            <span className="">
              <Image src="/thimslog.png" alt="ThimsLog" width={80} height={80} />
            </span>
            <span className="font-display text-3xl font-bold tracking-tight text-white">
              Thims<span className="text-sky-400">Log</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-sky-400 text-ink-950 hover:bg-sky-300 transition-all hover:shadow-glow hover:-translate-y-0.5"
            >
              Create account
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden grid place-items-center w-10 h-10 rounded-lg glass text-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="mx-4 mb-4 glass-strong rounded-2xl p-4">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-medium text-slate-200 rounded-lg hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/signin"
              className="px-4 py-3 text-sm font-medium text-slate-200 rounded-lg hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="mt-2 px-4 py-3 text-center text-sm font-semibold rounded-xl bg-sky-400 text-ink-950"
            >
              Create account
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
