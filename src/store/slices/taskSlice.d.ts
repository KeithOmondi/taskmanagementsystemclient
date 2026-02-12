export declare enum TaskStatus {
    PENDING = "Pending",
    ACKNOWLEDGED = "Acknowledged",
    COMPLETED = "Completed",
    ON_HOLD = "On Hold",
    ARCHIVED = "Archived"
}
export declare enum TaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    URGENT = "Urgent"
}
interface UserReference {
    _id: string;
    name: string;
    email: string;
}
export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: UserReference[];
    startDate?: string;
    dueDate: string;
    acknowledgedAt?: string;
    completedAt?: string;
    category?: {
        _id: string;
        name: string;
    };
    boardColumn?: string;
    createdAt: string;
    daysRemaining?: number;
    isOverdue?: boolean;
}
export declare const fetchMyTasks: import("@reduxjs/toolkit").AsyncThunk<{
    data: Task[];
    total: number;
}, {
    timeframe?: string;
    status?: string;
    priority?: string;
}, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchTaskDetails: import("@reduxjs/toolkit").AsyncThunk<Task, string, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateTask: import("@reduxjs/toolkit").AsyncThunk<Task, {
    id: string;
    status?: TaskStatus;
    boardColumn?: string;
    description?: string;
}, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const addTimeLog: import("@reduxjs/toolkit").AsyncThunk<Task, {
    id: string;
    startedAt: string;
    durationMinutes: number;
}, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearTaskError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"tasks/clearTaskError">;
declare const _default: import("redux").Reducer<{
    tasks: {
        _id: string;
        title: string;
        description?: string;
        status: TaskStatus;
        priority: TaskPriority;
        assignedTo: {
            _id: string;
            name: string;
            email: string;
        }[];
        startDate?: string;
        dueDate: string;
        acknowledgedAt?: string;
        completedAt?: string;
        category?: {
            _id: string;
            name: string;
        };
        boardColumn?: string;
        createdAt: string;
        daysRemaining?: number;
        isOverdue?: boolean;
    }[];
    loading: boolean;
    error: string | null;
    total: number;
}>;
export default _default;
//# sourceMappingURL=taskSlice.d.ts.map