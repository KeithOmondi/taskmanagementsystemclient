import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminHeader } from "./SuperAdminHeader";

export const SuperAdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <SuperAdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
