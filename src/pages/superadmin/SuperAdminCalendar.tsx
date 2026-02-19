import { useState, useMemo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  fetchGoogleCalendar,
  getGoogleAuthUrl,
} from "../../store/slices/googleTasksSlice";
import { LayoutGrid, Globe, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

const SuperAdminCalendar = () => {
  const dispatch = useAppDispatch();

  // ==============================
  // Pull state with robust fallbacks
  // ==============================
  const tasks = useAppSelector((state) => state.tasks?.tasks) || [];
  const googleTasksState = useAppSelector((state) => state.googleTasks);
  
  // Ensure we always treat events as an array
  const googleEvents = Array.isArray(googleTasksState?.events) 
    ? googleTasksState.events 
    : [];
    
  const authUrl = googleTasksState?.authUrl;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // ==============================
  // Fetch Google events on mount
  // ==============================
  useEffect(() => {
    dispatch(fetchGoogleCalendar());
  }, [dispatch]);

  // ==============================
  // Google OAuth Sync
  // ==============================
  const handleGoogleSync = async () => {
    try {
      const url = await dispatch(getGoogleAuthUrl()).unwrap();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Google Sync initiation failed", error);
    }
  };

  // ==============================
  // Task color logic
  // ==============================
  const getTaskColor = (task: any) => {
    if (task.source === "google") return "#3b82f6";
    if (task.status === "Completed") return "#10b981";
    if (task.dueDate) {
      const now = new Date().getTime();
      const deadline = new Date(task.dueDate).getTime();
      const diffInDays = (deadline - now) / (1000 * 60 * 60 * 24);
      if (diffInDays <= 2 && diffInDays >= 0) return "#ef4444";
      if (diffInDays < 0) return "#7f1d1d";
    }
    return "#1E3A2B";
  };

  // ==============================
  // Merge internal + Google events
  // ==============================
  const allEvents = useMemo(() => {
    const internal = (tasks || []).map((t: any) => ({ ...t, source: "internal" }));
    return [...internal, ...googleEvents];
  }, [tasks, googleEvents]);

  const calendarEvents = useMemo(() => {
    return allEvents.map((task: any) => ({
      id: task._id || task.id,
      title: task.title,
      start: task.dueDate ? task.dueDate.split("T")[0] : "",
      backgroundColor: getTaskColor(task),
      borderColor: "transparent",
      extendedProps: { ...task },
    }));
  }, [allEvents]);

  const activeDayTasks = useMemo(
    () =>
      allEvents.filter(
        (task: any) => task.dueDate && task.dueDate.split("T")[0] === selectedDate
      ),
    [selectedDate, allEvents]
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Premium Styling Overrides */}
      <style>{`
        .intelligence-calendar .fc { --fc-border-color: #f3f4f6; font-family: inherit; }
        .intelligence-calendar .fc-toolbar-title { font-family: serif; font-weight: 700; color: #1E3A2B; }
        .intelligence-calendar .fc-button-primary { background-color: #1E3A2B !important; border: none !important; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em; font-weight: 700; }
        .intelligence-calendar .fc-daygrid-day-number { font-size: 0.8rem; font-weight: 600; color: #9ca3af; padding: 10px !important; }
        .intelligence-calendar .fc-col-header-cell-cushion { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #6b7280; padding: 12px 0; }
        .intelligence-calendar .fc-day-today { background: #f8fafc !important; }
        .intelligence-calendar .fc-event { background: transparent !important; border: none !important; }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1E3A2B] rounded-2xl flex items-center justify-center shadow-xl rotate-3">
              <LayoutGrid size={24} className="text-[#C69214] -rotate-3" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C69214] block mb-1">
                Strategic Intelligence
              </span>
              <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
                Mission Heatmap
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 gap-6">
            {[
              { label: "Deployed", color: "bg-[#1E3A2B]" },
              { label: "Critical", color: "bg-red-500" },
              { label: "Secured", color: "bg-emerald-500" },
              { label: "External", color: "bg-blue-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {!authUrl && (
            <button
              onClick={handleGoogleSync}
              className="flex items-center gap-3 px-6 py-3.5 bg-[#1E3A2B] hover:bg-[#2a4d3a] text-white rounded-2xl transition-all shadow-lg active:scale-95 group"
            >
              <Globe size={18} className="text-[#C69214] group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Sync Google</span>
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 p-8 border border-gray-50 intelligence-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={(arg) => setSelectedDate(arg.dateStr)}
            height="700px"
            dayMaxEvents={3}
            headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
            eventContent={(info) => (
              <div className="flex items-center justify-center group cursor-pointer">
                <div
                  className="w-2 h-2 rounded-full ring-2 ring-white shadow-sm transition-all group-hover:scale-150 group-hover:ring-offset-2"
                  style={{ backgroundColor: info.event.backgroundColor }}
                />
              </div>
            )}
          />
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#1E3A2B] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <CalendarIcon size={20} className="text-[#C69214]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                  {selectedDate}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">Daily Briefing</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Active operations for the selected window.
              </p>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activeDayTasks.length > 0 ? (
                  activeDayTasks.map((task: any) => (
                    <div key={task._id || task.id} className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-1.5 h-8 rounded-full" 
                          style={{ backgroundColor: getTaskColor(task) }} 
                        />
                        <div>
                          <p className="text-sm font-bold truncate max-w-[180px]">{task.title}</p>
                          <p className="text-[10px] uppercase tracking-tighter opacity-40">{task.source}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#C69214]" />
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                    <p className="text-sm opacity-40 italic">No missions deployed</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C69214] opacity-10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCalendar;