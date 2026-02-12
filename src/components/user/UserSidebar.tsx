import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  Book, 
  User as UserIcon, 
  HelpCircle, 
  type LucideIcon 
} from "lucide-react";

interface UserSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

interface UserMenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const userMenuItems: UserMenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/user" },
  { name: "Assigned Tasks", icon: Search, path: "/user/assigned" },
  { name: "Completed Work", icon: Book, path: "/user/complete" },
  { name: "Profile", icon: UserIcon, path: "/user/profile" },
];

const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen, toggle }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={toggle} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white text-slate-600
        flex flex-col transition-all duration-300 ease-in-out
        border-r border-slate-200 shadow-xl
        ${isOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"} 
        lg:sticky lg:top-0 lg:h-screen
      `}>
        <div className={`h-20 flex items-center border-b border-slate-100 ${isOpen ? "px-6" : "justify-center"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            {isOpen && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">User Portal</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">T.M.S</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {userMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/user"} // Ensures Dashboard isn't always active
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={({ isActive }) => `
                flex items-center rounded-xl transition-all duration-200 group relative
                ${isOpen ? "px-4 py-3.5 gap-4" : "p-3.5 justify-center"}
                ${isActive 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "hover:bg-slate-50 text-slate-500"}
              `}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-xs uppercase tracking-wide">{item.name}</span>}
              {!isOpen && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className={`flex items-center gap-3 w-full text-slate-400 hover:text-emerald-600 transition-colors ${!isOpen && "justify-center"}`}>
            <HelpCircle size={20} />
            {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">Help Center</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;