import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // Standard for Layouts
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

interface UserLayoutProps {
  // Making it optional prevents the TS error if the component 
  // is rendered before the router injects content
  children?: React.ReactNode; 
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      <UserSidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <UserHeader 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          userName="Jane Doe" 
        />

        <main className="p-4 md:p-8 flex-1 animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto">
            {/* If 'children' exists (passed via props), render it.
               Otherwise, render 'Outlet' (the current route's component).
            */}
            {children || <Outlet />}
          </div>
        </main>

        <footer className="py-6 px-8 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Official Registry Portal • Judiciary of Kenya
          </p>
        </footer>
      </div>
    </div>
  );
};

export default UserLayout;