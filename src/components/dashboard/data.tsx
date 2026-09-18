import {
  Home,
  Users,
  Phone,
  Mail,
  RotateCcw,
  ListChecks,
  Wallet,
  Bell,
  UserCircle,
  LifeBuoy,
  Gift,
  type LucideIcon,
} from "lucide-react";

export const sidebarLinks: {
  icon: LucideIcon;
  label: string;
  path: string;
}[] = [
  {
    icon: Home,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: Users,
    label: "Buy Social Accounts",
    path: "/dashboard/products",
  },
];

export const sidebarHistoryLinks: {
  icon: LucideIcon;
  label: string;
  path: string;
}[] = [
  {
    icon: RotateCcw,
    label: "Order History",
    path: "/dashboard/order-history",
  },
  {
    icon: ListChecks,
    label: "Transactions",
    path: "/dashboard/transactions",
  },
  {
    icon: Wallet,
    label: "Wallet",
    path: "/dashboard/wallet",
  },
  {
    icon: Gift,
    label: "Refer & Earn",
    path: "/dashboard/referrals",
  },
];

export const sidebarAccountLinks: {
  icon: LucideIcon;
  label: string;
  path: string;
}[] = [
  {
    icon: Bell,
    label: "Notifications",
    path: "/dashboard/notifications",
  },
  {
    icon: UserCircle,
    label: "Profile Settings",
    path: "/dashboard/settings",
  },
  {
    icon: LifeBuoy,
    label: "Help Center",
    path: "/dashboard/help-center",
  },
];


