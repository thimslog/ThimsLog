import {
  Home,
  Users,
  Phone,
  Mail,
  RotateCcw,
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
  {
    icon: Phone,
    label: "Buy Number",
    path: "/dashboard/numbers",
  },
  {
    icon: Mail,
    label: "Buy Emails",
    path: "/dashboard/emails",
  },
//   {
//     icon: RotateCcw,
//     label: "Manage Rentals",
//     path: "/dashboard/rentals",
//   },
];