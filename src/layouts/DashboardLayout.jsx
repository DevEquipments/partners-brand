import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    // Layer 1: cool-gray page background — clearly distinct from white cards
    <div className="flex h-screen overflow-hidden bg-[#eceef3]">
      {/* Layer 2: dark sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Layer 3: white navbar */}
        <Navbar onMenuToggle={() => setIsMobileOpen(true)} />

        {/* Content area — white cards float on [#eceef3] */}
        <main className="flex-1 overflow-y-auto bg-[#f2f4ff]">
          <div className="px-5 py-5 md:px-7 md:py-6 mx-auto w-full">
            
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
