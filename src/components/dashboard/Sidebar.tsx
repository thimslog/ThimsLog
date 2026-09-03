import { sidebarLinks } from "./data";
import SidebarBrand from "./SidebarBrand";
import SidebarLink from "./SidebarLink";
import SidebarProfile from "./SidebarProfile";
import SidebarSectionLabel from "./SidebarSectionLabel";

import {
  RotateCcw,
  ListChecks,
  Wallet,
  UserCircle,
  LogOut,
} from "lucide-react";

import { usePathname } from "next/navigation";
import WhatsAppCard from "./WhatsAppCard";

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
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col fixed overflow-y-scroll">
      <SidebarBrand />
      <SidebarProfile
        name={`${user.firstName} ${user.lastName}`}
        email={user.email}
      />

      <nav className="flex-1 overflow-y-auto pb-4">
        <SidebarSectionLabel>Marketplace</SidebarSectionLabel>
        <div className="px-2 space-y-1">
          {sidebarLinks.map((link) => (
            <SidebarLink
              key={link.path}
              icon={link.icon}
              label={link.label}
              active={pathname === link.path}
              href={link.path}
            />
          ))}
        </div>

        <SidebarSectionLabel>History</SidebarSectionLabel>
        <div className="px-2 space-y-1">
          <SidebarLink icon={RotateCcw} label="Order History" />
          <SidebarLink icon={ListChecks} label="Transactions" />
          <SidebarLink icon={Wallet} label="Wallet" />
        </div>

        <SidebarSectionLabel>Account</SidebarSectionLabel>
        <div className="px-2 space-y-1">
          <SidebarLink icon={UserCircle} label="Profile Settings" />
        </div>

        <div className="px-2 mt-8">
          <WhatsAppCard />
        </div>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button className="w-full flex items-center gap-2 justify-center text-red-500 bg-red-50 hover:bg-red-100 text-sm font-medium py-2.5 rounded-lg transition-colors">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
