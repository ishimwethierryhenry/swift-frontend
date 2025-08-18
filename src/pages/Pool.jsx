// =================== FULLY RESPONSIVE POOL PAGE ===================
// Updated Pool.jsx with correct MQTT topic and full responsiveness
import React, { useEffect, useState } from "react";
import PhChart from "../components/PhChart";
import ParameterCard from "../components/ParameterCard";
import { useDispatch, useSelector } from "react-redux";
import { predictionNow } from "../redux/slices/predictionSlice";
import { useParams } from "react-router-dom";
import MQTTlive from "../service/MQTTlive";
import TdsChart from "../components/TdsChart";
import TbdtChart from "../components/TbdtChart";
import logo2 from "../assets/logo2.png";
import { FiEye, FiShield } from "react-icons/fi";

function Pool() {
  const MAX_DATA_POINTS = 120;

  let { topic } = useParams();
  const dispatch = useDispatch();
  const predictionState = useSelector((state) => state.availability || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
});  
  // Get user role for access control
  const userRole = localStorage.getItem("user_role");
  const userLocation = localStorage.getItem("user_location");

  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [maintainancePrediction, setMaintainancePrediction] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePrediction = () => {
  if (predictionState?.loading || userRole === "guest") return;
    dispatch(predictionNow());
  };    

  useEffect(() => {
  if (predictionState?.serverResponded && predictionState?.response) {
    setMaintainancePrediction(predictionState.response);
    console.log(predictionState.response);
  }
}, [predictionState?.serverResponded, predictionState?.response]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // FIXED: Use the exact topic that your ESP8266 device publishes to
    const deviceTopic = "device_serena_pool02"; // This matches your ESP8266 code
    
    console.log(`🔌 Connecting to MQTT topic: ${deviceTopic}/sensor`);
    
    // Connect to MQTT and handle incoming messages
    const client = MQTTlive(deviceTopic, (receivedTopic, message) => {
      console.log(`✅ Received MQTT message on topic: ${receivedTopic}`);
      console.log(`📊 Raw message data: ${message}`);
      
      try {
        const data = JSON.parse(message);
        console.log(`📈 Parsed sensor data:`, data);
        
        // Validate data structure
        if (data.ph !== undefined && data.tds !== undefined && data.tbdt !== undefined) {
          const time = new Date().toLocaleTimeString();
          
          // Update chart data
          setChartData((prevData) => {
            const newData = [
              ...prevData,
              {
                time,
                tbdt: Number(data.tbdt).toFixed(2),
                ph: Number(data.ph).toFixed(2),
                tds: Number(data.tds).toFixed(2),
              },
            ];
            if (newData.length > MAX_DATA_POINTS) {
              newData.shift(); // Remove the oldest data point
            }
            return newData;
          });
          
          // Update current sensor data
          setSensorData({
            ph: Number(data.ph),
            tds: Number(data.tds),
            tbdt: Number(data.tbdt)
          });
          
          setConnectionStatus('Connected & Receiving Data');
          console.log(`✅ Data updated successfully at ${time}`);
        } else {
          console.warn('⚠️ Received incomplete sensor data:', data);
        }
      } catch (error) {
        console.error('❌ Error parsing MQTT message:', error);
        console.error('Raw message that failed to parse:', message);
      }
    });

    // Add connection status monitoring
    if (client) {
      // Check connection status periodically
      const statusCheck = setInterval(() => {
        if (client.isConnected && client.isConnected()) {
          if (connectionStatus === 'Connecting...') {
            setConnectionStatus('Connected - Waiting for Data');
          }
        } else {
          setConnectionStatus('Disconnected');
        }
      }, 2000);

      // Clean up on unmount
      return () => {
        clearTimeout(timer);
        clearInterval(statusCheck);
        if (client) {
          console.log("🔌 MQTT disconnect");
          client.disconnect();
        }
      };
    }

    return () => clearTimeout(timer);
  }, []); // Removed topic dependency since we're using hardcoded topic

  // Calculate overall pool status
  const getOverallStatus = () => {
    if (!sensorData) return { status: "No Data", color: "text-gray-400" };
    
    const phSafe = sensorData.ph > 7.1 && sensorData.ph < 7.3;
    const tbdtSafe = sensorData.tbdt <= 50;
    const tdsSafe = sensorData.tds < 2001;
    
    if (phSafe && tbdtSafe && tdsSafe) {
      return { status: "Optimal", color: "text-emerald-400" };
    } else if ((phSafe && tbdtSafe) || (phSafe && tdsSafe) || (tbdtSafe && tdsSafe)) {
      return { status: "Caution", color: "text-yellow-400" };
    } else {
      return { status: "Critical", color: "text-red-400" };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative main-container">
      {/* Animated Background Elements - Responsive */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-2 sm:top-5 sm:left-5 lg:top-10 lg:left-10 xl:top-20 xl:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-4 right-2 sm:top-10 sm:right-5 lg:top-20 lg:right-10 xl:top-40 xl:right-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-2 left-4 sm:bottom-5 sm:left-10 lg:bottom-10 lg:left-20 xl:bottom-20 xl:left-40 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles - Responsive */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 bg-cyan-300 rounded-full opacity-40 animate-bounce`}
            style={{
              left: `${15 + i * 8}%`,
              top: `${25 + i * 6}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2.5 + i * 0.3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content Container - Mobile Optimized */}
      <div className="relative z-10 content-wrapper">
        
        {/* Header - Mobile Optimized */}
        <div className={`flex flex-col sm:flex-row items-center justify-between w-full py-2 xs:py-3 sm:py-4 px-2 xs:px-3 sm:px-6 md:px-8 backdrop-blur-lg bg-white/10 border-b border-white/20 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          
          {/* Logo Section - Mobile Optimized */}
          <div className="flex flex-row justify-center items-center group mb-1 xs:mb-2 sm:mb-0">
            <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-1 xs:mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
              <img 
                src={logo2}
                alt="SWIFT Logo"
                className="w-4 h-4 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-cover rounded-full"
              />
            </div>
            <label className="font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl text-white tracking-wide">SWIFT</label>
          </div>
          
          {/* Status Section - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-center gap-1 xs:gap-2 sm:gap-3">
            <div className="flex items-center gap-1 xs:gap-2">
              <div className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-3 sm:h-3 rounded-full ${
                connectionStatus.includes('Receiving') ? 'bg-emerald-400 animate-pulse' :
                connectionStatus.includes('Connected') ? 'bg-yellow-400 animate-pulse' :
                connectionStatus.includes('Connecting') ? 'bg-blue-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-white font-semibold text-xs xs:text-sm sm:text-base">
                {connectionStatus.includes('Receiving') ? 'LIVE' : 
                 connectionStatus.includes('Connected') ? 'CONNECTED' :
                 connectionStatus.includes('Connecting') ? 'CONNECTING' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-white text-center sm:text-left">
              <span className="text-gray-300 text-xs xs:text-sm sm:text-base">Status: </span>
              <span className={`font-bold text-xs xs:text-sm sm:text-base ${overallStatus.color}`}>{overallStatus.status}</span>
            </div>
          </div>
        </div>

        <div className="p-1 xs:p-2 sm:p-3 lg:p-4 xl:p-6 2xl:p-8 max-w-7xl mx-auto space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">

          {/* Connection Debug Info */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-2 xs:p-3">
              <div className="flex items-center justify-between text-xs xs:text-sm">
                <span className="text-blue-300">MQTT Status:</span>
                <span className="text-blue-200 font-mono">{connectionStatus}</span>
              </div>
              <div className="flex items-center justify-between text-xs xs:text-sm mt-1">
                <span className="text-blue-300">Device Topic:</span>
                <span className="text-blue-200 font-mono">device_serena_pool02/sensor</span>
              </div>
              {sensorData && (
                <div className="flex items-center justify-between text-xs xs:text-sm mt-1">
                  <span className="text-blue-300">Last Update:</span>
                  <span className="text-blue-200 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guest Access Banner - only show for guests */}
          {userRole === "guest" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg sm:rounded-xl p-3 xs:p-4">
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiEye className="text-white" size={12} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-amber-300 font-semibold text-sm xs:text-base">Guest Access - View Only Mode</h3>
                    <p className="text-amber-200 text-xs xs:text-sm">You have read-only access to pool monitoring data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title Section - Mobile Optimized */}
          <div className={`text-center mb-2 xs:mb-3 sm:mb-4 lg:mb-6 xl:mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="overflow-hidden">
              <label className={`font-bold text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Real-Time Pool Monitor
              </label>
            </div>
            <div className="overflow-hidden">
              <label className={`font-bold text-sm xs:text-base sm:text-lg lg:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-1 xs:mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Device: The selected pool is currently under test...
              </label>
            </div>
            <div className="w-8 xs:w-12 sm:w-16 lg:w-20 xl:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-2 xs:mt-3 sm:mt-4"></div>
          </div>

          {/* Parameter Cards - Mobile-First Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 lg:gap-5 xl:gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* pH Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-800 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              <div className={`absolute -inset-1 xs:-inset-2 sm:-inset-3 md:-inset-4 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl text-white">pH Level</label>
                    <div className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.ph > 7.1 && sensorData?.ph < 7.3 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {sensorData?.ph ? sensorData.ph.toFixed(2) : "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    Optimal: 7.1 - 7.3
                  </div>
                </div>
              </div>
            </div>

            {/* Turbidity Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <div className={`absolute -inset-1 xs:-inset-2 sm:-inset-3 md:-inset-4 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.tbdt <= 50 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.tbdt <= 50 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl text-white">Turbidity</label>
                    <div className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.tbdt <= 50 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.tbdt <= 50 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {sensorData?.tbdt ? Math.max(0, sensorData.tbdt.toFixed(2)) : "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    NTU (Max: 50)
                  </div>
                </div>
              </div>
            </div>

            {/* Conductivity Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} lg:col-span-1`}>
              <div className={`absolute -inset-1 xs:-inset-2 sm:-inset-3 md:-inset-4 rounded-xl sm:rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.tds < 2001 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.tds < 2001 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl text-white">Conductivity</label>
                    <div className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.tds < 2001 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.tds < 2001 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {sensorData?.tds ? sensorData.tds.toFixed(2) : "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    ppm (Max: 2000)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - Mobile Responsive */}
          <div className={`relative group transition-all duration-1000 delay-1100 charts-container ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute -inset-1 xs:-inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            <div className="relative backdrop-blur-lg bg-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              
              <div className="flex flex-col gap-3 xs:gap-4 sm:gap-6">
                <div className="text-center">
                  <label className="font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl text-white">Water Parameters Analytics</label>
                  <p className="text-gray-300 mt-1 xs:mt-2 text-xs xs:text-sm sm:text-base">Real-time data visualization and trends</p>
                </div>
                
                {/* Charts Container - Mobile Stack */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2 xs:p-3 sm:p-4 md:p-6 border border-white/10">
                  <div className="flex flex-col lg:flex-row w-full gap-2 xs:gap-3 sm:gap-4">
                    
                    {/* Mobile: Stack charts vertically */}
                    <div className="flex-1 min-h-[150px] xs:min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <PhChart data={chartData} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-[150px] xs:min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <TdsChart data={chartData} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-[150px] xs:min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <TbdtChart data={chartData} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Prediction - Mobile Optimized with Guest Access Control */}
                {maintainancePrediction && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 xs:p-4 sm:p-6 border border-purple-400/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base xs:text-lg sm:text-xl text-white">Maintenance Prediction</h3>
                        <p className="text-purple-300 mt-1 text-xs xs:text-sm sm:text-base">
                          Next cleaning: {maintainancePrediction.hour < 1 ? "Now" : `${maintainancePrediction.hour} hours`}
                        </p>
                      </div>
                      {/* Show different button based on user role */}
                      {userRole !== "guest" ? (
                        <button
                          onClick={handlePrediction}
                          disabled={predictionState?.loading}
                          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-3 xs:px-4 sm:px-6 py-2 xs:py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/25 disabled:cursor-not-allowed disabled:transform-none min-h-[44px] text-xs xs:text-sm sm:text-base"
                        >
                          {predictionState?.loading ? 'Predicting...' : 'Update Prediction'}
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto bg-gray-500/20 text-gray-400 font-semibold px-3 xs:px-4 sm:px-6 py-2 xs:py-3 rounded-lg sm:rounded-xl min-h-[44px] text-xs xs:text-sm sm:text-base flex items-center justify-center">
                          <FiEye className="mr-1 xs:mr-2" size={12} />
                          View Only Access
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Extra bottom spacing to match other pages */}
                <div className="h-12 sm:h-16 lg:h-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Responsive Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Enhanced scrollbar styling for all devices */
        * {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 rgba(255, 255, 255, 0.1);
        }
        
        *::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
        
        /* Main container scrolling fix */
        .main-container {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Content spacing fixes - MATCH OTHER PAGES EXACTLY */
        .content-wrapper {
          min-height: 100vh;
          padding-bottom: 20rem;
        }
        
        @media (max-width: 640px) {
          .content-wrapper {
            padding-bottom: 16rem;
          }
        }
        
        @media (max-width: 375px) {
          .content-wrapper {
            padding-bottom: 12rem;
          }
        }
        
        /* Fix for mobile viewport height issues */
        @supports (-webkit-touch-callout: none) {
          .main-container {
            height: -webkit-fill-available;
          }
        }
        
        /* Responsive breakpoints */
        @media (min-width: 475px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
        
        /* Ensure chart containers are responsive */
        .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Touch-friendly buttons for all devices */
        @media (max-width: 1024px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Optimize for tablets */
        @media (min-width: 768px) and (max-width: 1024px) {
          .tablet-optimized {
            font-size: 1rem;
            padding: 1rem;
          }
        }
        
        /* Large screen optimizations */
        @media (min-width: 1536px) {
          .container {
            max-width: 1400px;
          }
        }
        
        /* Ultra-wide screen support */
        @media (min-width: 1920px) {
          .ultra-wide-spacing {
            padding: 2rem 4rem;
          }
        }
        
        /* Smart TV optimizations */
        @media (min-width: 2560px) {
          .tv-optimized {
            font-size: 1.5rem;
            line-height: 1.8;
          }
        }
        
        /* Ensure proper viewport handling and scrolling */
        html, body {
          overflow-x: hidden;
          scroll-behavior: smooth;
          height: 100%;
        }
        
        /* Fix iOS safe areas */
        @supports (padding: max(0px)) {
          .safe-area-padding {
            padding-left: max(0.5rem, env(safe-area-inset-left));
            padding-right: max(0.5rem, env(safe-area-inset-right));
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
        
        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .high-dpi-text {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
        
        /* Prevent horizontal overflow on small screens */
        .overflow-guard {
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        /* Improved focus states for accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #06b6d4;
          outline-offset: 2px;
        }
        
        /* Smooth scrolling for all elements */
        * {
          scroll-behavior: smooth;
        }
        
        /* Optimize animations for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Ensure Charts section is never cut off */
        .charts-container {
          margin-bottom: 4rem;
        }
        
        @media (max-width: 640px) {
          .charts-container {
            margin-bottom: 3rem;
          }
        }
        
        @media (max-width: 375px) {
          .charts-container {
            margin-bottom: 2.5rem;
          }
        }
        
        /* Additional mobile optimizations */
        @media (max-width: 375px) {
          .text-responsive {
            font-size: 0.75rem;
            line-height: 1.2;
          }
          
          .padding-mobile {
            padding: 0.5rem;
          }
        }
        
        /* Ensure all content is visible on very small screens */
        @media (max-height: 600px) {
          .content-wrapper {
            padding-bottom: 6rem;
          }
        }
        
        @media (max-height: 500px) {
          .content-wrapper {
            padding-bottom: 5rem;
          }
        }
        
        /* Additional bottom spacing for landscape mode */
        @media (orientation: landscape) and (max-height: 500px) {
          .content-wrapper {
            padding-bottom: 4rem;
          }
        }
        
        /* Ultra-mobile optimizations for very small phones */
        @media (max-width: 320px) {
          .ultra-mobile {
            font-size: 0.7rem;
            padding: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Pool;