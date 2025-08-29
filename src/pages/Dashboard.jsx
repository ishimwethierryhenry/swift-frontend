// src/pages/Dashboard.jsx - UPDATED WITH BUG FIXES

import React, { useEffect, useState } from "react";
import { ModalPool } from "../components/ModalPool";
import { ModalDeletePool } from "../components/ModalDeletePool";
import { useDispatch, useSelector } from "react-redux";
import { ModalLocation } from "../components/ModalLocation";
import { poolsAssigned } from "../redux/slices/poolsAssignedSlice";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { operatorsAvailable } from "../redux/slices/operatorsByLocationSlice";
import { ModalDeleteOperator } from "../components/ModalDeleteOperator";
import { getLocations } from "../redux/slices/locationsSlice";
import { deletePool, resetDeletePoolState } from "../redux/slices/deletePoolSlice";
import { deleteOperator, resetDeleteOperatorState } from "../redux/slices/deleteOperatorSlice";
import { ModalOperator } from "../components/ModalOperator";
import { resetUpdatePoolState } from "../redux/slices/updatePoolSlice";
import { useNavigate } from "react-router-dom";
import DashboardAnalyticsSection from '../components/DashboardAnalyticsSection';

export const Dashboard = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user.user);
  const loginState = useSelector((state) => state.login);
  const poolsAssignedState = useSelector((state) => state.assignedPools || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });
  const poolsAvailableState = useSelector((state) => state.poolsByLocation);
  const locationsState = useSelector((state) => state.locations);
  const operatorsAvailableState = useSelector((state) => state.operatorsByLocation);
  const deletePoolState = useSelector((state) => state.deletePool || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });
  const deleteOperatorState = useSelector((state) => state.deleteOperator || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });
  const updatePoolState = useSelector((state) => state.updatePool || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("user_role");
  const userLocation = localStorage.getItem("user_location");

  // Component state - Initialize with empty arrays to prevent null reference errors
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pools, setPools] = useState([]);
  const [operators, setOperators] = useState([]);
  const [locations, setLocations] = useState([]);

  // Modal states
  const [poolEditModal, setPoolEditModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [locationModal, setLocationModal] = useState({ id: null, open: false });
  const [poolDeleteModal, setPoolDeleteModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [operatorEditModal, setOperatorEditModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [operatorDeleteModal, setOperatorDeleteModal] = useState({
    id: null,
    open: false,
    data: null,
  });

  // Helper functions
  const refreshDashboardData = async () => {
    setIsRefreshing(true);
    try {
      if (userRole === "operator" && userId) {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin" && userLocation) {
        dispatch(poolsAvailable(userLocation));
        dispatch(operatorsAvailable(userLocation));
      } else if (userRole === "overseer") {
        dispatch(getLocations());
      }
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Get limited pools for dashboard display (max 3) - Safe array access
  const getDisplayPools = () => {
    const maxPools = 3;
    return Array.isArray(pools) ? pools.slice(0, maxPools) : [];
  };

  // Get limited operators for dashboard display (max 3) - Safe array access
  const getDisplayOperators = () => {
    const maxOperators = 3;
    return Array.isArray(operators) ? operators.slice(0, maxOperators) : [];
  };

  // Check if we need to show "View All" message for pools - Safe length check
  const shouldShowViewAllPoolsMessage = () => {
    return Array.isArray(pools) && pools.length > 3;
  };

  // Check if we need to show "View All" message for operators - Safe length check
  const shouldShowViewAllOperatorsMessage = () => {
    return Array.isArray(operators) && operators.length > 3;
  };

  // Navigation functions
  const handleStartTest = (pool) => {
    console.log(`🚀 Redirecting to Pool Monitor for testing: ${pool.name}`);
    navigate(`/pool?pool=${encodeURIComponent(pool.name)}&poolId=${encodeURIComponent(pool.id || pool._id)}&sessionId=${Date.now()}&redirect=true`);
  };

  const handleNavigateToMonitor = () => {
    console.log(`🚀 Redirecting to Pool Monitor page`);
    navigate('/pool');
  };

  const handleViewAllPools = () => {
    console.log(`🚀 Redirecting to Pool Management page`);
    navigate('/pool/create');
  };

  const handleViewAllOperators = () => {
    console.log(`🚀 Redirecting to Operators Management page`);
    navigate('/operators');
  };

  // Get pool status for display
  const getPoolStatus = (pool) => {
    return {
      status: 'Available for Testing',
      color: 'bg-emerald-500',
      textColor: 'text-white',
      badge: 'AVAILABLE'
    };
  };

  // Delete confirmation functions
  const confirmDeletePool = async (poolId) => {
    try {
      console.log("Deleting pool with ID:", poolId);
      dispatch(deletePool(poolId));
      setPoolDeleteModal({ id: null, open: false, data: null });
    } catch (error) {
      console.error("Failed to delete pool:", error);
    }
  };

  const confirmDeleteOperator = async (operatorId) => {
    try {
      console.log("Deleting operator with ID:", operatorId);
      dispatch(deleteOperator(operatorId));
      setOperatorDeleteModal({ id: null, open: false, data: null });
    } catch (error) {
      console.error("Failed to delete operator:", error);
    }
  };

  // Handler functions
  const handleEdit = (pool) => {
    setPoolEditModal({ id: pool.name, open: true, data: pool });
  };

  const handleView = (location) => {
    setLocationModal({ id: location.name, open: true });
  };
  
  const handleDeletePool = (pool) => {
    console.log("Delete pool clicked:", pool);
    setPoolDeleteModal({ 
      id: pool.id || pool._id, 
      open: true, 
      data: pool 
    });
    setOperatorDeleteModal({ id: null, open: false, data: null });
  };

  const handleViewOperator = (operator) => {
    console.log("View operator:", operator);
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'view' }
    });
  };
  
  const handleEditOperator = (operator) => {
    console.log("Edit operator:", operator);
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'edit' }
    });
  };
  
  const handleDeleteOperator = (operator) => {
    console.log("Delete operator clicked:", operator);
    setOperatorDeleteModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: operator 
    });
    setPoolDeleteModal({ id: null, open: false, data: null });
  };

  // UseEffect hooks for state management with safe array handling
  useEffect(() => {
    if (deleteOperatorState?.serverResponded && deleteOperatorState?.response) {
      if (userRole === "admin") {
        dispatch(operatorsAvailable(userLocation));
      }
      dispatch(resetDeleteOperatorState());
    }
  }, [deleteOperatorState?.serverResponded, deleteOperatorState?.response, userRole, userLocation, dispatch]);

  useEffect(() => {
    if (updatePoolState?.serverResponded && updatePoolState?.response) {
      console.log('✅ Pool update successful, refreshing pools list...');
      
      if (userRole === "operator" && userId) {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin" && userLocation) {
        dispatch(poolsAvailable(userLocation));
      }
      
      dispatch(resetUpdatePoolState());
    }
  }, [updatePoolState?.serverResponded, updatePoolState?.response, userRole, userId, userLocation, dispatch]);

  useEffect(() => {
    if (deletePoolState?.serverResponded && deletePoolState?.response) {
      if (userRole === "operator") {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin") {
        dispatch(poolsAvailable(userLocation));
      }
      dispatch(resetDeletePoolState());
    }
  }, [deletePoolState?.serverResponded, deletePoolState?.response, userRole, userId, userLocation, dispatch]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Updated useEffect with safe array handling
  useEffect(() => {
    if (locationsState.serverResponded && locationsState.response) {
      setLocations(Array.isArray(locationsState.response) ? locationsState.response : []);
    }
  }, [locationsState.serverResponded]);

  useEffect(() => {
    if (operatorsAvailableState.serverResponded && operatorsAvailableState.response) {
      setOperators(Array.isArray(operatorsAvailableState.response) ? operatorsAvailableState.response : []);
    }
  }, [operatorsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAvailableState.serverResponded && poolsAvailableState.response) {
      setPools(Array.isArray(poolsAvailableState.response) ? poolsAvailableState.response : []);
    }
  }, [poolsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAssignedState.serverResponded && poolsAssignedState.response) {
      setPools(Array.isArray(poolsAssignedState.response) ? poolsAssignedState.response : []);
    }
  }, [poolsAssignedState.serverResponded]);

  // Initial data fetch with error handling
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        if (userRole === "operator" && userId) {
          dispatch(poolsAssigned(userId));
        } else if (userRole === "admin" && userLocation) {
          dispatch(poolsAvailable(userLocation));
          dispatch(operatorsAvailable(userLocation));
        } else if (userRole === "overseer") {
          dispatch(getLocations());
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
        // Set empty arrays as fallback
        setPools([]);
        setOperators([]);
        setLocations([]);
      }
    };

    initializeDashboard();
  }, [userRole, userId, userLocation, dispatch]);

  // Auto-refresh dashboard data every 30 seconds with error handling
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        if (userRole === "operator" && userId) {
          dispatch(poolsAssigned(userId));
        } else if (userRole === "admin" && userLocation) {
          dispatch(poolsAvailable(userLocation));
          dispatch(operatorsAvailable(userLocation));
        } else if (userRole === "overseer") {
          dispatch(getLocations());
        }
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [userRole, userId, userLocation, dispatch]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-5 left-5 sm:top-10 sm:left-10 md:top-20 md:left-20 w-24 h-24 sm:w-32 sm:h-32 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-10 right-5 sm:top-20 sm:right-10 md:top-40 md:right-20 w-24 h-24 sm:w-32 sm:h-32 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-5 left-10 sm:bottom-10 sm:left-20 md:bottom-20 md:left-40 w-24 h-24 sm:w-32 sm:h-32 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-16 sm:pb-20">
          
          {/* Dashboard Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-4">
                Dashboard Overview
                {isRefreshing && (
                  <span className="ml-3 inline-block">
                    <svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </h1>
              <div className="w-16 sm:w-20 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Admin Role - Pools Section with Limit (Max 3) */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Swimming Pools - Quick View</h2>
                      <p className="font-semibold text-base sm:text-lg text-cyan-300">
                        Showing {Math.min(3, pools ? pools.length : 0)} of {pools ? pools.length : 0} total pools • Click "START TEST" to open Pool Monitor
                      </p>
                    </div>
                     
                  </div>
                  
                  {/* Pools Display - Limited to 3 */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm">NAME</th>
                            <th className="text-left p-3 font-semibold text-sm">DEPTH</th>
                            <th className="text-left p-3 font-semibold text-sm">LENGTH</th>
                            <th className="text-left p-3 font-semibold text-sm">WIDTH</th>
                            <th className="text-left p-3 font-semibold text-sm">STATUS</th>
                            <th className="text-left p-3 font-semibold text-sm">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDisplayPools().map((pool, index) => {
                            const statusInfo = getPoolStatus(pool);
                            
                            return (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm">{pool.name || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.depth || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.l || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.w || 'N/A'}</td>
                                <td className="p-3">
                                  <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                                    {statusInfo.badge}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleStartTest(pool)}
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded text-xs transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                                    >
                                      <i className="fas fa-vial"></i> START TEST
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(pool)}
                                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePool(pool)}
                                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                      {getDisplayPools().map((pool, index) => {
                        const statusInfo = getPoolStatus(pool);
                        
                        return (
                          <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-base sm:text-lg">{pool.name || 'N/A'}</h3>
                              <span className={`${statusInfo.color} ${statusInfo.textColor} px-2 sm:px-3 py-1 rounded-full text-xs font-semibold`}>
                                {statusInfo.badge}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                              <div>
                                <span className="text-gray-300 block">Depth</span>
                                <p className="text-white font-medium">{pool.depth || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Length</span>
                                <p className="text-white font-medium">{pool.l || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Width</span>
                                <p className="text-white font-medium">{pool.w || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleStartTest(pool)}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm flex-1 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-1"
                              >
                                <i className="fas fa-vial"></i> START TEST
                              </button>
                              <button 
                                onClick={() => handleEdit(pool)}
                                className="bg-yellow-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeletePool(pool)}
                                className="bg-red-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* View All Pools Message */}
                    {shouldShowViewAllPoolsMessage() && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <p className="text-white font-semibold">
                              <i className="fas fa-chart-bar mr-2"></i>You have {pools.length - 3} more pools
                            </p>
                            <p className="text-orange-200 text-sm">
                              Dashboard shows only the first 3 pools. View all pools for complete management.
                            </p>
                          </div>
                          <button
                            onClick={handleViewAllPools}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                          >
                            <i className="fas fa-magnifying-glass mr-2"></i>View All Pools
                          </button>
                        </div>
                      </div>
                    )}

                    {/* No Pools Message */}
                    {(!pools || pools.length === 0) && (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4"><i className="fas fa-person-swimming text-cyan-400"></i></div>
                        <p className="text-white/70 text-lg mb-4">No pools configured yet</p>
                        <button
                          onClick={handleViewAllPools}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                          Add Your First Pool
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operator Role - Assigned Pools with Limit (Max 3) */}
          {userRole === "operator" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Your Assigned Pools</h2>
                      <p className="font-semibold text-base sm:text-lg text-cyan-300">
                        Showing {Math.min(3, pools ? pools.length : 0)} of {pools ? pools.length : 0} pools under your care • Click "START TEST" to open Pool Monitor
                      </p>
                    </div>
                     
                  </div>
                  
                  {/* Pools Display */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    {/* Desktop Table View for Operators */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm">POOL NAME</th>
                            <th className="text-left p-3 font-semibold text-sm">DIMENSIONS</th>
                            <th className="text-left p-3 font-semibold text-sm">STATUS</th>
                            <th className="text-left p-3 font-semibold text-sm">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDisplayPools().map((pool, index) => {
                            const statusInfo = getPoolStatus(pool);
                            
                            return (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm font-medium">{pool.name || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.l}m × {pool.w}m × {pool.depth}m</td>
                                <td className="p-3">
                                  <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                                    {statusInfo.badge}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <button 
                                    onClick={() => handleStartTest(pool)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                  >
                                    <i className="fas fa-vial"></i>Start Pool Test
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Card View for Operators */}
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                      {getDisplayPools().map((pool, index) => {
                        const statusInfo = getPoolStatus(pool);
                        
                        return (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-lg">{pool.name}</h3>
                              <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                                {statusInfo.badge}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-gray-300 text-sm">Dimensions:</span>
                              <p className="text-white font-medium">{pool.l}m × {pool.w}m × {pool.depth}m</p>
                            </div>
                            
                            <button 
                              onClick={() => handleStartTest(pool)}
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-vial"></i>Start Pool Test
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* View All Pools Message for Operators */}
                    {shouldShowViewAllPoolsMessage() && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <p className="text-white font-semibold">
                              <i className="fas fa-clipboard-list mr-2"></i>You have {pools.length - 3} more assigned pools
                            </p>
                            <p className="text-blue-200 text-sm">
                              Dashboard shows only the first 3 pools. View all your assigned pools.
                            </p>
                          </div>
                          <button
                            onClick={handleViewAllPools}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                          >
                            <i className="fas fa-clipboard-list mr-2"></i>View All My Pools
                          </button>
                        </div>
                      </div>
                    )}

                    {/* No Pools Message for Operators */}
                    {(!pools || pools.length === 0) && (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4"><i className="fas fa-person-swimming text-cyan-400"></i></div>
                        <p className="text-white/70 text-lg mb-2">No pools assigned to you yet</p>
                        <p className="text-white/50 text-sm">Contact your administrator to get pools assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Role - Operators Section (Limited to 3) */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Operators - Quick View</h2>
                      <p className="font-semibold text-base sm:text-lg text-blue-300">
                        Showing {Math.min(3, operators ? operators.length : 0)} of {operators ? operators.length : 0} active operators
                      </p>
                    </div>
                      
                  </div>
                  
                  {/* Operators Display - Limited to 3 */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm">FIRST NAME</th>
                            <th className="text-left p-3 font-semibold text-sm">LAST NAME</th>
                            <th className="text-left p-3 font-semibold text-sm">PHONE NUMBER</th>
                            <th className="text-left p-3 font-semibold text-sm">EMAIL</th>
                            <th className="text-left p-3 font-semibold text-sm">LOCATION</th>
                            <th className="text-left p-3 font-semibold text-sm">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDisplayOperators().map((operator, index) => (
                            <tr key={index} className="border-b border-white/10">
                              <td className="p-3 text-sm">{operator.fname || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.lname || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.phone || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.email || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.location || 'N/A'}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleViewOperator(operator)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                                  >
                                    View
                                  </button>
                                  <button 
                                    onClick={() => handleEditOperator(operator)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteOperator(operator)}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                      {getDisplayOperators().map((operator, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold text-base sm:text-lg">
                              {operator.fname || 'N/A'} {operator.lname || ''}
                            </h3>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleViewOperator(operator)}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleEditOperator(operator)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteOperator(operator)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Phone:</span>
                              <span className="text-white">{operator.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                              <span className="text-gray-300">Email:</span>
                              <span className="text-white break-all text-right">{operator.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Location:</span>
                              <span className="text-white">{operator.location || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View All Operators Message */}
                    {shouldShowViewAllOperatorsMessage() && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <p className="text-white font-semibold">
                              <i className="fas fa-users mr-2"></i>You have {operators.length - 3} more operators
                            </p>
                            <p className="text-indigo-200 text-sm">
                              Dashboard shows only the first 3 operators. Manage all operators separately.
                            </p>
                          </div>
                          <button
                            onClick={handleViewAllOperators}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                          >
                            <i className="fas fa-users mr-2"></i>Manage Operators
                          </button>
                        </div>
                      </div>
                    )}

                    {/* No Operators Message */}
                    {(!operators || operators.length === 0) && (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4"><i className="fas fa-users text-indigo-400"></i></div>
                        <p className="text-white/70 text-lg mb-4">No operators registered yet</p>
                        <button
                          onClick={handleViewAllOperators}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                          Add Your First Operator
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overseer Role - Locations and Map */}
          {userRole === "overseer" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Locations Section */}
                <div className="relative group">
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Available Locations</h2>
                        <p className="font-semibold text-base sm:text-lg text-purple-300">
                          {locations ? locations.length : 0} locations monitored
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Locations Display */}
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-white">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="text-left p-3 font-semibold text-sm">LOCATION</th>
                              <th className="text-left p-3 font-semibold text-sm">POOLS</th>
                              <th className="text-left p-3 font-semibold text-sm">OPERATORS</th>
                              <th className="text-left p-3 font-semibold text-sm">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(locations || []).map((location, index) => (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm">{location.name}</td>
                                <td className="p-3 text-sm">{location.pools}</td>
                                <td className="p-3 text-sm">{location.operators}</td>
                                <td className="p-3">
                                  <button 
                                    onClick={() => handleView(location)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile/Tablet Card View */}
                      <div className="md:hidden space-y-3 sm:space-y-4">
                        {(locations || []).map((location, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-base sm:text-lg">{location.name}</h3>
                              <button 
                                onClick={() => handleView(location)}
                                className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-600"
                              >
                                View
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                              <div>
                                <span className="text-gray-300 block">Pools</span>
                                <p className="text-white font-medium">{location.pools}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Operators</span>
                                <p className="text-white font-medium">{location.operators}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="relative group">
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white mb-2">Location Map</h2>
                      <p className="font-semibold text-base sm:text-lg text-teal-300">Interactive facility locations</p>
                    </div>
                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/10 h-48 sm:h-64 md:h-80 lg:h-96">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4927920574264!2d30.060151911394943!3d-1.956333898017703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42ba4412995%3A0xeb7a3b7e5681a72d!2sKigali%20Serena%20Hotel!5e0!3m2!1sen!2srw!4v1716978777948!5m2!1sen!2srw"
                        className="w-full h-full rounded-lg sm:rounded-xl"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Quick Stats Section */}
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Total Pools Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-cyan-300 text-base sm:text-lg font-semibold mb-2">Total Pools</h3>
                  <p className="text-white text-2xl sm:text-3xl font-bold">{pools ? pools.length : 0}</p>
                  <p className="text-cyan-200 text-xs sm:text-sm mt-2">Available for testing</p>
                </div>
              </div>

              {/* Pool Monitor Access Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-purple-300 text-base sm:text-lg font-semibold mb-2">Pool Monitor</h3>
                  <button
                    onClick={handleNavigateToMonitor}
                    className="text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-vial mr-1"></i>OPEN
                  </button>
                  <p className="text-purple-200 text-xs sm:text-sm mt-2">Access testing interface</p>
                </div>
              </div>

              {/* Pool Management Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-orange-300 text-base sm:text-lg font-semibold mb-2">Pool Management</h3>
                  <button
                    onClick={handleViewAllPools}
                    className="text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-wrench mr-1"></i>MANAGE
                  </button>
                  <p className="text-orange-200 text-xs sm:text-sm mt-2">Add, edit, and configure pools</p>
                </div>
              </div>

              {/* Active Operators Card (Admin only) */}
              {userRole === "admin" && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-blue-300 text-base sm:text-lg font-semibold mb-2">Active Operators</h3>
                    <p className="text-white text-2xl sm:text-3xl font-bold">Online</p>
                    <p className="text-green-200 text-xs sm:text-sm mt-2">All systems operational</p>
                  </div>
                </div>
              )}
            </div>
{/* Advanced Analytics Section */}
<div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
  <DashboardAnalyticsSection 
    userRole={userRole}
    userLocation={userLocation}
    pools={pools}
  />
</div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {poolEditModal.open && (
        <ModalPool
          data={poolEditModal.data}
          operators={operators}
          Fn={setPoolEditModal}
        />
      )}
      {poolDeleteModal.open && (
        <ModalDeletePool 
          Fn={setPoolDeleteModal} 
          data={poolDeleteModal.data}
          onConfirmDelete={confirmDeletePool}
          loading={deletePoolState?.loading || false}
        />
      )}
      {operatorEditModal.open && (
        <ModalOperator
          data={operatorEditModal.data}
          Fn={setOperatorEditModal}
          mode={operatorEditModal.data?.mode || 'edit'}
        />
      )}
      {operatorDeleteModal.open && (
        <ModalDeleteOperator 
          Fn={setOperatorDeleteModal}
          data={operatorDeleteModal.data}
          onConfirmDelete={confirmDeleteOperator}
          loading={deleteOperatorState?.loading || false}
        />
      )}
      {locationModal.open && (
        <ModalLocation
          role={userRole}
          location={locationModal.id}
          Fn={setLocationModal}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
        
        /* Horizontal scroll for tables */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #0891b2, #2563eb);
        }
        
        /* Touch-friendly buttons on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
};