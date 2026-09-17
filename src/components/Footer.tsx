'use client';

import { Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/context/theme-context';

const quickLinks = [
  { label: 'Why ThimsLog', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'Process', href: '#process' },
];

const supportLinks = [
  'Help Center',
  'Contact Us',
  'Privacy Policy',
  'Terms of Service',
];

export function Footer() {
  const year = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="relative border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#060a14] transition-colors">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center justify-start gap-1">
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
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              The definitive marketplace for purchasing secure digital
              footprints, VPN logins, and enterprise communication accounts.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid place-items-center w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Support</h4>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {year} ThimsLog. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Escrow-first. Always.
          </p>
        </div>
      </div>
    </footer>
  );
}
