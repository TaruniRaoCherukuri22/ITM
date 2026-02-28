import { Outlet } from "react-router-dom";
import Sidebarhr from "../components/Sidebarhr";
import HrTopbar from "../components/HrTopbar";
import { useState } from "react";

export default function HRLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      {sidebarOpen && <Sidebarhr />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-20">
        <HrTopbar setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 pt-12 px-6 md:px-10 pb-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
