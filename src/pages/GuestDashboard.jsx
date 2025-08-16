// 3. Create src/pages/GuestDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { FiEye, FiMapPin, FiInfo } from "react-icons/fi";

export const GuestDashboard = () => {
  const dispatch = useDispatch();
  const poolsAvailableState = useSelector((state) => state.poolsByLocation);
  
  const [isVisible, setIsVisible] = useState(false);
  const [pools, setPools] = useState([]);
  
  const userLocation = localStorage.getItem("user_location");
  const userName = localStorage.getItem("user_name");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (userLocation) {
      dispatch(poolsAvailable(userLocation));
    }
  }, [userLocation, dispatch]);

  useEffect(() => {
    if (poolsAvailableState.serverResponded) {
      setPools(poolsAvailableState.response || []);
    }
  }, [poolsAvailableState.serverResponded]);

  const handleViewPool = (pool) => {
    // Navigate to pool details - guests can only view
    window.location.href = `/pool/data/${pool.topic || pool.name}`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto pb-24">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <h1 className="font-bold text-5xl text-white mb-4">
                Welcome, {userName || "Guest"}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-4"></div>
              <p className="text-xl text-cyan-200">
                You have guest access to view pool information at {userLocation}
              </p>
            </div>
          </div>

          {/* Guest Information Card */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FiInfo size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-2xl text-white">Guest Access Information</h2>
                    <p className="text-amber-200">Your current permissions and access level</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <FiEye className="text-cyan-400 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">View Only</h3>
                    <p className="text-gray-300 text-sm">You can view pool data and monitoring information</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <FiMapPin className="text-blue-400 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Location Access</h3>
                    <p className="text-gray-300 text-sm">Limited to pools in your assigned location: {userLocation}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <FiInfo className="text-green-400 mb-3" size={24} />
                    <h3 className="text-white font-semibold mb-2">Read-Only Data</h3>
                    <p className="text-gray-300 text-sm">Access to historical data and current pool status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Pools Section */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-bold text-3xl text-white">Available Pools</h2>
                    <p className="font-semibold text-lg text-cyan-300">
                      {pools.length} pools available for viewing
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <FiEye size={24} className="text-white" />
                  </div>
                </div>
                
                {/* Pools Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map((pool, index) => (
                    <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-white font-semibold text-xl">{pool.name || 'Unknown Pool'}</h3>
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                          Active
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Depth:</span>
                          <span className="text-white font-medium">{pool.depth || 'N/A'} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Length:</span>
                          <span className="text-white font-medium">{pool.l || pool.length || 'N/A'} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Width:</span>
                          <span className="text-white font-medium">{pool.w || pool.width || 'N/A'} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Location:</span>
                          <span className="text-white font-medium">{pool.location || userLocation}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleViewPool(pool)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105"
                      >
                        <FiEye className="inline mr-2" size={18} />
                        View Pool Data
                      </button>
                    </div>
                  ))}
                </div>

                {/* No Pools Message */}
                {pools.length === 0 && !poolsAvailableState.loading && (
                  <div className="text-center py-12">
                    <FiEye className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No Pools Available</h3>
                    <p className="text-gray-500">No pools are currently available for viewing in your location.</p>
                  </div>
                )}

                {/* Loading State */}
                {poolsAvailableState.loading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading pool data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats for Guests */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-cyan-300 text-lg font-semibold mb-2">Available Pools</h3>
                  <p className="text-white text-3xl font-bold">{pools.length}</p>
                  <p className="text-cyan-200 text-sm mt-2">In your location</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-blue-300 text-lg font-semibold mb-2">Access Level</h3>
                  <p className="text-white text-3xl font-bold">Guest</p>
                  <p className="text-blue-200 text-sm mt-2">Read-only access</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-green-300 text-lg font-semibold mb-2">Status</h3>
                  <p className="text-white text-3xl font-bold">Active</p>
                  <p className="text-green-200 text-sm mt-2">Session active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};