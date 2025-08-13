import React, { useEffect, useState } from "react";
import PhChart from "../components/PhChart";
import ParameterCard from "../components/ParameterCard";
import { useDispatch, useSelector } from "react-redux";
import { predictionNow } from "../redux/slices/predictionSlice";
import { useParams } from "react-router-dom";
import MQTTlive from "../service/MQTTlive";
import TdsChart from "../components/TdsChart";
import TbdtChart from "../components/TbdtChart";

function Pool() {
  const MAX_DATA_POINTS = 120;

  let { topic } = useParams();
  const dispatch = useDispatch();
  const predictionState = useSelector((state) => state.prediction);

  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [maintainancePrediction, setMaintainancePrediction] = useState(null);
  const [chartData, setChartData] = useState([]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePrediction = () => {
    if (predictionState.loading) return;
    dispatch(predictionNow());
  };

  useEffect(() => {
    if (predictionState.serverResponded) {
      setMaintainancePrediction(predictionState.response);
      console.log(predictionState.response);
    }
  }, [predictionState.serverResponded]);

  useEffect(() => {
    setIsVisible(true);
    
    // Connect to MQTT and handle incoming messages
    const client = MQTTlive(topic, (topic, message) => {
      // console.log(`Received message: ${message} on topic: ${topic}`);
      const data = JSON.parse(message);
      const time = new Date().toLocaleTimeString();
      setChartData((prevData) => {
        const newData = [
          ...prevData,
          {
            time,
            tbdt: data.tbdt.toFixed(2),
            ph: data.ph.toFixed(2),
            tds: data.tds.toFixed(2),
          },
        ];
        if (newData.length > MAX_DATA_POINTS) {
          newData.shift(); // Remove the oldest data point to keep the array size within the limit
        }
        return newData;
      });
      setSensorData(data);
    });

    // Clean up the connection on unmount
    return () => {
      if (client) {
        console.log("MQTT disconnect");
        client.disconnect();
      }
    };
  }, []);

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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements - Responsive */}
      <div className="absolute inset-0">
        <div className="absolute top-5 left-5 sm:top-10 sm:left-10 md:top-20 md:left-20 w-32 h-32 sm:w-48 sm:h-48 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-10 right-5 sm:top-20 sm:right-10 md:top-40 md:right-20 w-32 h-32 sm:w-48 sm:h-48 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-5 left-10 sm:bottom-10 sm:left-20 md:bottom-20 md:left-40 w-32 h-32 sm:w-48 sm:h-48 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
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

      {/* Header - Mobile Optimized */}
      <div className={`flex flex-col sm:flex-row items-center justify-between w-full py-3 sm:py-4 px-4 sm:px-6 md:px-8 backdrop-blur-lg bg-white/10 border-b border-white/20 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        
        {/* Logo Section - Updated with Custom Image */}
        <div className="flex flex-row justify-center items-center group mb-2 sm:mb-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
            <img 
              src="src/assets/logo2.png"
              alt="SWIFT Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-cover rounded-full"
            />
          </div>
          <label className="font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-wide">SWIFT</label>
        </div>
        
        {/* Status Section - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm sm:text-base">LIVE</span>
          </div>
          <div className="text-white text-center sm:text-left">
            <span className="text-gray-300 text-sm sm:text-base">Status: </span>
            <span className={`font-bold text-sm sm:text-base ${overallStatus.color}`}>{overallStatus.status}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container - Responsive */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-16 sm:pb-20">
          
          {/* Title Section - Mobile Optimized */}
          <div className={`text-center mb-4 sm:mb-6 md:mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="overflow-hidden">
              <label className={`font-bold text-2xl sm:text-3xl md:text-4xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Real-Time Pool Monitor
              </label>
            </div>
            <div className="overflow-hidden">
              <label className={`font-bold text-base sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-1 sm:mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Topic: {topic || "Not Connected"}
              </label>
            </div>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-3 sm:mt-4"></div>
          </div>

          {/* Parameter Cards - Mobile-First Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* pH Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
              <div className={`absolute -inset-2 sm:-inset-3 md:-inset-4 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">pH Level</label>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.ph > 7.1 && sensorData?.ph < 7.3 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.ph > 7.1 && sensorData?.ph < 7.3 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {sensorData?.ph.toFixed(2) || "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    Optimal: 7.1 - 7.3
                  </div>
                </div>
              </div>
            </div>

            {/* Turbidity Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <div className={`absolute -inset-2 sm:-inset-3 md:-inset-4 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.tbdt <= 50 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.tbdt <= 50 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">Turbidity</label>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.tbdt <= 50 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.tbdt <= 50 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {Math.max(0, sensorData?.tbdt.toFixed(2)) || "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    NTU (Max: 50)
                  </div>
                </div>
              </div>
            </div>

            {/* Conductivity Card - Mobile Optimized */}
            <div className={`relative group transition-all duration-700 delay-1200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} lg:col-span-1`}>
              <div className={`absolute -inset-2 sm:-inset-3 md:-inset-4 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                sensorData?.tds < 2001 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-red-500 to-orange-500"
              }`}></div>
              <div className={`relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 ${
                sensorData?.tds < 2001 
                  ? "border-emerald-400 hover:border-emerald-300" 
                  : "border-red-400 hover:border-red-300"
              }`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">Conductivity</label>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      sensorData?.tds < 2001 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" 
                        : "bg-red-500/20 text-red-300 border border-red-400"
                    }`}>
                      {sensorData?.tds < 2001 ? "Safe" : "Not Safe"}
                    </div>
                  </div>
                  <label className="font-bold text-3xl sm:text-4xl md:text-5xl text-cyan-300">
                    {sensorData?.tds.toFixed(2) || "0.00"}
                  </label>
                  <div className="text-xs sm:text-sm text-gray-300">
                    ppm (Max: 2000)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - Mobile Responsive */}
          <div className={`relative group transition-all duration-1000 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="text-center">
                  <label className="font-bold text-xl sm:text-2xl md:text-3xl text-white">Water Parameters Analytics</label>
                  <p className="text-gray-300 mt-2 text-sm sm:text-base">Real-time data visualization and trends</p>
                </div>
                
                {/* Charts Container - Mobile Stack */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/10">
                  <div className="flex flex-col lg:flex-row w-full gap-3 sm:gap-4">
                    
                    {/* Mobile: Stack charts vertically */}
                    <div className="flex-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <PhChart data={chartData} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <TdsChart data={chartData} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
                      <div className="h-full">
                        <TbdtChart data={chartData} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Prediction - Mobile Optimized */}
                {maintainancePrediction && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-400/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg sm:text-xl text-white">Maintenance Prediction</h3>
                        <p className="text-purple-300 mt-1 text-sm sm:text-base">
                          Next cleaning: {maintainancePrediction.hour < 1 ? "Now" : `${maintainancePrediction.hour} hours`}
                        </p>
                      </div>
                      <button
                        onClick={handlePrediction}
                        disabled={predictionState.loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/25 disabled:cursor-not-allowed disabled:transform-none min-h-[44px] text-sm sm:text-base"
                      >
                        {predictionState.loading ? 'Predicting...' : 'Update Prediction'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Ensure chart containers are responsive */
        .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Touch-friendly buttons */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
          }
        }
        
        /* Prevent horizontal scroll on mobile */
        @media (max-width: 640px) {
          * {
            max-width: 100vw;
          }
        }
      `}</style>
    </div>
  );
}

export default Pool;