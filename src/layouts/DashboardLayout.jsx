// UPDATED DashboardLayout.jsx - Mobile Responsive High-Contrast Banner
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useEffect } from "react";
import tokenDec from "../helpers/tokenDec";
import { FiEye, FiInfo, FiShield } from "react-icons/fi";

// Mobile-Responsive Guest Access Banner Component - CYAN/TEAL THEME TO MATCH APP
const GuestAccessBanner = ({ location }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-lg border-b-2 border-cyan-400/30 py-0.5 px-1 sm:p-4 w-full backdrop-blur-sm">
  <div className="flex items-center space-x-1 sm:space-x-4">
    <div className="w-4 h-4 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
      <FiShield size={8} className="text-white sm:hidden" />
      <FiShield size={24} className="text-white hidden sm:block" />
    </div>
    <div className="flex-1">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <h3 className="text-white font-bold text-xs sm:text-xl tracking-wide drop-shadow-md">Guest Access Mode</h3>
        <FiEye className="text-yellow-400" size={10} />
        <span className="text-yellow-400 text-xs sm:text-sm font-medium">READ ONLY</span>
      </div>
      <p className="text-gray-200 text-xs sm:text-base font-medium drop-shadow-sm hidden sm:block">
        You are currently logged in as a <span className="text-cyan-400 font-bold">guest user</span> with read-only access.
      </p>
    </div>
  </div>
</div>
  );
};

export const DashboardLayout = () => {
  const tokenStr = localStorage.getItem("token");
  const userRole = localStorage.getItem("user_role");
  const userLocation = localStorage.getItem("user_location");

  useEffect(() => {
    if (!tokenStr) window.location.href = "/login";

    const data = tokenDec(tokenStr);
    if (!data) window.location.href = "/login";
  }, []);

  return (
    <div className="flex flex-row w-full h-screen bg-gray-300 overflow-hidden">
      <Sidebar />
      <main className="w-full h-full overflow-hidden">
        <Navbar />
        {/* Show mobile-responsive guest banner for guest users */}
        {userRole === "guest" && (
          <GuestAccessBanner location={userLocation} />
        )}
        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};