import { ShieldCheck, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Why ThimsLog", href: "#why" },
  { label: "Features", href: "#features" },
  { label: "Process", href: "#process" },
  { label: "Voices", href: "#voices" },
];
const supportLinks = [
  "Help Center",
  "Contact Us",
  "Privacy Policy",
  "Terms of Service",
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center justify-start">
              <span className="">
                <Image
                  src="/thimslog.png"
                  alt="ThimsLog"
                  width={80}
                  height={80}
                />
              </span>
              <span className="font-display text-3xl font-bold tracking-tight text-white">
                Thims<span className="text-sky-400">Log</span>
              </span>
            </Link>
            {/* <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
              The escrow-first exchange for premium digital accounts. Every deal
              shielded, every seller vetted, every handoff instant.
            </p> */}
            <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
              The definitive marketplace for purchasing secure digital
              footprints, VPN logins, and enterprise communication accounts.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid place-items-center w-9 h-9 rounded-lg glass text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {year} ThimsLog. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Escrow-first. Always.</p>
        </div>
      </div>
    </footer>
  );
}
