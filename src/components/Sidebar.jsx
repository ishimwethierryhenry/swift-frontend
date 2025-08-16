import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { LiaSwimmingPoolSolid } from "react-icons/lia";
import { GrUserManager } from "react-icons/gr";
import { BiSolidNetworkChart } from "react-icons/bi";
import { FaHistory } from "react-icons/fa";
import { IoMdWater } from "react-icons/io";
import { useDispatch } from "react-redux";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";
import { 
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import logo2 from "../assets/logo2.png"; // ✅ Added proper import

// Swimming Pool Logo Component
const SwimmingPoolLogo = ({ size = 36 }) => (
  <div className="relative overflow-hidden rounded-lg">
    <img 
      src={logo2} // ✅ Using imported variable instead of string path
      alt="SWIFT Logo"
      className="w-full h-full object-cover rounded-lg"
      style={{ width: size, height: size }}
    />
    {/* Overlay gradient for better contrast */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 rounded-lg"></div>
  </div>
);

export const SideNav = ({ label, destination, active = false, isCollapsed }) => {
  const dispatch = useDispatch();
  
  const getIcon = () => {
    const iconClass = `${active ? "text-white" : "text-gray-300"} transition-colors duration-300`;
    const size = 24;
    
    switch(label) {
      case "Overview":
        return <MdDashboard className={iconClass} size={size} />;
      case "Monitor":
        return <IoMdWater className={iconClass} size={size} />;
      case "Pools":
        return <LiaSwimmingPoolSolid className={iconClass} size={size} />;
      case "Operators":
        return <GrUserManager className={iconClass} size={size} />;
      case "Prediction":
        return <BiSolidNetworkChart className={iconClass} size={size} />;
      case "History":
        return <FaHistory className={iconClass} size={size} />;
      default:
        return null;
    }
  };

  return (
    <Link
      to={destination}
      className={`group relative flex items-center w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 transform scale-105' 
          : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-102'
      }`}
      onClick={() => dispatch(activeLinksActions.setActiveLink(label))}
      title={isCollapsed ? label : undefined}
    >
      {/* Glow effect for active state */}
      {active && (
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl lg:rounded-3xl opacity-30 blur-lg"></div>
      )}
      
      <div className={`relative flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3 lg:gap-4'}`}>
        {getIcon()}
        {!isCollapsed && (
          <span className={`font-semibold text-base lg:text-lg transition-colors duration-300 ${
            active ? 'text-white' : 'text-gray-300 group-hover:text-white'
          }`}>
            {label}
          </span>
        )}
      </div>
      
      {/* Hover indicator */}
      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 lg:h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full transition-all duration-300 ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
      }`}></div>
    </Link>
  );
};

export const Sidebar = () => {
  const activeLink = useSelector((state) => state.activeLinks.active);
  const userRole = localStorage.getItem("user_role");
  const userName = localStorage.getItem("user_name");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-collapse logic based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      setIsCollapsed(isMobile);
    };

    // Set initial state
    handleResize();
    setIsVisible(true);

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative h-screen">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 lg:top-20 left-2 lg:left-4 w-16 lg:w-32 h-16 lg:h-32 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl lg:blur-2xl opacity-15 animate-pulse"></div>
        <div className="absolute bottom-10 lg:bottom-20 right-2 lg:right-4 w-12 lg:w-24 h-12 lg:h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl lg:blur-2xl opacity-15 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-4 lg:left-8 w-8 lg:w-16 h-8 lg:h-16 bg-teal-300 rounded-full mix-blend-multiply filter blur-lg lg:blur-xl opacity-10 animate-pulse animation-delay-1000"></div>
      </div>

      <aside 
        className={`relative flex-shrink-0 h-full backdrop-blur-lg bg-slate-900/95 border-r border-white/10 shadow-2xl transition-all duration-500 z-50 ${
          isCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-72'
        } ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full relative z-10">
          
          {/* Header Section with New Logo - Responsive */}
          <div className={`flex items-center justify-between p-3 lg:p-6 border-b border-white/10 transition-all duration-300 ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* New Swimming Pool Logo - Responsive */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 rounded-xl lg:rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:scale-110"></div>
                  <div className="relative w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                    <SwimmingPoolLogo size={isCollapsed ? 24 : 36} />
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="transition-all duration-300">
                    <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent tracking-wide">
                      SWIFT
                    </h1>
                    <p className="text-xs lg:text-sm text-cyan-300 font-medium">Enhancing Water Quality</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collapse toggle - Only show on desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              ) : (
                <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              )}
            </button>
          </div>

          {/* Navigation Section - Responsive */}
          <nav className="flex-1 px-2 lg:px-4 py-4 lg:py-6 space-y-2 lg:space-y-3 overflow-y-auto">
            <div className={`transition-all duration-500 delay-200 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <SideNav
                label="Overview"
                destination="/dashboard"
                active={activeLink === "Overview"}
                isCollapsed={isCollapsed}
              />
            </div>
            
            <div className={`transition-all duration-500 delay-250 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <SideNav
                label="Monitor"
                destination="/pool"
                active={activeLink === "Monitor"}
                isCollapsed={isCollapsed}
              />
            </div>
            
            {userRole === "admin" && (
              <div className={`transition-all duration-500 delay-300 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                <SideNav
                  label="Pools"
                  destination="/pool/create"
                  active={activeLink === "Pools"}
                  isCollapsed={isCollapsed}
                />
              </div>
            )}

            {userRole === "admin" && (
              <div className={`transition-all duration-500 delay-400 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                <SideNav
                  label="Operators"
                  destination="/operator/create"
                  active={activeLink === "Operators"}
                  isCollapsed={isCollapsed}
                />
              </div>
            )}

            <div className={`transition-all duration-500 delay-500 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <SideNav
                label="Prediction"
                destination="/predict"
                active={activeLink === "Prediction"}
                isCollapsed={isCollapsed}
              />
            </div>

            <div className={`transition-all duration-500 delay-600 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <SideNav
                label="History"
                destination="/history"
                active={activeLink === "History"}
                isCollapsed={isCollapsed}
              />
            </div>
          </nav>

          {/* User Section - Responsive */}
          <div className={`border-t border-white/10 p-2 lg:p-4 transition-all duration-500 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
              <div className={`relative flex items-center p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 ${
                isCollapsed ? 'justify-center' : 'space-x-2 lg:space-x-3'
              }`}>
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-semibold text-white truncate">
                      {userName || "User"}
                    </p>
                    <p className="text-xs text-gray-300 capitalize truncate">
                      {userRole || "operator"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* User info for collapsed state */}
            {isCollapsed && userName && (
              <div className="mt-1 lg:mt-2 text-center">
                <span className="text-xs text-gray-300 block truncate">
                  {userName.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <style jsx>{`
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .hover\\:scale-102:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
};