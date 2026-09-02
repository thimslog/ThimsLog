import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

interface TopBarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userName: string;
    createdAt: Date | string;
  };
}

const TopBar: React.FC<TopBarProps> = ({ user }) => {
  return (
    <header className="flex items-center justify-end gap-4 px-8 py-4">
      <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100">
        <Bell size={18} className="text-slate-600" />
        <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>
      <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100">
        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-semibold">
          {user.firstName ? (
            <Image
              src="/male.jpg"
              alt={`${user.firstName} ${user.lastName}`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            user.firstName?.[0]?.toUpperCase()
          )}
        </div>
        <ChevronDown size={16} className="text-slate-500" />
      </button>
    </header>
  );
};

export default TopBar;
