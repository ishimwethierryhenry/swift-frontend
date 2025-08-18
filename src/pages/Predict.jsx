import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";
import { forecast, forecastActions } from "../redux/slices/forecastSlice";
import {
  predictionActions,
  predictionNow,
} from "../redux/slices/predictionSlice";

export const Predict = () => {
  const dispatch = useDispatch();
  const forecastState = useSelector((state) => state.forecast || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
});

  const forecastAdvState = useSelector((state) => state.availability || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
});
  const [isVisible, setIsVisible] = useState(false);
  const [forecastData, setForecastData] = useState({
    day: null,
    hour: null,
  });
  const [forecastResponse, setForecastResponse] = useState();
  const [forecastAdvResponse, setForecastAdvResponse] = useState();
  const [predictionError, setPredictionError] = useState(false);

  const hours = [
    { val: 8, label: "8 AM" },
    { val: 9, label: "9 AM" },
    { val: 10, label: "10 AM" },
    { val: 11, label: "11 AM" },
    { val: 12, label: "12 PM" },
    { val: 13, label: "1 PM" },
    { val: 14, label: "2 PM" },
    { val: 15, label: "3 PM" },
    { val: 16, label: "4 PM" },
    { val: 17, label: "5 PM" },
    { val: 18, label: "6 PM" },
    { val: 19, label: "7 PM" },
    { val: 20, label: "8 PM" },
  ];

  const handleForecastAdvanced = () => {
    setPredictionError(false);
    dispatch(predictionActions.resetData());
    dispatch(predictionNow());
  };

  const handleForecast = (e) => {
    e.preventDefault();

    if (forecastData.day < 1 || forecastData.hour < 1) return;

    dispatch(forecastActions.resetData());
    dispatch(forecast(forecastData));
  };

  const handleInput = (e) => {
    e.preventDefault();

    setForecastData((prevState) => ({
      ...prevState,
      hour: e.target.name === "hour" ? e.target.value : prevState.hour,
      day: e.target.name === "day" ? e.target.value : prevState.day,
    }));
  };

  useEffect(() => {
  if (forecastAdvState?.serverResponded && forecastAdvState?.response) {
    console.log(forecastAdvState.response);
    if (forecastAdvState.response.error) setPredictionError(true);
    setForecastAdvResponse(forecastAdvState.response);
  }
}, [forecastAdvState?.serverResponded, forecastAdvState?.response]);

  useEffect(() => {
  if (forecastState?.serverResponded && forecastState?.response) {
    setForecastResponse(forecastState.response);
  }
}, [forecastState?.serverResponded, forecastState?.response]);

  useEffect(() => {
    dispatch(activeLinksActions.setActiveLink("Prediction"));
    setIsVisible(true);

    return () => {
      dispatch(predictionActions.resetData());
      dispatch(forecastActions.resetData());
      setForecastAdvResponse();
      setForecastData({
        day: null,
        hour: null,
      });
    };
  }, []);

  const isWaterSafe = forecastResponse && 
    (forecastResponse?.Conductivity <= 2000) &
    (forecastResponse.Turbidity <= 50) &
    (forecastResponse?.pH <= 7.8) &
    (forecastResponse?.pH >= 7.2);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements - Responsive */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-10 sm:top-40 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 sm:bottom-20 sm:left-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles - Responsive */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + i * 8}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Scrollable Content Container - Responsive */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-16 sm:pb-20">
          
          {/* Title Section - Responsive */}
          <div className={`text-center mb-8 sm:mb-10 md:mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="overflow-hidden">
              <label className={`font-bold text-3xl sm:text-4xl md:text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                AI Prediction Center
              </label>
            </div>
            <div className="overflow-hidden">
              <label className={`font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Advanced water quality forecasting with 88% accuracy
              </label>
            </div>
            <div className="w-24 sm:w-28 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-4 sm:mt-6"></div>
          </div>

          {/* Selective Prediction Card - Mobile Optimized */}
          <div className={`relative group transition-all duration-700 delay-900 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="font-bold text-xl sm:text-2xl md:text-3xl text-white">Selective Prediction</label>
                  <label className="font-semibold text-base sm:text-lg text-cyan-300">Time-Specific Forecasting</label>
                </div>
                
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Use this interface to run prediction for a specific time of the week with an accuracy of over 88%
                </p>

                <form onSubmit={handleForecast} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Day Selection */}
                    <div className="flex flex-col gap-2">
                      <label className="text-white font-semibold text-base sm:text-lg">Choose Day:</label>
                      <select
                        name="day"
                        className="h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        onChange={handleInput}
                        id="day"
                        value={forecastData.day || "0"}
                      >
                        <option value="0" className="bg-slate-800 text-white">Select Day</option>
                        <option value="1" className="bg-slate-800 text-white">Monday</option>
                        <option value="2" className="bg-slate-800 text-white">Tuesday</option>
                        <option value="3" className="bg-slate-800 text-white">Wednesday</option>
                        <option value="4" className="bg-slate-800 text-white">Thursday</option>
                        <option value="5" className="bg-slate-800 text-white">Friday</option>
                        <option value="6" className="bg-slate-800 text-white">Saturday</option>
                        <option value="7" className="bg-slate-800 text-white">Sunday</option>
                      </select>
                    </div>

                    {/* Hour Selection */}
                    <div className="flex flex-col gap-2">
                      <label className="text-white font-semibold text-base sm:text-lg">Choose Hour:</label>
                      <select
                        name="hour"
                        className="h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        onChange={handleInput}
                        id="hour"
                        value={forecastData.hour || "0"}
                      >
                        <option value="0" className="bg-slate-800 text-white">Select Hour</option>
                        {hours.map((item) => (
                          <option key={item.val} value={item.val} className="bg-slate-800 text-white">
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Button - Full Width on Mobile */}
                    <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                      <button
                        type="submit"
                        disabled={forecastState.loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-cyan-500/25 disabled:cursor-not-allowed disabled:transform-none min-h-[44px] text-sm sm:text-base"
                      >
                        {forecastState?.loading ? 'Predicting...' : 'Predict'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Prediction Results Card - Mobile Responsive */}
          {forecastResponse && (
            <div className={`relative group transition-all duration-700 delay-1100 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                
                <div className="flex flex-col gap-4 sm:gap-6">
                  <label className="font-bold text-xl sm:text-2xl md:text-3xl text-white">Prediction Results</label>
                  
                  {/* Parameter Cards - Mobile Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* pH Card */}
                    <div className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      (forecastResponse?.pH <= 7.8) & (forecastResponse?.pH >= 7.2)
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-red-400 bg-red-500/20"
                    }`}>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">pH Level</label>
                        <label className="font-bold text-2xl sm:text-3xl md:text-4xl text-cyan-300">
                          {forecastResponse?.pH.toFixed(2)}
                        </label>
                        <div className="text-xs sm:text-sm text-gray-300">
                          Optimal: 7.2 - 7.8
                        </div>
                      </div>
                    </div>

                    {/* Turbidity Card */}
                    <div className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      forecastResponse.Turbidity <= 50
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-red-400 bg-red-500/20"
                    }`}>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">Turbidity</label>
                        <label className="font-bold text-2xl sm:text-3xl md:text-4xl text-cyan-300">
                          {forecastResponse.Turbidity.toFixed(2)}
                        </label>
                        <div className="text-xs sm:text-sm text-gray-300">
                          NTU (Max: 50)
                        </div>
                      </div>
                    </div>

                    {/* Conductivity Card */}
                    <div className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 md:col-span-1 ${
                      forecastResponse?.Conductivity <= 2000
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-red-400 bg-red-500/20"
                    }`}>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <label className="font-bold text-lg sm:text-xl md:text-2xl text-white">Conductivity</label>
                        <label className="font-bold text-2xl sm:text-3xl md:text-4xl text-cyan-300">
                          {forecastResponse?.Conductivity.toFixed(2)}
                        </label>
                        <div className="text-xs sm:text-sm text-gray-300">
                          ppm (Max: 2000)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Message - Mobile Optimized */}
                  <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
                    isWaterSafe 
                      ? "border-emerald-400 bg-emerald-500/20" 
                      : "border-red-400 bg-red-500/20"
                  }`}>
                    <p className={`font-bold text-sm sm:text-base md:text-lg ${
                      isWaterSafe ? "text-emerald-300" : "text-red-300"
                    }`}>
                      {isWaterSafe
                        ? "✅ The prediction indicates that the water parameters are going to be safe for the time predicted. Pool is ready for use."
                        : "⚠️ The prediction indicates that the water parameters are going to be unsafe for the time predicted. Immediate action required."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Prediction Card - Mobile Responsive */}
          <div className={`relative group transition-all duration-700 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="font-bold text-xl sm:text-2xl md:text-3xl text-white">Maintenance Prediction</label>
                  <label className="font-semibold text-base sm:text-lg text-purple-300">Advanced AI Scheduling</label>
                </div>
                
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Use this interface to predict when the current swimming pool will need to be cleaned
                </p>

                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-white text-base sm:text-lg">
                    Next cleaning estimated time:
                  </label>
                  
                  {forecastAdvResponse && !predictionError ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <label className="font-bold text-xl sm:text-2xl text-emerald-400">
                        {forecastAdvResponse.hour < 1
                          ? "Exactly now"
                          : `${forecastAdvResponse.hour} hours`
                        }
                      </label>
                      <button
                        onClick={() => handleForecastAdvanced()}
                        className="text-purple-400 hover:text-purple-300 font-semibold underline transition-colors duration-300 text-sm sm:text-base"
                      >
                        Predict again?
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleForecastAdvanced()}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/25 min-h-[44px] text-sm sm:text-base"
                    >
                      {forecastAdvState?.loading ? 'Predicting...' : 'Run Prediction'}
                    </button>
                  )}
                </div>
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
        
        /* Ensure select dropdown visibility on mobile */
        select option {
          background-color: #1e293b;
          color: white;
        }
        
        /* Touch-friendly form elements */
        @media (max-width: 768px) {
          button, select {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};