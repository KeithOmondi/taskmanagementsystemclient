import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  X,
  Settings2,
  ChevronDown,
  Layers,
  Loader2,
  Calendar,
  Clock,
  Edit3,
  Zap,
  AlertCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllTasks,
  createTask,
  updateTask,
  TaskStatus,
  TaskPriority,
} from "../../store/slices/superAdminSlice";
import { fetchUsers } from "../../store/slices/userSlice";

import SuperAdminAddCategoryModal from "./SuperAdminAddCategoryModal";
import { fetchCategoryTree } from "../../store/slices/categoriesSlice";

/* ============================================================
    GROUPING & SORTING LOGIC
============================================================ */
const getGroupedRegistry = (tasks: any[], tree: any[]) => {
  const registry: Record<string, { name: string; tasks: any[] }> = {};
  if (!Array.isArray(tasks) || tasks.length === 0) return registry;

  const categoryMap: Record<
    string,
    { parentName: string; parentId: string; ownName: string }
  > = {};

  tree.forEach((parent: any) => {
    const pName = (parent.name || "Unknown Division").toUpperCase();
    const pId = parent._id?.toString();
    categoryMap[pId] = { parentName: pName, parentId: pId, ownName: pName };

    if (Array.isArray(parent.children)) {
      parent.children.forEach((child: any) => {
        const cId = (child._id || child)?.toString();
        const cName = (child.name || pName).toUpperCase();
        categoryMap[cId] = { parentName: pName, parentId: pId, ownName: cName };
      });
    }
  });

  tasks.forEach((task: any) => {
    const taskCatId = (task.category?._id || task.category)?.toString();
    const lookup = categoryMap[taskCatId];
    const groupId = lookup?.parentId || "unassigned";
    const groupName = lookup?.parentName || "GENERAL REGISTRY";

    if (!registry[groupId]) {
      registry[groupId] = { name: groupName, tasks: [] };
    }

    registry[groupId].tasks.push({
      ...task,
      displayCategoryName: lookup?.ownName || "General Sector",
    });
  });

  Object.values(registry).forEach((group) => {
    group.tasks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  });

  return registry;
};

const SuperAdminTasks: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const { tasks = [], loading } = useAppSelector((state) => state.superAdmin);
  const { users = [] } = useAppSelector((state) => state.user);
  const { categoryTree = [] } = useAppSelector((state) => state.categories);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [parentCatId, setParentCatId] = useState("");
  const [subCatId, setSubCatId] = useState("");
  
  // Timelines (Date + Time)
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("17:00");

  const statusOrder = [
    TaskStatus.PENDING,
    TaskStatus.ACKNOWLEDGED,
    TaskStatus.COMPLETED,
  ];

  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchUsers({}));
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  const groupedTasks = useMemo(() => {
    const grouped = getGroupedRegistry(tasks, categoryTree);
    return Object.fromEntries(
      Object.entries(grouped).sort(([, a], [, b]) =>
        a.name.localeCompare(b.name),
      ),
    );
  }, [tasks, categoryTree]);

  const availableSubCategories = useMemo(() => {
    if (!parentCatId || !Array.isArray(categoryTree)) return [];
    const parent = categoryTree.find((c) => c._id?.toString() === parentCatId);
    return [...(parent?.children || [])].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [parentCatId, categoryTree]);

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    dispatch(updateTask({ id: taskId, updates: { status: newStatus } }))
      .unwrap()
      .then(() => toast.success("Sector Synchronized"))
      .catch((err) => toast.error(err));
  };

 const handleCreateTask = async () => {
  // 1. Determine the category
  let finalCategoryId = subCatId || parentCatId;

  // 2. BACKEND WORKAROUND:
  // If no category is selected and we are in manual mode, 
  // we look for a 'General' category in your tree to satisfy the DB requirement.
  if (!finalCategoryId && isManualMode) {
    const generalCat = categoryTree.find(
      (c: any) => c.name.toLowerCase().includes("general") || c.name.toLowerCase().includes("misc")
    );
    finalCategoryId = generalCat?._id || categoryTree[0]?._id; // Fallback to the first available category
  }

  // 3. Validation
  if (!finalCategoryId) {
    return toast.error("Database requires a Division assignment.");
  }

  let finalTitle = isManualMode ? title : "";
  
  // 4. Auto-Title Logic (only if not manual)
  if (!isManualMode) {
    const parent = categoryTree.find((c: any) => c._id?.toString() === parentCatId);
    if (subCatId && parent?.children) {
      const child = parent.children.find((ch: any) => ch._id?.toString() === subCatId);
      finalTitle = child?.name || "General Objective";
    } else if (parent) {
      finalTitle = parent.name || "General Objective";
    }
  }

  if (!finalTitle) return toast.error("Objective Title required");

  // 5. Execution
  const formData = new FormData();
  formData.append("title", finalTitle.toUpperCase());
  formData.append("description", description);
  formData.append("category", finalCategoryId); // This is now guaranteed to have a value
  formData.append("priority", TaskPriority.MEDIUM);
  formData.append("status", TaskStatus.PENDING);
  formData.append("startDate", startDate ? `${startDate}T${startTime}:00` : "");
  formData.append("dueDate", dueDate ? `${dueDate}T${dueTime}:00` : "");
  formData.append("assignedTo", JSON.stringify(assignedTo));

  dispatch(createTask(formData))
    .unwrap()
    .then(() => {
      toast.success("Intelligence Logged");
      resetForm();
    })
    .catch((err) => toast.error(err));
};

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo([]);
    setParentCatId("");
    setSubCatId("");
    setStartDate("");
    setDueDate("");
    setStartTime("09:00");
    setDueTime("17:00");
    setIsModalOpen(false);
    setIsManualMode(false);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: "NOT SET", time: "" };
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
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C69214]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
          Synchronizing Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-12 bg-[#C69214]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C69214]">
              Intelligence Command
            </span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight">
            Deployment Registry
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-3 bg-white border border-gray-200 text-[#1E3A2B] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all"
          >
            <Settings2 size={16} /> Structure
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-[#1E3A2B] text-white px-8 py-4 rounded-2xl shadow-xl shadow-[#1E3A2B]/20 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={18} className="text-[#C69214]" /> Deploy Objective
          </button>
        </div>
      </header>

      <div className="space-y-16">
        {Object.entries(groupedTasks).map(([groupId, group]) => (
          <div key={groupId} className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-[#C69214] pl-6 py-1">
              <div className="flex items-center gap-4">
                <Layers className="text-[#1E3A2B]" size={20} />
                <h2 className="text-xl font-serif font-bold text-[#1E3A2B] tracking-wide">
                  {group.name}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 bg-gray-50/50">
                      <th className="px-8 py-5">Objective</th>
                      <th className="px-6 py-5">Sub-Sector</th>
                      <th className="px-6 py-5">Personnel</th>
                      <th className="px-6 py-5">Operational Timeline</th>
                      <th className="px-8 py-5 text-right">Operational Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.tasks?.map((task: any) => {
                      const isCompleted = task.status === TaskStatus.COMPLETED;
                      const overdue = task.isOverdue || (task.dueDate && new Date(task.dueDate).getTime() < Date.now() && !isCompleted);
                      const currentStatusIndex = statusOrder.indexOf(task.status);
                      const targetTimestamp = isCompleted ? (task.completedAt || task.updatedAt) : task.dueDate;
                      const { date, time } = formatDateTime(targetTimestamp);

                      return (
                        <tr key={task._id} className="group hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${isCompleted ? "bg-emerald-500" : overdue ? "bg-red-500" : "bg-amber-400 animate-pulse"}`} />
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1E3A2B] text-sm tracking-tight uppercase">
                                  {task.title}
                                </span>
                                {overdue && (
                                  <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">
                                    Breach Detected
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100/50 px-2 py-1 rounded">
                              {task.displayCategoryName}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex -space-x-2">
                              {task.assignedTo?.map((u: any, i: number) => (
                                <div key={i} title={u?.name} className="w-8 h-8 rounded-full bg-[#1E3A2B] border-2 border-white flex items-center justify-center text-[8px] text-[#C69214] font-black uppercase">
                                  {u?.name?.substring(0, 2)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                {isCompleted ? "Marked Complete" : "Deadline Target"}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={12} className={isCompleted ? "text-emerald-500" : "text-[#C69214]"} />
                                  <span className={`text-[11px] font-mono font-bold ${isCompleted ? "text-emerald-700" : overdue ? "text-red-600" : "text-[#1E3A2B]"}`}>
                                    {date}
                                  </span>
                                </div>
                                {time && (
                                  <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                    <Clock size={12} className="text-gray-400" />
                                    <span className="text-[10px] font-mono font-medium text-gray-500">{time}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="inline-block relative">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusUpdate(task._id, e.target.value as TaskStatus)}
                                className="appearance-none bg-gray-100 border-none pl-4 pr-10 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#1E3A2B] cursor-pointer"
                                disabled={isCompleted}
                              >
                                {statusOrder.map((s, index) => (
                                  <option key={s} value={s} disabled={index < currentStatusIndex}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SuperAdminAddCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1A13]/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-6 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-[#1E3A2B]">Initialize Protocol</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Operational Deployment Form</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            {/* Manual Mode Toggle */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isManualMode ? 'bg-[#C69214] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <Edit3 size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1E3A2B]">Manual Entry Mode</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Override automated category titles</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isManualMode ? 'bg-[#1E3A2B]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isManualMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid gap-6">
              {/* Conditional Title Input */}
              {isManualMode ? (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Objective Title</label>
                    <input 
                      type="text"
                      placeholder="ENTER CUSTOM OBJECTIVE TITLE..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-[#C69214] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Briefing Description</label>
                    <textarea 
                      placeholder="DETAILED TACTICAL INSTRUCTIONS..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-[#C69214] transition-all resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Division</label>
                    <select
                      value={parentCatId}
                      onChange={(e) => { setParentCatId(e.target.value); setSubCatId(""); }}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold"
                    >
                      <option value="">Select Division...</option>
                      {[...categoryTree].sort((a, b) => (a.name || "").localeCompare(b.name || "")).map((cat: any) => (
                        <option key={cat._id} value={cat._id}>{cat.name?.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sub-Sector</label>
                    <select
                      disabled={!parentCatId}
                      value={subCatId}
                      onChange={(e) => setSubCatId(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold disabled:opacity-30"
                    >
                      <option value="">Select Sector...</option>
                      {availableSubCategories.map((sub: any) => (
                        <option key={sub._id} value={sub._id}>{sub.name?.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Personnel (Always Visible) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Personnel Assignment</label>
                <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-100">
                  {[...users].sort((a, b) => (a.name || "").localeCompare(b.name || "")).map((u: any) => (
                    <label key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={assignedTo.includes(u._id)}
                        onChange={(e) => e.target.checked ? setAssignedTo([...assignedTo, u._id]) : setAssignedTo(assignedTo.filter((id) => id !== u._id))}
                        className="rounded border-gray-300 text-[#1E3A2B] focus:ring-[#C69214]"
                      />
                      <span className="text-[9px] font-bold uppercase text-gray-500 group-hover:text-[#1E3A2B] truncate">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Timeline with Time Support */}
              <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#C69214]">
                    <Zap size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Commencement</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border-none rounded-xl px-3 py-3 text-[10px] font-bold" />
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-white border-none rounded-xl px-3 py-3 text-[10px] font-bold" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Deadline Breach</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-white border-none rounded-xl px-3 py-3 text-[10px] font-bold" />
                    <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="bg-white border-none rounded-xl px-3 py-3 text-[10px] font-bold" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateTask}
              disabled={isManualMode ? !title : !parentCatId}
              className="w-full bg-[#1E3A2B] text-[#C69214] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#1E3A2B]/30 hover:bg-[#0F1A13] transition-all disabled:opacity-50"
            >
              Execute Deployment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminTasks;