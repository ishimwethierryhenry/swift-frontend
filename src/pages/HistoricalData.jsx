import React, { useState, useEffect } from "react";
import { HistoryGraph } from "../components/HistoryGraph";

export const HistoricalData = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("2024");
  const [selectedParameter, setSelectedParameter] = useState("all");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const timeRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "2024", label: "2024 Data" },
    { value: "all", label: "All Time" }
  ];

  const parameters = [
    { value: "all", label: "All Parameters" },
    { value: "ph", label: "pH Level" },
    { value: "turbidity", label: "Turbidity" },
    { value: "conductivity", label: "Conductivity" }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-24">
        <div className="px-8 py-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32">
          
          {/* Title Section */}
          <div className={`text-center mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="overflow-hidden">
              <label className={`font-bold text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Historical Data Analytics
              </label>
            </div>
            <div className="overflow-hidden">
              <label className={`font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                Long-term water quality trends and insights
              </label>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Filter Controls */}
          <div className={`mb-8 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-white font-semibold text-lg">Time Range</label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    >
                      {timeRanges.map((range) => (
                        <option key={range.value} value={range.value} className="bg-slate-800">
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-white font-semibold text-lg">Parameter Focus</label>
                    <select
                      value={selectedParameter}
                      onChange={(e) => setSelectedParameter(e.target.value)}
                      className="h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    >
                      {parameters.map((param) => (
                        <option key={param.value} value={param.value} className="bg-slate-800">
                          {param.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-cyan-500/25">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Total Data Points */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">247,583</div>
                  <div className="text-sm text-gray-300 mt-1">Data Points</div>
                </div>
              </div>
            </div>

            {/* Avg pH */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">7.24</div>
                  <div className="text-sm text-gray-300 mt-1">Avg pH</div>
                </div>
              </div>
            </div>

            {/* Optimal Days */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">89%</div>
                  <div className="text-sm text-gray-300 mt-1">Optimal Days</div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-orange-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">2 min</div>
                  <div className="text-sm text-gray-300 mt-1">Last Update</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Container */}
          <div className={`relative group transition-all duration-1000 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            <div className="relative backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              
              <div className="flex flex-col gap-6">
                
                {/* Chart Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <label className="font-bold text-3xl text-white">
                      {selectedTimeRange === "2024" ? "2024 Data Trends" : `${timeRanges.find(r => r.value === selectedTimeRange)?.label} Analysis`}
                    </label>
                    <p className="text-gray-300 mt-2">
                      {selectedParameter === "all" ? "All water quality parameters" : `${parameters.find(p => p.value === selectedParameter)?.label} trends`}
                    </p>
                  </div>
                  
                  {/* Export Options */}
                  <div className="flex gap-3">
                    <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40">
                      Export CSV
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40">
                      Export PDF
                    </button>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-h-[500px]">
                  <HistoryGraph />
                </div>

                {/* Data Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-400/30">
                    <h4 className="font-semibold text-emerald-300 mb-2">Key Insight</h4>
                    <p className="text-sm text-gray-300">
                      Water quality has improved by 12% over the selected period with consistent pH levels.
                    </p>
                  </div>

                  <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-400/30">
                    <h4 className="font-semibold text-blue-300 mb-2">Trend Analysis</h4>
                    <p className="text-sm text-gray-300">
                      Turbidity levels show seasonal patterns with peaks during summer months.
                    </p>
                  </div>

                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-400/30">
                    <h4 className="font-semibold text-purple-300 mb-2">Recommendation</h4>
                    <p className="text-sm text-gray-300">
                      Consider increasing monitoring frequency during high-usage periods.
                    </p>
                  </div>
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
      `}</style>
    </div>
  );
};