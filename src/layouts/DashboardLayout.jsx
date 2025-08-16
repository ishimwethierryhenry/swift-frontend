// UPDATED DashboardLayout.jsx - Same Size, Black/Dark Colors
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { useEffect } from "react";
import tokenDec from "../helpers/tokenDec";
import { FiEye, FiInfo, FiShield } from "react-icons/fi";

// Guest Access Banner Component - Same Size, Black/Dark Colors
const GuestAccessBanner = ({ location }) => {
  return (
    <div className="bg-gradient-to-r from-red-800/40 to-red-900/40 border border-red-700/50 rounded-xl p-3 mx-4 mt-0">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-red-700 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
          <FiShield size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-red-200 font-semibold text-lg">Guest Access Mode</h3>
            <FiEye className="text-red-300" size={18} />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-red-300">
              You are currently logged in as a <strong>guest user</strong> with read-only access.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-3">
              <div className="flex items-center space-x-2">
                <FiEye className="text-red-400" size={16} />
                <span className="text-red-300">View pool data</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiInfo className="text-red-400" size={16} />
                <span className="text-red-300">Access historical records</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiShield className="text-red-400" size={16} />
                <span className="text-red-300">Location: {location}</span>
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
    <div className="flex flex-row w-full h-screen bg-red-300 overflow-hidden">
      <Sidebar />
      <main className="w-full h-full">
        <Navbar />
        {/* Show guest banner for guest users */}
        {userRole === "guest" && (
          <GuestAccessBanner location={userLocation} />
        )}
        <Outlet />
      </main>
    </div>
  );
};