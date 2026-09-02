"use client";

import { Search, Bell } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-base-bg/90 backdrop-blur px-6">
      <div>
        <h1 className="font-display text-[17px] text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-[12.5px] text-ink-faint">{subtitle}</p>}
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
