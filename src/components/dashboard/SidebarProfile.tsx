import Link from "next/link";
import Image from "next/image";

interface SidebarProfileProps {
  name: string;
  email: string;
  onClick?: () => void;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ name, email, onClick }) => {
  return (
    <Link
      href="/dashboard/settings"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-300 font-semibold overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
        <Image
          src="/male.jpg"
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
      </div>
    </Link>
  );
};

export default SidebarProfile;