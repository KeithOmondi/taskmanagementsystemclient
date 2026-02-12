import { NavLink } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export const SuperAdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/super-admin" },
  { name: "Assign Tasks", icon: LayoutDashboard, path: "/super-admin/tasks" },
  { name: "Completed Tasks", icon: Users, path: "/super-admin/submitted" },
];


  return (
    <aside
      className={`h-screen bg-[#0F1A13] text-white border-r border-[#1E3A2B] transition-all duration-500 ease-in-out flex flex-col relative z-50 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Collapse Toggle Button - Floating Style */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-[#C69214] text-[#1E3A2B] rounded-full p-1 border-2 border-[#0F1A13] hover:scale-110 transition-transform shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* --- LOGO SECTION --- */}
      <div className="flex items-center px-6 h-24 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#1E3A2B] p-2 rounded-xl border border-[#C69214]/30">
            <Shield className="text-[#C69214]" size={24} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight leading-none">
                TMS <span className="text-[#C69214]">CORE</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mt-1">
                Super User
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 px-4 space-y-2">
        {links.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "bg-[#1E3A2B] text-white shadow-inner"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {/* Active Indicator Bar */}
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={`${
                    isActive ? "text-[#C69214]" : "group-hover:text-white"
                  } transition-colors`}
                />
                {!collapsed && (
                  <span className="text-sm font-bold tracking-wide leading-none pt-0.5">
                    {name}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#C69214] rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER / LOGOUT --- */}
      <div className="p-4 border-t border-[#1E3A2B]">
        <button className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-colors group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {!collapsed && <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>}
        </button>
      </div>
    </aside>
  );
};