import { useEffect, useState } from "react";
import { sidebarAccountLinks, sidebarHistoryLinks, sidebarLinks } from "./data";
import SidebarBrand from "./SidebarBrand";
import SidebarLink from "./SidebarLink";
import SidebarProfile from "./SidebarProfile";
import SidebarSectionLabel from "./SidebarSectionLabel";

import { LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import WhatsAppCard from "./WhatsAppCard";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";

interface SidebarUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  isAdmin?: boolean;
  adminRole?: string | null;
  createdAt: Date | string;
}

interface SidebarProps {
  user: SidebarUser;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, open = false, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [switchingToAdmin, setSwitchingToAdmin] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      window.location.href = "/signin";
    }
  };

  const handleSwitchToAdmin = async () => {
    setSwitchingToAdmin(true);
    try {
      const res = await fetch("/api/user/switch-to-admin", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = data.redirectUrl || "/admin/dashboard";
      } else {
        toast.error(data.message || "Failed to switch to admin portal");
      }
    } catch {
      window.location.href = "/admin/dashboard";
    } finally {
      setSwitchingToAdmin(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`w-64 shrink-0 bg-white dark:bg-[#0b101b] border-r border-slate-200/80 dark:border-white/10 flex flex-col fixed inset-y-0 left-0 overflow-y-auto z-50 transition-all duration-300 ease-in-out ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 shadow-none"
        }`}
      >
        <SidebarBrand onClose={onClose} />
        <SidebarProfile
          name={`${user.firstName} ${user.lastName}`}
          email={user.email}
          username={user.userName}
          onClick={onClose}
        />

        <nav className="flex-1 overflow-y-auto pb-4">
          <SidebarSectionLabel>Marketplace</SidebarSectionLabel>
          <div className="px-2 space-y-1">
            {sidebarLinks?.map((link) => (
              <SidebarLink
                key={link.path}
                icon={link.icon}
                label={link.label}
                active={pathname === link.path}
                href={link.path}
                onClick={onClose}
              />
            ))}
          </div>

          <SidebarSectionLabel>History</SidebarSectionLabel>
          <div className="px-2 space-y-1">
            {sidebarHistoryLinks?.map((link) => (
              <SidebarLink
                key={link.path}
                icon={link.icon}
                label={link.label}
                active={pathname === link.path}
                href={link.path}
                onClick={onClose}
              />
            ))}
          </div>

          <SidebarSectionLabel>Account</SidebarSectionLabel>
          <div className="px-2 space-y-1">
            {sidebarAccountLinks?.map((link) => (
              <SidebarLink
                key={link.path}
                icon={link.icon}
                label={link.label}
                active={pathname === link.path || pathname.startsWith(link.path)}
                href={link.path}
                onClick={onClose}
              />
            ))}
          </div>

          <div className="px-2 mt-8">
            <WhatsAppCard />
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 mt-auto space-y-2">
          {/* Switch to Admin Dashboard button if user is an Admin */}
          {user.isAdmin && (
            <button
              type="button"
              onClick={handleSwitchToAdmin}
              disabled={switchingToAdmin}
              className="w-full flex items-center gap-2 justify-center text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/80 dark:border-sky-500/20 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              {switchingToAdmin ? (
                <Loader2 size={15} className="animate-spin text-sky-600" />
              ) : (
                <ShieldCheck size={15} className="text-sky-600 dark:text-sky-400" />
              )}
              <span>Switch to Admin Panel</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200/60 dark:border-rose-500/20 text-sm font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

