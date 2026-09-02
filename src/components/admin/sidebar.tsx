"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShieldCheck,
  Users,
  Boxes,
  Wifi,
  Hash,
  Settings,
  Terminal,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarAdmin{
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}

interface SidebarProps{
  admin: SidebarAdmin;
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid }],
  },
  {
    title: "Catalog",
    items: [
      {
        href: "/admin/inventory",
        label: "Inventory",
        icon: Boxes,
      },
      // { href: "/admin/inventory/vpn", label: "VPN keys", icon: Wifi },
      // {
      //   href: "/admin/inventory/textplus",
      //   label: "TextPlus numbers",
      //   icon: Hash,
      // },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({admin}) => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-[#e5e7eb]">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[#e5e7eb]">
        <div className="flex h-8 w-8 items-center justify-center rounded-card bg-brand/15 text-brand">
          <Terminal size={18} />
        </div>

        <div>
          <h1 className="font-semibold text-lg">Thims Log</h1>
          <p className="font-display text-[15px] tracking-tight text-sky-800">
            Admin Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-2.5 rounded-card px-2.5 py-2 text-[13.5px] transition-colors ${
                        active
                          ? "bg-brand-soft text-ink"
                          : "text-ink-muted hover:bg-base-elevated hover:text-ink"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          active
                            ? "text-brand"
                            : "text-ink-faint group-hover:text-ink-muted"
                        }
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2.5 rounded-card px-2.5 py-2">
          <div className="h-8 w-8 rounded-full bg-base-elevated flex items-center justify-center text-[12px] font-mono text-ink-muted">
            SA
          </div>
          <div className="leading-tight">
            <p className="text-[13px] text-sky font-medium">{admin.role.replaceAll("_", " ")}</p>
            <p className="text-[11px] text-ink-faint">{admin.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
