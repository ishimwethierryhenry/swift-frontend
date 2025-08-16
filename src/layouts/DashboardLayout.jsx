// UPDATED DashboardLayout.jsx - Mobile Responsive Red Banner
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useEffect } from "react";
import tokenDec from "../helpers/tokenDec";
import { FiEye, FiInfo, FiShield } from "react-icons/fi";

// Mobile-Responsive Guest Access Banner Component
const GuestAccessBanner = ({ location }) => {
  return (
    <div className="bg-gradient-to-r from-red-800/40 to-red-900/40 border border-red-700/50 rounded-xl p-2 sm:p-3 mx-2 sm:mx-4 mt-0">
      <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-700 to-red-800 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          <FiShield size={16} className="text-white sm:hidden" />
          <FiShield size={20} className="text-white hidden sm:block" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-2">
            <h3 className="text-red-200 font-semibold text-sm sm:text-lg">Guest Access Mode</h3>
            <FiEye className="text-red-300 mx-auto sm:mx-0 mt-1 sm:mt-0" size={14} />
          </div>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <p className="text-red-300">
              You are currently logged in as a <strong>guest user</strong> with read-only access.
            </p>
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 mt-2 sm:mt-3">
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                <FiEye className="text-red-400" size={12} />
                <span className="text-red-300 text-xs sm:text-sm">View pool data</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                <FiInfo className="text-red-400" size={12} />
                <span className="text-red-300 text-xs sm:text-sm">Access historical records</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                <FiShield className="text-red-400" size={12} />
                <span className="text-red-300 text-xs sm:text-sm">Location: {location}</span>
              </div>
            </div>
          </div>
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