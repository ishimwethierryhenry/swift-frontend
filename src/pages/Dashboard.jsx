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
import MQTTlive from "../service/MQTTlive";
import waterQualityService from '../services/waterQualityService';
import { ModalOperator } from "../components/ModalOperator"; // Add this line 
import { resetUpdatePoolState } from "../redux/slices/updatePoolSlice";




export const Dashboard = () => {
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
  const operatorsAvailableState = useSelector(
    (state) => state.operatorsByLocation
  );
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
  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("user_role");
  const userLocation = localStorage.getItem("user_location");
  // Add this selector after your existing selectors
  const updatePoolState = useSelector((state) => state.updatePool || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });


  // MQTT Connection Status Management
  const [poolConnectionStatus, setPoolConnectionStatus] = useState({});
  const [mqttClients, setMqttClients] = useState({});
  const [testingPools, setTestingPools] = useState({}); // Track which pools are being tested

  // Function to refresh data based on user role
  const refreshDashboardData = () => {
    setIsRefreshing(true);
    if (userRole === "operator" && userId) {
      dispatch(poolsAssigned(userId));
    } else if (userRole === "admin" && userLocation) {
      dispatch(poolsAvailable(userLocation));
      dispatch(operatorsAvailable(userLocation));
    } else if (userRole === "overseer") {
      dispatch(getLocations());
    }
    
    // Hide refresh indicator after 1 second
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [poolEditModal, setPoolEditModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [locationModal, setLocationModal] = useState({ id: null, open: false });
  const [pools, setPools] = useState([]);
  const [operators, setOperators] = useState([]);
  const [locations, setLocations] = useState([]);

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

  // MQTT Connection Management
  const connectToPoolMQTT = (poolName) => {
    // Map pool names to their corresponding MQTT topics
    const poolTopicMap = {
      'pool01': 'device_serena_pool01',
      'pool02': 'device_serena_pool02', 
      'pool702897': 'device_serena_pool702897',
      // Add more mappings as needed
    };

    const mqttTopic = poolTopicMap[poolName] || `device_serena_${poolName}`;
    
    console.log(`🔌 Connecting to MQTT for pool: ${poolName}, topic: ${mqttTopic}`);

    try {
      const client = MQTTlive(mqttTopic, (topic, message) => {
        console.log(`📊 Received data for ${poolName}:`, message);
        
        // Update connection status to 'Connected' when we receive data
        setPoolConnectionStatus(prev => ({
          ...prev,
          [poolName]: {
            status: 'Connected',
            lastUpdate: new Date().toLocaleTimeString(),
            hasData: true
          }
        }));
      });

      // Store client reference
      setMqttClients(prev => ({
        ...prev,
        [poolName]: client
      }));

      // Set initial connecting status
      setPoolConnectionStatus(prev => ({
        ...prev,
        [poolName]: {
          status: 'Connecting...',
          lastUpdate: new Date().toLocaleTimeString(),
          hasData: false
        }
      }));

      // Set a timeout to mark as disconnected if no data received
      setTimeout(() => {
        setPoolConnectionStatus(prev => {
          if (prev[poolName] && prev[poolName].status === 'Connecting...') {
            return {
              ...prev,
              [poolName]: {
                ...prev[poolName],
                status: 'Disconnected'
              }
            };
          }
          return prev;
        });
      }, 10000); // 10 seconds timeout

    } catch (error) {
      console.error(`❌ Failed to connect to MQTT for ${poolName}:`, error);
      setPoolConnectionStatus(prev => ({
        ...prev,
        [poolName]: {
          status: 'Error',
          lastUpdate: new Date().toLocaleTimeString(),
          hasData: false
        }
      }));
    }
  };

  // NEW: Handle TEST button functionality
  // NEW: Handle TEST button functionality - UPDATED VERSION
const handleTestPool = async (pool) => {
  const poolName = pool.name;
  console.log(`🧪 Starting TEST for pool: ${poolName}`);
  
  // Set testing state
  setTestingPools(prev => ({
    ...prev,
    [poolName]: {
      testing: true,
      startTime: new Date(),
      status: 'Recording data...'
    }
  }));

  try {
    // 1. Trigger device recording for this specific pool using API service
    const recordingData = await waterQualityService.startRecording({
      poolId: pool.id || pool._id,
      poolName: poolName,
      userId: userId,
      userRole: userRole,
      testInitiated: true,
      timestamp: new Date().toISOString()
    });

    console.log('📊 Recording started:', recordingData);

    // 2. Set up specific MQTT connection for this test
    const poolTopicMap = {
      'pool01': 'device_serena_pool01',
      'pool02': 'device_serena_pool02', 
      'pool702897': 'device_serena_pool702897',
    };

    const mqttTopic = poolTopicMap[poolName] || `device_serena_${poolName}`;
    
    // Create a test-specific MQTT client
    const testClient = MQTTlive(mqttTopic, (topic, message) => {
      console.log(`🧪 TEST data received for ${poolName}:`, message);
      
      // Process and assign data to this specific pool
      handleTestDataReceived(pool, message);
    });

    // Update testing status
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        ...prev[poolName],
        status: 'Waiting for data...',
        client: testClient
      }
    }));

    // 3. Set timeout for test completion (e.g., 30 seconds)
    setTimeout(() => {
      completeTest(pool);
    }, 30000); // 30 seconds test duration

  } catch (error) {
    console.error(`❌ TEST failed for ${poolName}:`, error);
    
    // Update testing state with error
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        testing: false,
        status: 'Test failed',
        error: error.message
      }
    }));

    // Show error notification
    alert(`Test failed for ${poolName}: ${error.message}`);
  }
};

  // Handle data received during test
  // Handle data received during test - UPDATED VERSION
const handleTestDataReceived = async (pool, data) => {
  const poolName = pool.name;
  console.log(`📝 Processing test data for ${poolName}:`, data);

  try {
    // Save data with pool assignment using API service
    const savedData = await waterQualityService.saveTestData({
      poolId: pool.id || pool._id,
      poolName: poolName,
      data: data,
      testMode: true,
      userId: userId,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Test data saved for ${poolName}:`, savedData);
    
    // Update testing status
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        ...prev[poolName],
        status: 'Data recorded successfully!',
        dataReceived: true,
        lastDataTime: new Date().toLocaleTimeString()
      }
    }));

  } catch (error) {
    console.error(`❌ Failed to save test data for ${poolName}:`, error);
    
    // Update testing status with error
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        ...prev[poolName],
        status: 'Failed to save data',
        error: error.message
      }
    }));
  }
};

// Add this function after your other handler functions (around line 280)
const confirmDeletePool = async (poolId) => {
  try {
    console.log("Deleting pool with ID:", poolId);
    // Dispatch the delete action
    dispatch(deletePool(poolId));
    // Close the modal
    setPoolDeleteModal({ id: null, open: false, data: null });
  } catch (error) {
    console.error("Failed to delete pool:", error);
  }
};

// Complete the test - UPDATED VERSION
const completeTest = async (pool) => {
  const poolName = pool.name;
  console.log(`🏁 Completing TEST for pool: ${poolName}`);

  try {
    // Stop device recording using API service
    await waterQualityService.stopRecording({
      poolId: pool.id || pool._id,
      poolName: poolName,
      userId: userId
    });

    // Disconnect test-specific MQTT client
    const testInfo = testingPools[poolName];
    if (testInfo?.client && testInfo.client.disconnect) {
      testInfo.client.disconnect();
    }

    // Update testing state
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        testing: false,
        status: prev[poolName]?.dataReceived ? 'Test completed successfully!' : 'Test completed - no data received',
        completed: true,
        endTime: new Date()
      }
    }));

    // Clear the testing status after 5 seconds
    setTimeout(() => {
      setTestingPools(prev => {
        const newState = { ...prev };
        delete newState[poolName];
        return newState;
      });
    }, 5000);

    console.log(`✅ TEST completed for ${poolName}`);

  } catch (error) {
    console.error(`❌ Error completing test for ${poolName}:`, error);
    
    // Update testing state with error
    setTestingPools(prev => ({
      ...prev,
      [poolName]: {
        testing: false,
        status: 'Error completing test',
        error: error.message,
        completed: true,
        endTime: new Date()
      }
    }));
  }
};  

  // Initialize MQTT connections for all pools
  useEffect(() => {
    if (pools.length > 0) {
      pools.forEach(pool => {
        if (pool.name && !mqttClients[pool.name]) {
          connectToPoolMQTT(pool.name);
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(mqttClients).forEach(client => {
        if (client && client.disconnect) {
          client.disconnect();
        }
      });
    };
  }, [pools]);

  // Get pool status with enhanced logic
  const getPoolStatus = (pool) => {
    const connectionInfo = poolConnectionStatus[pool.name];
    const testInfo = testingPools[pool.name];
    
    // If pool is being tested, show test status
    if (testInfo?.testing) {
      return {
        status: testInfo.status,
        color: 'bg-purple-500',
        textColor: 'text-white'
      };
    }
    
    if (!connectionInfo) {
      return {
        status: 'Unknown',
        color: 'bg-gray-500',
        textColor: 'text-white'
      };
    }

    switch (connectionInfo.status) {
      case 'Connected':
        return {
          status: 'Connected',
          color: 'bg-emerald-500',
          textColor: 'text-white'
        };
      case 'Connecting...':
        return {
          status: 'Connecting...',
          color: 'bg-yellow-500',
          textColor: 'text-white'
        };
      case 'Disconnected':
        return {
          status: 'Disconnected',
          color: 'bg-red-500',
          textColor: 'text-white'
        };
      case 'Error':
        return {
          status: 'Error',
          color: 'bg-orange-500',
          textColor: 'text-white'
        };
      default:
        return {
          status: 'Unknown',
          color: 'bg-gray-500',
          textColor: 'text-white'
        };
    }
  };

  const handleDelete = (id) => {};
  const handleEdit = (pool) => {
    setPoolEditModal({ id: pool.name, open: true, data: pool });
  };
  const handleView = (location) => {
    setLocationModal({ id: location.name, open: true });
  };
  
  const handleDeletePool = (pool) => {
  console.log("Delete pool clicked:", pool); // Debug log
  setPoolDeleteModal({ 
    id: pool.id || pool._id, 
    open: true, 
    data: pool 
  });
  // Make sure operator modal is closed
  setOperatorDeleteModal({ id: null, open: false, data: null });
};

    // ✅ FIXED: Proper View function
  const handleViewOperator = (operator) => {
    console.log("View operator:", operator);
    // Set operator modal state for viewing
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'view' } // Add view mode
    });
  };
  
  // ✅ FIXED: Proper Edit function  
  const handleEditOperator = (operator) => {
    console.log("Edit operator:", operator);
    // Set operator modal state for editing
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'edit' } // Add edit mode
    });
  };

  
  const handleDeleteOperator = (operator) => {
  console.log("Delete operator clicked:", operator); // Debug log
  setOperatorDeleteModal({ 
    id: operator.id || operator._id, 
    open: true, 
    data: operator 
  });
  // Make sure pool modal is closed
  setPoolDeleteModal({ id: null, open: false, data: null });
};


    // ✅ FIXED: Complete Delete function
  const confirmDeleteOperator = async (operatorId) => {
    try {
      console.log("Deleting operator with ID:", operatorId);
      // Dispatch the delete action (same pattern as pool delete)
      dispatch(deleteOperator(operatorId));
      // Close the modal
      setOperatorDeleteModal({ id: null, open: false, data: null });
    } catch (error) {
      console.error("Failed to delete operator:", error);
    }
  };


    // Add this useEffect for operator delete success
  useEffect(() => {
    if (deleteOperatorState?.serverResponded && deleteOperatorState?.response) {
      if (userRole === "admin") {
        dispatch(operatorsAvailable(userLocation));
      }
      dispatch(resetDeleteOperatorState());
    }
  }, [deleteOperatorState?.serverResponded, deleteOperatorState?.response, userRole, userLocation, dispatch]);

  // Add this useEffect for pool update success (put it with your other useEffects)
  useEffect(() => {
    if (updatePoolState?.serverResponded && updatePoolState?.response) {
      console.log('✅ Pool update successful, refreshing pools list...');
      
      // Refresh the appropriate pools list based on user role
      if (userRole === "operator" && userId) {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin" && userLocation) {
        dispatch(poolsAvailable(userLocation));
      }
      
      // Reset the update state
      dispatch(resetUpdatePoolState());
    }
  }, [updatePoolState?.serverResponded, updatePoolState?.response, userRole, userId, userLocation, dispatch]);

  // Handle delete pool success - refresh the pools list
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

  useEffect(() => {
    if (locationsState.serverResponded) {
      setLocations(locationsState.response);
    }
  }, [locationsState.serverResponded]);

  useEffect(() => {
    if (operatorsAvailableState.serverResponded) {
      setOperators(operatorsAvailableState.response);
    }
  }, [operatorsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAvailableState.serverResponded) {
      setPools(poolsAvailableState.response);
    }
  }, [poolsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAssignedState.serverResponded) {
      setPools(poolsAssignedState.response);
    }
  }, [poolsAssignedState.serverResponded]);

  useEffect(() => {
    if (userRole === "operator") {
      dispatch(poolsAssigned(userId));
    } else if (userRole === "admin") {
      dispatch(poolsAvailable(userLocation));
      dispatch(operatorsAvailable(userLocation));
    } else if (userRole === "overseer") {
      dispatch(getLocations());
    }
  }, []);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (userRole === "operator" && userId) {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin" && userLocation) {
        dispatch(poolsAvailable(userLocation));
        dispatch(operatorsAvailable(userLocation));
      } else if (userRole === "overseer") {
        dispatch(getLocations());
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

      {/* MQTT Connection Status Debug Panel
      {Object.keys(poolConnectionStatus).length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-lg rounded-lg p-3 text-xs text-white max-w-xs">
          <h4 className="font-bold mb-2 text-cyan-400">🔌 MQTT Status</h4>
          {Object.entries(poolConnectionStatus).map(([poolName, status]) => (
            <div key={poolName} className="flex justify-between mb-1">
              <span>{poolName}:</span>
              <span className={`font-semibold ${
                status.status === 'Connected' ? 'text-emerald-400' :
                status.status === 'Connecting...' ? 'text-yellow-400' :
                status.status === 'Disconnected' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {status.status}
              </span>
            </div>
          ))}
        </div>
      )} */}

      {/* Test Status Panel */}
      {Object.keys(testingPools).length > 0 && (
        <div className="fixed top-4 left-4 z-50 bg-purple-900/90 backdrop-blur-lg rounded-lg p-3 text-xs text-white max-w-xs">
          <h4 className="font-bold mb-2 text-purple-300">🧪 Test Status</h4>
          {Object.entries(testingPools).map(([poolName, testInfo]) => (
            <div key={poolName} className="mb-2 p-2 bg-purple-800/50 rounded">
              <div className="font-semibold text-purple-200">{poolName}</div>
              <div className="text-purple-100">{testInfo.status}</div>
              {testInfo.lastDataTime && (
                <div className="text-purple-300 text-xs">Last data: {testInfo.lastDataTime}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable Content Container */}
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

          {/* Admin Role - Pools Section */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Swimming Pools</h2>
                      <p className="font-semibold text-base sm:text-lg text-cyan-300">
                        {pools.length} total pools
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pools Display */}
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
                            <th className="text-left p-3 font-semibold text-sm">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pools.map((pool, index) => {
                            const statusInfo = getPoolStatus(pool);
                            const testInfo = testingPools[pool.name];
                            return (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm">{pool.name || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.depth || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.l || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.w || 'N/A'}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                                      {statusInfo.status}
                                    </span>
                                    {poolConnectionStatus[pool.name]?.hasData && !testInfo?.testing && (
                                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    )}
                                    {testInfo?.testing && (
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleTestPool(pool)}
                                      disabled={testInfo?.testing}
                                      className={`${
                                        testInfo?.testing 
                                          ? 'bg-purple-300 cursor-not-allowed' 
                                          : 'bg-purple-500 hover:bg-purple-600'
                                      } text-white px-3 py-1 rounded text-xs transition-colors duration-200`}
                                    >
                                      {testInfo?.testing ? 'Testing...' : 'TEST'}
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
                      {pools.map((pool, index) => {
                        const statusInfo = getPoolStatus(pool);
                        const testInfo = testingPools[pool.name];
                        return (
                          <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-base sm:text-lg">{pool.name || 'N/A'}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`${statusInfo.color} ${statusInfo.textColor} px-2 sm:px-3 py-1 rounded-full text-xs font-semibold`}>
                                  {statusInfo.status}
                                </span>
                                {poolConnectionStatus[pool.name]?.hasData && !testInfo?.testing && (
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                )}
                                {testInfo?.testing && (
                                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                )}
                              </div>
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
                            {poolConnectionStatus[pool.name]?.lastUpdate && (
                              <div className="text-xs text-gray-400 mb-3">
                                Last update: {poolConnectionStatus[pool.name].lastUpdate}
                              </div>
                            )}
                            {testInfo && (
                              <div className="text-xs text-purple-300 mb-3 p-2 bg-purple-900/30 rounded">
                                Test: {testInfo.status}
                                {testInfo.lastDataTime && (
                                  <div>Last data: {testInfo.lastDataTime}</div>
                                )}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTestPool(pool)}
                                disabled={testInfo?.testing}
                                className={`${
                                  testInfo?.testing 
                                    ? 'bg-purple-300 cursor-not-allowed' 
                                    : 'bg-purple-500 hover:bg-purple-600'
                                } text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 transition-colors duration-200`}
                              >
                                {testInfo?.testing ? 'Testing...' : 'TEST'}
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Role - Operators Section */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Operators</h2>
                      <p className="font-semibold text-base sm:text-lg text-blue-300">
                        {operators.length} active operators
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Operators Display */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    {/* Desktop Table View - Add back the View button */}
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
                     {operators.map((operator, index) => (
                       <tr key={index} className="border-b border-white/10">
                         <td className="p-3 text-sm">{operator.fname || 'N/A'}</td>
                         <td className="p-3 text-sm">{operator.lname || 'N/A'}</td>
                         <td className="p-3 text-sm">{operator.phone || 'N/A'}</td>
                         <td className="p-3 text-sm">{operator.email || 'N/A'}</td>
                         <td className="p-3 text-sm">{operator.location || 'N/A'}</td>
                         <td className="p-3">
                           <div className="flex gap-2">
                             {/* ✅ ADD BACK THE VIEW BUTTON */}
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
                      {operators.map((operator, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                          <div className="mb-3">
                            <h3 className="text-white font-semibold text-base sm:text-lg">
                              {operator.fname || 'N/A'} {operator.lname || ''}
                            </h3>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm mb-4">
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
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewOperator(operator)}
                              className="bg-gray-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 hover:bg-gray-600"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditOperator(operator)}
                              className="bg-yellow-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteOperator(operator)}
                              className="bg-red-500 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operator Role - Assigned Pools */}
          {userRole === "operator" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">Your Assigned Pools</h2>
                      <p className="font-semibold text-base sm:text-lg text-cyan-300">
                        {pools.length} pools under your care
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pools Display */}
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
                            <th className="text-left p-3 font-semibold text-sm">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pools.map((pool, index) => {
                            const statusInfo = getPoolStatus(pool);
                            const testInfo = testingPools[pool.name];
                            return (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm">{pool.name || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.depth || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.l || 'N/A'}</td>
                                <td className="p-3 text-sm">{pool.w || 'N/A'}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                                      {statusInfo.status}
                                    </span>
                                    {poolConnectionStatus[pool.name]?.hasData && !testInfo?.testing && (
                                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    )}
                                    {testInfo?.testing && (
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleTestPool(pool)}
                                      disabled={testInfo?.testing}
                                      className={`${
                                        testInfo?.testing 
                                          ? 'bg-purple-300 cursor-not-allowed' 
                                          : 'bg-purple-500 hover:bg-purple-600'
                                      } text-white px-3 py-1 rounded text-xs transition-colors duration-200`}
                                    >
                                      {testInfo?.testing ? 'Testing...' : 'TEST'}
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
                      {pools.map((pool, index) => {
                        const statusInfo = getPoolStatus(pool);
                        const testInfo = testingPools[pool.name];
                        return (
                          <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-base sm:text-lg">{pool.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`${statusInfo.color} ${statusInfo.textColor} px-2 sm:px-3 py-1 rounded-full text-xs font-semibold`}>
                                  {statusInfo.status}
                                </span>
                                {poolConnectionStatus[pool.name]?.hasData && !testInfo?.testing && (
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                )}
                                {testInfo?.testing && (
                                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                              <div>
                                <span className="text-gray-300 block">Depth</span>
                                <p className="text-white font-medium">{pool.depth}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Length</span>
                                <p className="text-white font-medium">{pool.length}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Width</span>
                                <p className="text-white font-medium">{pool.width}</p>
                              </div>
                            </div>
                            {poolConnectionStatus[pool.name]?.lastUpdate && (
                              <div className="text-xs text-gray-400 mb-3">
                                Last update: {poolConnectionStatus[pool.name].lastUpdate}
                              </div>
                            )}
                            {testInfo && (
                              <div className="text-xs text-purple-300 mb-3 p-2 bg-purple-900/30 rounded">
                                Test: {testInfo.status}
                                {testInfo.lastDataTime && (
                                  <div>Last data: {testInfo.lastDataTime}</div>
                                )}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTestPool(pool)}
                                disabled={testInfo?.testing}
                                className={`${
                                  testInfo?.testing 
                                    ? 'bg-purple-300 cursor-not-allowed' 
                                    : 'bg-purple-500 hover:bg-purple-600'
                                } text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex-1 transition-colors duration-200`}
                              >
                                {testInfo?.testing ? 'Testing...' : 'TEST'}
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
                          {locations.length} locations monitored
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
                            {locations.map((location, index) => (
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
                        {locations.map((location, index) => (
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
                  <p className="text-white text-2xl sm:text-3xl font-bold">{pools.length}</p>
                  <p className="text-cyan-200 text-xs sm:text-sm mt-2">Currently monitored</p>
                </div>
              </div>

              {/* Connected Devices Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-emerald-300 text-base sm:text-lg font-semibold mb-2">Connected Devices</h3>
                  <p className="text-white text-2xl sm:text-3xl font-bold">
                    {Object.values(poolConnectionStatus).filter(status => status.status === 'Connected').length}
                  </p>
                  <p className="text-emerald-200 text-xs sm:text-sm mt-2">Live data streaming</p>
                </div>
              </div>

              {/* Tests Running Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-purple-300 text-base sm:text-lg font-semibold mb-2">Active Tests</h3>
                  <p className="text-white text-2xl sm:text-3xl font-bold">
                    {Object.values(testingPools).filter(test => test.testing).length}
                  </p>
                  <p className="text-purple-200 text-xs sm:text-sm mt-2">Currently running</p>
                </div>
              </div>

              {/* Active Operators Card (Admin only) */}
              {userRole === "admin" && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-blue-300 text-base sm:text-lg font-semibold mb-2">Active Operators</h3>
                    <p className="text-white text-2xl sm:text-3xl font-bold">{operators.length}</p>
                    <p className="text-blue-200 text-xs sm:text-sm mt-2">Managing facilities</p>
                  </div>
                </div>
              )}

              {/* Locations Card (Overseer only) */}
              {userRole === "overseer" && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-purple-300 text-base sm:text-lg font-semibold mb-2">Locations</h3>
                    <p className="text-white text-2xl sm:text-3xl font-bold">{locations.length}</p>
                    <p className="text-purple-200 text-xs sm:text-sm mt-2">Under supervision</p>
                  </div>
                </div>
              )}

              {/* System Status Card */}
              {(userRole === "operator" || Object.keys(testingPools).length === 0) && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-green-300 text-base sm:text-lg font-semibold mb-2">System Status</h3>
                    <p className="text-white text-2xl sm:text-3xl font-bold">Online</p>
                    <p className="text-green-200 text-xs sm:text-sm mt-2">All systems operational</p>
                  </div>
                </div>
              )}
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
       {/* ✅ ADD OPERATOR EDIT MODAL */}
       {operatorEditModal.open && (
         <ModalOperator  // You'll need to create this component
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
        
        /* Responsive iframe */
        iframe {
          max-width: 100%;
          height: 100%;
        }
        
        /* Touch-friendly buttons on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Test button animation */
        .test-button-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .8;
          }
        }
      `}</style>
    </div>
  );
};