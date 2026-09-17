import { useEffect } from "react";
import { sidebarAccountLinks, sidebarHistoryLinks, sidebarLinks } from "./data";
import SidebarBrand from "./SidebarBrand";
import SidebarLink from "./SidebarLink";
import SidebarProfile from "./SidebarProfile";
import SidebarSectionLabel from "./SidebarSectionLabel";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import WhatsAppCard from "./WhatsAppCard";
import { useAuth } from "@/context/auth-context";

interface SidebarUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
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

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
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

        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 mt-auto">
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

