"use client";

import { ChevronDown, Sun, Moon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/theme-context";
import NotificationBell from "./NotificationBell";

interface TopBarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userName: string;
    createdAt: Date | string;
  };
  onOpenSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onOpenSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#060a14]/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Mobile Menu Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-2xs"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon size={16} className="text-slate-700" />
          ) : (
            <Sun size={16} className="text-amber-400" />
          )}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-300 text-xs font-semibold overflow-hidden border border-slate-200 dark:border-white/10">
            {user.firstName ? (
              <Image
                src="/male.jpg"
                alt={`${user.firstName} ${user.lastName}`}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              user.firstName?.[0]?.toUpperCase()
            )}
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline-block">
            {user.firstName}
          </span>
          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
        </Link>
      </div>
    </header>
  );
};

export default TopBar;

