// 4. UPDATED Navbar.jsx
import { useEffect, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FiEye } from "react-icons/fi";

export const Navbar = () => {
  const location = localStorage.getItem("user_location");
  const userRole = localStorage.getItem("user_role");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  function formatDate(date) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  // Shorter date format for mobile
  function formatDateMobile(date) {
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <div className="sticky top-0 flex w-full h-12 sm:h-14 md:h-16 p-2 sm:p-3 md:p-4 z-50">
      {/* Background matching sidebar */}
      <div className="absolute inset-0 backdrop-blur-lg bg-slate-900/95 border-b border-white/10"></div>
      
      <div className={`relative flex flex-row items-center justify-between w-full h-full transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        
        {/* Date Section - Responsive */}
        <div className="group relative">
          <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex flex-row justify-center items-center text-white">
              <FaRegCalendarAlt className="text-cyan-300 mr-1.5 sm:mr-2" size={14} />
              <label className="text-white font-medium text-xs sm:text-sm">
                {/* Show shorter date on mobile, full date on larger screens */}
                <span className="hidden sm:inline">{formatDate(new Date())}</span>
                <span className="sm:hidden">{formatDateMobile(new Date())}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Location Section - Responsive */}
        <div className="group relative">
          <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex flex-row justify-center items-center text-white">
              <FaLocationDot className="text-blue-300 mr-1.5 sm:mr-2" size={14} />
              <label className="text-white font-medium text-xs sm:text-sm">
                {/* Show shorter location text on mobile */}
                <span className="hidden sm:inline">
                  {location && `Location: ${location}`}
                </span>
                <span className="sm:hidden">
                  {location && location}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Guest Status Indicator */}
        {userRole === "guest" && (
          <div className="group relative">
            <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg sm:rounded-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <FiEye className="text-amber-400" size={14} />
                <span className="text-amber-300 text-xs sm:text-sm font-medium">Guest Access</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button - Responsive */}
        <button
          onClick={() => handleLogout()}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl md:rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl shadow-cyan-500/25 group relative overflow-hidden"
        >
          <span className="relative z-10">Log out</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};