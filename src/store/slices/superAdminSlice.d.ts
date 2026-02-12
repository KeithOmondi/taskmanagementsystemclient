export declare const TaskPriority: {
    readonly LOW: "Low";
    readonly MEDIUM: "Medium";
    readonly HIGH: "High";
    readonly URGENT: "Urgent";
};
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export declare const TaskStatus: {
    readonly PENDING: "Pending";
    readonly ACKNOWLEDGED: "Acknowledged";
    readonly COMPLETED: "Completed";
    readonly ON_HOLD: "Hold";
    readonly ARCHIVED: "Archived";
};
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export interface IAttachment {
    name: string;
    url: string;
    fileType: string;
    publicId: string;
}
export interface ITask {
    _id: string;
    title: string;
    description?: string;
    assignedTo: any[];
    status: TaskStatus;
    priority: TaskPriority;
    attachments?: IAttachment[];
    createdBy: {
        _id: string;
        name: string;
        role?: string;
    };
    dueDate?: string;
    startDate?: string;
    createdAt?: string;
    category?: {
        _id: string;
        name: string;
    };
}
export interface SuperAdminTaskState {
    tasks: ITask[];
    loading: boolean;
    error: string | null;
    total: number;
}
export declare const fetchAllTasks: import("@reduxjs/toolkit").AsyncThunk<{
    data: ITask[];
    total: number;
}, void | {
    timeframe?: string;
    status?: string;
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
export declare const createTask: import("@reduxjs/toolkit").AsyncThunk<ITask, FormData, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateTask: import("@reduxjs/toolkit").AsyncThunk<ITask, {
    id: string;
    updates: FormData | Partial<ITask>;
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
export declare const reviewTask: import("@reduxjs/toolkit").AsyncThunk<ITask, {
    id: string;
    action: "APPROVE" | "REJECT";
    feedback?: string;
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
export declare const deleteTask: import("@reduxjs/toolkit").AsyncThunk<string, string, {
    rejectValue: string;
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const resetSuperAdminTasks: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"superAdmin/resetSuperAdminTasks">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"superAdmin/clearError">;
declare const _default: import("redux").Reducer<SuperAdminTaskState>;
export default _default;
//# sourceMappingURL=superAdminSlice.d.ts.map