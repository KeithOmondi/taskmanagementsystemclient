import { Bell, LogOut, User, ShieldCheck, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

export const SuperAdminHeader = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* --- LEFT SECTION: SYSTEM BREADCRUMB --- */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
            System Live
          </span>
        </div>
        <div className="h-4 w-[1px] bg-gray-200 mx-2 hidden lg:block" />
        <h1 className="font-serif font-bold text-[#1E3A2B] text-lg tracking-tight">
          Management <span className="text-[#C69214]">Console</span>
        </h1>
      </div>

      {/* --- RIGHT SECTION: OPERATOR TOOLS --- */}
      <div className="flex items-center gap-6">
        
        {/* Quick Search - Dashboard Style */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-gray-400 focus-within:border-[#C69214] transition-all">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search telemetry..." 
            className="bg-transparent border-none outline-none text-xs font-medium text-gray-600 w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-[#1E3A2B] hover:bg-gray-50 rounded-xl transition-all group">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-[#C69214] rounded-full ring-2 ring-white animate-pulse" />
        </button>

        <div className="h-8 w-[1px] bg-gray-100" />

        {/* Profile Operator Badge */}
        <div className="flex items-center gap-4 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#1E3A2B] leading-none">
              {user?.name || "System Operator"}
            </p>
            <p className="text-[9px] font-bold text-[#C69214] uppercase tracking-widest mt-1">
              {user?.role || "Super Admin"}
            </p>
          </div>

          <div className="relative group">
            <div className="h-10 w-10 bg-[#1E3A2B] rounded-xl flex items-center justify-center text-[#C69214] shadow-lg shadow-[#1E3A2B]/20 group-hover:scale-105 transition-transform cursor-pointer">
              <User size={20} strokeWidth={2.5} />
            </div>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
        </div>

        {/* Logout - Minimalist Exit */}
        <button
          onClick={() => dispatch(logout())}
          className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          title="Terminate Session"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};