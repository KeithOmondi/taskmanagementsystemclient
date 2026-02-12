import React, { useEffect, useMemo } from "react";
import { 
  History, 
  LayoutGrid, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom"; 
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyTasks, TaskStatus, type Task } from "../../store/slices/taskSlice";

/* =====================================
    INTERNAL COMPONENT: TaskCard
   ===================================== */
const TaskCard: React.FC<{ 
  task: Task; 
  onAction: (id: string, status: TaskStatus) => void; 
  isProcessing: boolean;
}> = ({ task, onAction, isProcessing }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  
  const formattedDate = useMemo(() => {
    const dateStr = isCompleted ? (task.completedAt || task.createdAt) : task.dueDate;
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }).toUpperCase(),
      time: d.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
    };
  }, [task, isCompleted]);

  const priorityStyles = {
    Urgent: "text-red-500 bg-red-50 border-red-100",
    High: "text-amber-600 bg-amber-50 border-amber-100",
    Medium: "text-gray-400 bg-gray-50 border-gray-100",
    Low: "text-gray-400 bg-gray-50 border-gray-100",
  };

  return (
    <div 
      onClick={() => onAction(task._id, task.status)}
      className={`group bg-white border border-gray-100 p-7 rounded-[2.5rem] shadow-sm transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isCompleted ? "opacity-75 grayscale-[0.3]" : "cursor-pointer hover:shadow-2xl hover:-translate-y-1"
      } ${isProcessing ? "animate-pulse pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-8">
        <div className={`relative p-5 rounded-3xl transition-all duration-500 ${
          task.status === TaskStatus.ACKNOWLEDGED ? "bg-[#1E3A2B] text-[#C69214]" : 
          isCompleted ? "bg-emerald-600 text-white" : "bg-gray-50 text-gray-300"
        }`}>
          {isCompleted ? <CheckCircle2 size={32} /> : task.isOverdue ? <ShieldAlert size={32} className="text-red-500" /> : <Eye size={32} />}
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">
              {task.category?.name || "Intelligence"}
            </span>
            <h3 className={`text-xl font-bold tracking-tight ${isCompleted ? "text-gray-400 line-through italic" : "text-[#1E3A2B]"}`}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              {isCompleted ? <History size={14} className="text-emerald-500" /> : <Clock size={14} />}
              <span className={isCompleted ? "text-emerald-700" : "text-gray-600"}>
                {isCompleted ? "Finished" : "Deadline"}: {formattedDate ? `${formattedDate.date} @ ${formattedDate.time}` : "TBD"}
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border ${priorityStyles[task.priority] || priorityStyles.Medium}`}>
              <AlertCircle size={12} /> {task.priority}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 min-w-[140px]">
        {isCompleted && (
          <div className="pr-4 text-emerald-500 opacity-60">
            <CheckCircle2 size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

/* =====================================
    MAIN COMPONENT: UserComplete
   ===================================== */
const UserComplete: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks = [], loading } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    // Fetch only completed tasks using the query param established in the slice
    dispatch(fetchMyTasks({ status: TaskStatus.COMPLETED }));
  }, [dispatch]);

  const completedTasks = useMemo(() => 
    tasks.filter(t => t.status === TaskStatus.COMPLETED),
    [tasks]
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-4">
          <Link 
            to="/tasks" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1E3A2B] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Active Briefings
          </Link>
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
              Mission Archives
            </h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              Verified Objectives & Historical Data
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 px-6 py-4 rounded-[2rem] shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none">Total Resolved</span>
            <span className="text-2xl font-bold text-[#1E3A2B] mt-1">{completedTasks.length}</span>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="grid gap-6">
        {loading && completedTasks.length === 0 ? (
          <div className="py-24 text-center">
            <Loader2 className="inline-block w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Secure Archives...</p>
          </div>
        ) : completedTasks.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/40 rounded-[3.5rem] border-2 border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
              <LayoutGrid className="text-gray-300" size={32} />
            </div>
            <p className="text-[#1E3A2B] font-bold text-xl tracking-tight">Archives Empty</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto italic text-center">
              No historical records found for completed objectives in this sector.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex items-center gap-4 px-4">
              <History size={16} className="text-gray-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Timeline of Success</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            
            {completedTasks.map((task) => (
              <TaskCard
                key={task._id} 
                task={task} 
                onAction={() => {}} 
                isProcessing={false} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserComplete;