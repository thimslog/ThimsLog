"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutGrid,
  ShieldCheck,
  Users,
  Boxes,
  ShoppingBag,
  Settings,
  Terminal,
  X,
  Receipt,
  LogOut,
  Loader2,
  LifeBuoy,
  MessageSquare,
  ArrowLeftRight,
  UserCircle,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/context/admin-auth-context";
import { toast } from "@/components/ui/toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarAdmin {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}

interface SidebarProps {
  admin: SidebarAdmin;
  open: boolean;
  onClose: () => void;
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: "Catalog & Sales",
    items: [
      {
        href: "/admin/inventory",
        label: "Inventory",
        icon: Boxes,
      },
      {
        href: "/admin/orders",
        label: "Order History",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        href: "/admin/transactions",
        label: "Transactions",
        icon: Receipt,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        icon: Users,
      },
      {
        href: "/admin/admins",
        label: "Admins",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        href: "/admin/tickets",
        label: "Support Tickets",
        icon: MessageSquare,
      },
      {
        href: "/admin/help-center",
        label: "Help Center",
        icon: LifeBuoy,
      },
      {
        href: "/admin/audit-logs",
        label: "Audit Logs",
        icon: ScrollText,
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];

export const Sidebar = ({ admin, open, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success("Logged out successfully");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
      window.location.href = "/admin/login";
    } finally {
      setLoggingOut(false);
    }
  };

  const adminDisplayName =
    `${admin.firstName || ""} ${admin.lastName || ""}`.trim() ||
    admin.userName ||
    "Admin";

  const formattedRole = admin.role
    ? admin.role.replaceAll("_", " ")
    : "Admin";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-[#e5e7eb] dark:border-white/10
          bg-white dark:bg-[#0b101b]

          transform transition-transform duration-300 ease-in-out

          md:translate-x-0

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-5 h-16 border-b border-[#e5e7eb] dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
              <Terminal size={18} />
            </div>

            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white">Thims Log</h1>
              <p className="text-[11px] font-semibold tracking-wide text-sky-700 dark:text-sky-400 uppercase">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                        onClick={onClose}
                        className={`
                          group flex items-center gap-2.5
                          rounded-xl px-3 py-2
                          text-[13.5px] font-medium
                          transition-colors

                          ${
                            active
                              ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          size={16}
                          className={
                            active
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
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

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-[#e5e7eb] dark:border-white/10 space-y-2 bg-slate-50/50 dark:bg-white/[0.02]">
          {/* Switch to User Account / Customer Portal */}
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/80 dark:border-sky-500/20 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Return to Customer Dashboard"
          >
            <ArrowLeftRight size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Customer Portal</span>
          </Link>

          {/* Admin User Profile */}
          <Link
            href="/admin/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group cursor-pointer"
            title="Go to Admin Settings"
          >
            <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs font-bold shrink-0">
              {admin.firstName?.[0] || "A"}
              {admin.lastName?.[0] || ""}
            </div>

            <div className="leading-tight min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 transition-colors">
                {adminDisplayName}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded-md truncate">
                  {formattedRole}
                </span>
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold py-2 px-3 rounded-xl border border-rose-200/60 dark:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut size={14} />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
