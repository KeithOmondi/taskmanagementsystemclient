import React, { useEffect } from "react";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyTasks } from "../../store/slices/taskSlice";
import { updateTask } from "../../store/slices/superAdminSlice"; 
import { toast } from "react-hot-toast";

// Updated status object - refined for active deployment
export const TaskStatus = {
  PENDING: "Pending",
  ACKNOWLEDGED: "Acknowledged",
  COMPLETED: "Completed",
} as const;

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

const SuperAdminTask: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks = [], loading } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (user) {
      dispatch(fetchMyTasks());
    }
  }, [dispatch, user]);

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatusType) => {
    dispatch(updateTask({ id: taskId, updates: { status: newStatus } }))
      .unwrap()
      .then(() => toast.success("Command Synchronized"))
      .catch((err) => toast.error(err));
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "TBD", time: "" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }).toUpperCase();
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: true
    }).toUpperCase();
    return { date: formattedDate, time: formattedTime };
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C69214]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
          Syncing Personnel Objectives...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-gray-100 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-12 bg-[#C69214]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C69214]">
            Personal Briefing
          </span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
          Assigned Objectives
        </h1>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
          <CheckCircle2 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            No active deployments assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task: any) => {
            const isCompleted = task.status === TaskStatus.COMPLETED;
            const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate).getTime() < Date.now();
            const { date, time } = formatDateTime(task.dueDate);

            return (
              <div 
                key={task._id} 
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-[#C69214]/20 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-6">
                  {/* TACTICAL STATUS DROPDOWN */}
                  <div className="relative inline-block">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value as TaskStatusType)}
                      className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all border-none outline-none ring-1 ${
                        isCompleted 
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200" 
                          : "bg-amber-50 text-[#C69214] ring-amber-200"
                      }`}
                    >
                      {Object.values(TaskStatus).map((status) => (
                        <option key={status} value={status} className="bg-white text-[#1E3A2B]">
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>

                  {isOverdue && (
                    <div className="flex items-center gap-1 text-red-500 animate-pulse">
                      <AlertCircle size={14} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Deadline Breach</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl font-serif font-bold text-[#1E3A2B] group-hover:text-[#C69214] transition-colors">
                    {task.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {task.description || "No tactical description provided for this objective."}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                  <div className="space-y-1">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Target Timeline</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#C69214]" />
                        <span className="text-[10px] font-mono font-bold text-[#1E3A2B]">{date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-[9px] font-mono text-gray-500">{time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuperAdminTask;