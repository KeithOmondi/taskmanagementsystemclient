import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
  CalendarDays,
  Loader2,
  History,
  ShieldAlert,
  Timer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyTasks,
  updateTask,
  TaskStatus,
  clearTaskError,
  Task,
} from "../../store/slices/taskSlice";

type Timeframe = "yesterday" | "today" | "week" | "month" | "all";

const UserTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks = [], loading, error } = useAppSelector((state) => state.tasks);
  const [activeFilter, setActiveFilter] = useState<Timeframe>("today");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Sync Data
  useEffect(() => {
    const timeframe = activeFilter === "all" ? {} : { timeframe: activeFilter };
    dispatch(fetchMyTasks(timeframe));
  }, [dispatch, activeFilter]);

  // Global Error Handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTaskError());
    }
  }, [error, dispatch]);

  // Memoized Stats for Performance
  const stats = useMemo(
    () => ({
      pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
      active: tasks.filter((t) => t.status === TaskStatus.ACKNOWLEDGED).length,
      urgent: tasks.filter(
        (t) => t.priority === "Urgent" || t.priority === "High",
      ).length,
    }),
    [tasks],
  );

  const handleTaskAction = async (
    taskId: string,
    currentStatus: TaskStatus,
  ) => {
    if (currentStatus === TaskStatus.COMPLETED) return;

    const nextStatus =
      currentStatus === TaskStatus.PENDING
        ? TaskStatus.ACKNOWLEDGED
        : TaskStatus.COMPLETED;

    setProcessingId(taskId);
    try {
      await dispatch(updateTask({ id: taskId, status: nextStatus })).unwrap();
      toast.success(
        nextStatus === TaskStatus.ACKNOWLEDGED
          ? "Briefing Acknowledged."
          : "Mission Accomplished.",
      );
    } catch (err) {
      /* Error handled by useEffect */
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
            Mission Briefings
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Frequency: {activeFilter}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatBadge
            icon={<Clock size={14} />}
            label="Unread"
            value={stats.pending}
            color="text-blue-500"
          />
          <StatBadge
            icon={<Eye size={14} />}
            label="Active"
            value={stats.active}
            color="text-[#C69214]"
          />
          <StatBadge
            icon={<AlertCircle size={14} />}
            label="Urgent"
            value={stats.urgent}
            color="text-red-500"
          />
        </div>
      </header>

      <nav className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
        {(["yesterday", "today", "week", "month", "all"] as Timeframe[]).map(
          (time) => (
            <button
              key={time}
              onClick={() => setActiveFilter(time)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === time
                  ? "bg-white text-[#1E3A2B] shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {time}
            </button>
          ),
        )}
      </nav>

      <main className="grid gap-6">
        {loading && tasks.length === 0 ? (
          <LoadingState />
        ) : tasks.length === 0 ? (
          <EmptyState />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onAction={handleTaskAction}
              isProcessing={processingId === task._id}
            />
          ))
        )}
      </main>
    </div>
  );
};

/* ================= SUB-COMPONENTS ================= */

const TaskCard: React.FC<{
  task: Task;
  onAction: (id: string, status: TaskStatus) => void;
  isProcessing: boolean;
}> = ({ task, onAction, isProcessing }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const formattedDate = useMemo(() => {
    const dateStr = isCompleted
      ? task.completedAt || task.createdAt
      : task.dueDate;
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return {
      date: d
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        .toUpperCase(),
      time: d
        .toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase(),
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
        isCompleted
          ? "opacity-75 grayscale-[0.3]"
          : "cursor-pointer hover:shadow-2xl hover:-translate-y-1"
      } ${isProcessing ? "animate-pulse pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-8">
        <div
          className={`relative p-5 rounded-3xl transition-all duration-500 ${
            task.status === TaskStatus.ACKNOWLEDGED
              ? "bg-[#1E3A2B] text-[#C69214]"
              : isCompleted
                ? "bg-emerald-600 text-white"
                : "bg-gray-50 text-gray-300"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 size={32} />
          ) : task.isOverdue ? (
            <ShieldAlert size={32} className="text-red-500" />
          ) : (
            <Eye size={32} />
          )}
          {task.status === TaskStatus.PENDING && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-4 border-white rounded-full animate-bounce" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">
              {task.category?.name || "Intelligence"}
            </span>
            <h3
              className={`text-xl font-bold tracking-tight ${isCompleted ? "text-gray-400 line-through italic" : "text-[#1E3A2B]"}`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <History size={14} className="text-emerald-500" />
              ) : (
                <Clock size={14} />
              )}
              <span
                className={
                  isCompleted
                    ? "text-emerald-700"
                    : task.isOverdue
                      ? "text-red-600 font-black"
                      : "text-gray-600"
                }
              >
                {isCompleted ? "Finished" : "Deadline"}:{" "}
                {formattedDate
                  ? `${formattedDate.date} @ ${formattedDate.time}`
                  : "TBD"}
              </span>
            </div>

            {task.daysRemaining !== undefined && !isCompleted && (
              <div className="flex items-center gap-2 text-[#C69214]">
                <Timer size={14} />
                <span>{task.daysRemaining} Days Left</span>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border ${priorityStyles[task.priority]}`}
            >
              <AlertCircle size={12} /> {task.priority}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 min-w-[140px]">
        {!isCompleted ? (
          <button className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1E3A2B] group-hover:text-[#C69214] transition-all duration-300 border border-gray-100">
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <ChevronRight size={24} />
            )}
          </button>
        ) : (
          <div className="pr-4 text-emerald-500 opacity-60">
            <CheckCircle2 size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatBadge = ({ icon, label, value, color }: any) => (
  <div className="bg-white border border-gray-100 pl-4 pr-10 py-3.5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-2.5 rounded-xl bg-gray-50 ${color}`}>{icon}</div>
    <div className="flex flex-col text-left">
      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">
        {label}
      </span>
      <span className="text-2xl font-bold text-[#1E3A2B] leading-none mt-1.5">
        {value}
      </span>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="py-20 text-center">
    <Loader2 className="inline-block w-8 h-8 text-[#C69214] animate-spin mb-4" />
    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
      Decoding Intelligence...
    </p>
  </div>
);

const EmptyState = () => (
  <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
    <CalendarDays className="mx-auto text-gray-300 mb-4" size={48} />
    <p className="text-gray-400 font-bold italic tracking-tight text-lg">
      No objectives detected for this sector.
    </p>
  </div>
);

export default UserTasks;
