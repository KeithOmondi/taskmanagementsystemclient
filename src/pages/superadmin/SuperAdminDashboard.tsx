import { useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Database,
  Activity,
  Server,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Eye,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAllTasks, TaskStatus } from "../../store/slices/superAdminSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { fetchCategoryTree } from "../../store/slices/categoriesSlice";

export const SuperAdminDashboard = () => {
  const dispatch = useAppDispatch();

  // --- DATA FETCHING ---
  const { tasks = [] } = useAppSelector((state) => state.superAdmin);
  const { users = [] } = useAppSelector((state) => state.user);
  const { categoryTree = [] } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchUsers({}));
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  // --- ANALYTICS DERIVATION ---
  const adminCount = users.filter((u: any) => u.role === "admin" || u.role === "superadmin").length;
  const pendingTasks = tasks.filter((t: any) => t.status === TaskStatus.PENDING).length;
  const acknowledgedTasks = tasks.filter((t: any) => t.status === TaskStatus.ACKNOWLEDGED).length;
  const completedTasks = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED).length;
  const criticalTasks = tasks.filter((t: any) => t.priority === "Urgent").length;

  // Calculate Engagement Rate (Acknowledged / Total)
  const engagementRate = tasks.length > 0 
    ? Math.round(((acknowledgedTasks + completedTasks) / tasks.length) * 100) 
    : 0;

  const stats = [
    { 
      label: "Registry Engagement", 
      value: `${engagementRate}%`, 
      icon: Eye, 
      trend: `${acknowledgedTasks} Read`, 
      color: "amber" 
    },
    { 
      label: "Total Personnel", 
      value: users.length.toLocaleString(), 
      icon: Users, 
      trend: `+${users.slice(0, 5).length} New`, 
      color: "emerald" 
    },
    { 
      label: "Active Objectives", 
      value: tasks.length.toString(), 
      icon: Database, 
      trend: pendingTasks > 0 ? `${pendingTasks} Unread` : "Fully Read", 
      color: "indigo" 
    },
    { 
      label: "Main Divisions", 
      value: categoryTree.length.toString(), 
      icon: Server, 
      trend: "Operational", 
      color: "blue" 
    },
  ];

  // Map tasks to "Recent Intelligence" feed
  const recentActivity = [...tasks].sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 5).map((task: any) => ({
    id: task._id,
    action: task.title,
    by: task.category?.name || "Unassigned Division",
    time: task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
    status: task.status,
    isUrgent: task.priority === "Urgent"
  }));

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#1E3A2B] uppercase tracking-tight">Command Center</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C69214] mt-1">
            Global Intelligence Oversight
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${criticalTasks > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              System: {criticalTasks > 0 ? "Urgent Alerts" : "Optimal"}
            </span>
          </div>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <div
            key={label}
            className="group bg-white rounded-[2.5rem] border border-gray-100 p-7 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#1E3A2B]/10 hover:-translate-y-1"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-[#C69214]/10 transition-colors duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="h-14 w-14 rounded-2xl bg-[#1E3A2B] text-[#C69214] flex items-center justify-center shadow-lg shadow-[#1E3A2B]/20">
                  <Icon size={26} />
                </div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-tighter">
                  <TrendingUp size={12} /> {trend}
                </span>
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
              <h3 className="text-4xl font-bold text-[#1E3A2B] mt-1 tracking-tighter">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN ANALYTICS SECTION --- */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Activity Feed */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-amber-50 rounded-2xl text-[#C69214]">
                 <Activity size={20} />
               </div>
               <h3 className="font-bold text-xl text-[#1E3A2B] tracking-tight">Deployment Intelligence</h3>
            </div>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-[#C69214] transition-colors">Audit Logs</button>
          </div>

          <div className="space-y-2">
            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div
                key={item.id}
                className="group py-5 px-4 flex justify-between items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/80 rounded-[1.5rem] transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={`text-[8px] font-black w-28 py-2 text-center rounded-lg uppercase tracking-widest ${
                    item.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 
                    item.status === TaskStatus.ACKNOWLEDGED ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.status}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1E3A2B] flex items-center gap-2">
                        {item.action}
                        {item.isUrgent && <AlertTriangle size={14} className="text-rose-500" />}
                    </p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Division: {item.by}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 block mb-1">{item.time}</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[#C69214] group-hover:border-[#C69214]/30 transition-all shadow-sm">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-16 text-xs font-black text-gray-300 uppercase tracking-[0.3em]">No Deployment Pulse Detected</p>
            )}
          </div>
        </div>

        {/* System Health / Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1E3A2B] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#1E3A2B]/30 relative overflow-hidden h-full">
             <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
                <ShieldCheck size={280} />
             </div>

            <h3 className="font-bold text-xl mb-8 flex items-center gap-3 relative z-10">
              <AlertTriangle size={24} className="text-[#C69214]" /> System Sentinel
            </h3>

            <div className="space-y-5 relative z-10">
              {criticalTasks > 0 ? (
                <div className="p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Immediate Attention</span>
                  </div>
                  <p className="text-xs font-medium text-rose-50/80 leading-relaxed">
                    <span className="text-white font-bold">{criticalTasks} High-Priority</span> objectives have been deployed without immediate personnel acknowledgement.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-medium text-emerald-50/70 leading-relaxed">
                    All mission-critical nodes are synchronized. No latency detected in personnel response times.
                  </p>
                </div>
              )}

              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Response Sync</span>
                    <span className="text-xs font-bold text-[#C69214]">{engagementRate}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#C69214] transition-all duration-1000" 
                        style={{ width: `${engagementRate}%` }} 
                    />
                 </div>
              </div>
            </div>
            
            <button className="w-full mt-10 py-4 bg-[#C69214] text-[#1E3A2B] font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-xl shadow-black/20">
              Broadcast System Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};