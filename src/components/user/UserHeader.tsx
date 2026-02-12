import React from "react";
import { Bell, Menu, UserCircle, Search as SearchIcon } from "lucide-react";

interface UserHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuClick, userName = "Public User" }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 h-20 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu size={22} />
        </button>
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Quick record search..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-xs w-64 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 hidden sm:block">{userName}</span>
          <div className="w-9 h-9 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;