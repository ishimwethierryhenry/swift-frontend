// =================== UPDATED HISTORICAL DATA PAGE ===================
// src/pages/HistoricalData.jsx
import React, { useState, useEffect } from "react";
import { HistoryGraph } from "../components/HistoryGraph";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorAlert } from "../components/ErrorAlert";
import waterQualityService from "../services/waterQualityService";

export const HistoricalData = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [selectedParameter, setSelectedParameter] = useState("all");
  const [selectedPool, setSelectedPool] = useState("all");
  const [data, setData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    fetchPools();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedTimeRange, selectedParameter, selectedPool]);

  const fetchPools = async () => {
    try {
      // Fetch pools from your existing API
      const response = await fetch('/api/pools/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setPools(result.allPools || []);
      }
    } catch (err) {
      console.error('Error fetching pools:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        timeRange: selectedTimeRange,
        parameter: selectedParameter,
        poolId: selectedPool !== 'all' ? selectedPool : undefined,
        limit: 1000
      };

      // Fetch historical data and statistics simultaneously
      const [historicalResponse, statsResponse] = await Promise.all([
        waterQualityService.getHistoricalData(params),
        waterQualityService.getStatistics(params)
      ]);

      setData(historicalResponse.data);
      setStatistics(statsResponse.statistics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ['Date', 'Pool', 'pH', 'Turbidity', 'Conductivity', 'Temperature', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        new Date(row.recordedAt).toLocaleDateString(),
        row.pool?.name || 'Unknown',
        row.pH,
        row.turbidity,
        row.conductivity,
        row.temperature || 'N/A',
        row.isOptimal ? 'Optimal' : 'Needs Attention'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-quality-data-${selectedTimeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
    { value: "conductivity", label: "Conductivity" },
    { value: "temperature", label: "Temperature" }
  ];

  if (loading && !data) {
    return <LoadingSpinner />;
  }

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
                Real-time water quality trends and insights
              </label>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Error Alert */}
          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

          {/* Filter Controls */}
          <div className={`mb-8 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
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

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-white font-semibold text-lg">Pool</label>
                    <select
                      value={selectedPool}
                      onChange={(e) => setSelectedPool(e.target.value)}
                      className="h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    >
                      <option value="all" className="bg-slate-800">All Pools</option>
                      {pools.map((pool) => (
                        <option key={pool.id} value={pool.id} className="bg-slate-800">
                          {pool.name} - {pool.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-3">
                    <button 
                      onClick={fetchData}
                      disabled={loading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-cyan-500/25"
                    >
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {statistics && (
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              
              {/* Total Data Points */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{statistics.totalRecords.toLocaleString()}</div>
                    <div className="text-sm text-gray-300 mt-1">Data Points</div>
                  </div>
                </div>
              </div>

              {/* Avg pH */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{statistics.avgpH}</div>
                    <div className="text-sm text-gray-300 mt-1">Avg pH</div>
                  </div>
                </div>
              </div>

              {/* Optimal Percentage */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{statistics.optimalPercentage}%</div>
                    <div className="text-sm text-gray-300 mt-1">Optimal Days</div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-orange-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">Live</div>
                    <div className="text-sm text-gray-300 mt-1">Data Status</div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      {data && ` (${data.length} records)`}
                    </p>
                  </div>
                  
                  {/* Export Options */}
                  <div className="flex gap-3">
                    <button 
                      onClick={handleExportCSV}
                      disabled={!data || data.length === 0}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Export CSV
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-h-[500px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white text-lg">Loading chart data...</div>
                    </div>
                  ) : data && data.length > 0 ? (
                    <HistoryGraph 
                      data={data} 
                      parameter={selectedParameter}
                      timeRange={selectedTimeRange}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white text-lg">No data available for the selected filters</div>
                    </div>
                  )}
                </div>

                {/* Data Insights */}
                {statistics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    
                    <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-400/30">
                      <h4 className="font-semibold text-emerald-300 mb-2">Key Insight</h4>
                      <p className="text-sm text-gray-300">
                        {statistics.optimalPercentage > 80 
                          ? `Excellent water quality with ${statistics.optimalPercentage}% optimal readings.`
                          : statistics.optimalPercentage > 60
                          ? `Good water quality with ${statistics.optimalPercentage}% optimal readings.`
                          : `Water quality needs attention - only ${statistics.optimalPercentage}% optimal readings.`
                        }
                      </p>
                    </div>

                    <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-400/30">
                      <h4 className="font-semibold text-blue-300 mb-2">pH Analysis</h4>
                      <p className="text-sm text-gray-300">
                        Average pH level is {statistics.avgpH}. 
                        {parseFloat(statistics.avgpH) >= 7.2 && parseFloat(statistics.avgpH) <= 7.8 
                          ? " This is within the optimal range."
                          : " Consider adjusting pH levels for optimal water quality."
                        }
                      </p>
                    </div>

                    <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-400/30">
                      <h4 className="font-semibold text-purple-300 mb-2">Recommendation</h4>
                      <p className="text-sm text-gray-300">
                        {statistics.optimalPercentage < 70 
                          ? "Increase monitoring frequency and check filtration systems."
                          : "Maintain current monitoring schedule and procedures."
                        }
                      </p>
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
      `}</style>
    </div>
  );
};