export interface IUser {
    _id: string;
    name: string;
    email: string;
    pjNumber: string;
    role: 'user' | 'admin' | 'superadmin';
    isActive: boolean;
}
export declare const fetchUsers: import("@reduxjs/toolkit").AsyncThunk<IUser[], {
    role?: string;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchUserById: import("@reduxjs/toolkit").AsyncThunk<IUser, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const createUser: import("@reduxjs/toolkit").AsyncThunk<IUser, Partial<IUser>, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const updateUser: import("@reduxjs/toolkit").AsyncThunk<IUser, {
    id: string;
    updates: Partial<IUser>;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const toggleUserStatus: import("@reduxjs/toolkit").AsyncThunk<{
    id: string;
    isActive: any;
}, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const clearUsersError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"users/clearUsersError">, clearUsersMessage: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"users/clearUsersMessage">, setSelectedUser: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<IUser, "users/setSelectedUser">;
declare const _default: import("redux").Reducer<{
    users: {
        _id: string;
        name: string;
        email: string;
        pjNumber: string;
        role: "user" | "admin" | "superadmin";
        isActive: boolean;
    }[];
    selectedUser: {
        _id: string;
        name: string;
        email: string;
        pjNumber: string;
        role: "user" | "admin" | "superadmin";
        isActive: boolean;
    };
    loading: boolean;
    error: string | null;
    message: string | null;
}>;
export default _default;
//# sourceMappingURL=userSlice.d.ts.map