import { useEffect, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

export const Navbar = () => {
  const location = localStorage.getItem("user_location");
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

  return (
    <div className="sticky top-0 flex w-full h-20 p-4 z-50">
      {/* Background matching sidebar */}
      <div className="absolute inset-0 backdrop-blur-lg bg-slate-900/95 border-b border-white/10"></div>
      
      <div className={`relative flex flex-row items-center justify-between w-full h-full transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex flex-row justify-center items-center text-white">
              <FaRegCalendarAlt className="text-cyan-300 mr-2" size={18} />
              <label className="text-white font-medium">
                {formatDate(new Date())}
              </label>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex flex-row justify-center items-center text-white">
              <FaLocationDot className="text-blue-300 mr-2" size={18} />
              <label className="text-white font-medium">
                {location && `Location: ${location}`}
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleLogout()}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/25 group relative overflow-hidden"
        >
          <span className="relative z-10">Log out</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};