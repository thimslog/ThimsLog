"use client";

import { Search, Bell, Menu } from "lucide-react";

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
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-base-bg/90 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-card border border-base-border bg-base-surface text-ink-muted hover:text-ink transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="font-display text-[17px] text-ink leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-[12.5px] text-ink-faint">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-card border border-base-border bg-base-surface px-3 py-1.5 w-64">
          <Search size={14} className="text-ink-faint" />

          <input
            placeholder="Search…"
            className="bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none w-full"
          />
        </div>

        <button
          className="h-9 w-9 flex items-center justify-center rounded-card border border-base-border bg-base-surface text-ink-muted hover:text-ink transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
