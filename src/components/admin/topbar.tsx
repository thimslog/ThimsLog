"use client";

import Link from "next/link";
import { Search, Bell, Menu, Sun, Moon, ArrowLeftRight } from "lucide-react";
import { useAdminTheme } from "@/context/admin-theme-context";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export function Topbar({
  title = "Dashboard",
  subtitle,
  onMenuClick,
}: TopbarProps) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#060a14]/80 backdrop-blur-md px-4 md:px-6 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Switch to Customer App */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Switch to Customer Dashboard"
        >
          <ArrowLeftRight size={13} className="text-sky-400 dark:text-sky-600" />
          <span>Customer App</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 w-52 md:w-64 shadow-2xs">
          <Search size={14} className="text-slate-400" />

          <input
            placeholder="Search…"
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none w-full"
          />
        </div>

        {/* Theme Toggle (Admin) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          aria-label="Toggle Admin Theme"
        >
          {theme === "light" ? (
            <Moon size={16} className="text-slate-700" />
          ) : (
            <Sun size={16} className="text-amber-400" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
