import {
  Home,
  Users,
  Phone,
  Mail,
  RotateCcw,
  ListChecks,
  Wallet,
  UserCircle,
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
  // {
  //   icon: Phone,
  //   label: "Buy Number",
  //   path: "/dashboard/numbers",
  // },
  // {
  //   icon: Mail,
  //   label: "Buy Emails",
  //   path: "/dashboard/emails",
  // },
  //   {
  //     icon: RotateCcw,
  //     label: "Manage Rentals",
  //     path: "/dashboard/rentals",
  //   },
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
];

export const sidebarAccountLinks: {
  icon: LucideIcon;
  label: string;
  path: string;
}[] = [
  {
    icon: UserCircle,
    label: "Profile Settings",
    path: "/dashboard/settings",
  },
];

