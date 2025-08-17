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
        limit: selectedTimeRange === 'all' ? 5000 : 1000 // Increase limit for all-time data
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

    const headers = ['Date', 'Pool', 'pH', 'Turbidity', 'Conductivity', 'Temperature', 'Dissolved Oxygen', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        new Date(row.recordedAt).toLocaleDateString(),
        row.pool?.name || 'Unknown',
        row.pH,
        row.turbidity,
        row.conductivity,
        row.temperature || 'N/A',
        row.dissolvedOxygen || 'N/A',
        row.isOptimal ? 'Optimal' : 'Needs Attention',
        row.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-quality-data-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const timeRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "This Year" },
    { value: "2025", label: "2025 Data" },
    { value: "2024", label: "2024 Data" },
    { value: "2023", label: "2023 Data" },
    { value: "2024-2025", label: "2024-2025 Comparison" },
    { value: "all", label: "All Time (2023-2025)" }
  ];

  const parameters = [
    { value: "all", label: "All Parameters" },
    { value: "ph", label: "pH Level" },
    { value: "turbidity", label: "Turbidity" },
    { value: "conductivity", label: "Conductivity" },
    { value: "temperature", label: "Temperature" },
    { value: "dissolvedOxygen", label: "Dissolved Oxygen" }
  ];

  // Helper function to get data range description
  const getDataRangeDescription = () => {
    if (!data || data.length === 0) return "No data available";
    
    const dates = data.map(d => new Date(d.recordedAt)).sort((a, b) => a - b);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    const formatDate = (date) => date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Helper function to get enhanced insights
  const getEnhancedInsights = () => {
    if (!statistics) return null;

    const insights = [];

    // Time span insight
    if (selectedTimeRange === 'all') {
      insights.push({
        type: 'info',
        title: 'Historical Coverage',
        message: `Analyzing ${statistics.totalRecords.toLocaleString()} data points across 2.5+ years of monitoring.`
      });
    }

    // Quality trend insight
    if (statistics.optimalPercentage > 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        message: `Outstanding water quality with ${statistics.optimalPercentage}% optimal readings. Current procedures are highly effective.`
      });
    } else if (statistics.optimalPercentage > 75) {
      insights.push({
        type: 'success',
        title: 'Good Performance',
        message: `Strong water quality with ${statistics.optimalPercentage}% optimal readings. Minor improvements could optimize results.`
      });
    } else if (statistics.optimalPercentage > 60) {
      insights.push({
        type: 'warning',
        title: 'Moderate Performance',
        message: `Water quality needs attention with ${statistics.optimalPercentage}% optimal readings. Review maintenance schedules.`
      });
    } else {
      insights.push({
        type: 'danger',
        title: 'Performance Alert',
        message: `Critical: Only ${statistics.optimalPercentage}% optimal readings. Immediate intervention required.`
      });
    }

    return insights;
  };

  if (loading && !data) {
    return <LoadingSpinner />;
  }

  const insights = getEnhancedInsights();

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
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${15 + i * 12}%`,
              top: `${25 + i * 8}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + i * 0.3}s`
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
                2.5+ Years of Water Quality Intelligence (2023-2025)
              </label>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-6"></div>
            
            {/* Data Range Indicator */}
            <div className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg inline-block border border-white/20">
              <span className="text-gray-300 text-sm font-medium">
                Data Range: {getDataRangeDescription()}
              </span>
            </div>
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
            <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              
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

              {/* Avg Temperature */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-orange-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {statistics.avgTemperature ? `${parseFloat(statistics.avgTemperature).toFixed(1)}°C` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">Avg Temp</div>
                  </div>
                </div>
              </div>

              {/* Optimal Percentage */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{statistics.optimalPercentage}%</div>
                    <div className="text-sm text-gray-300 mt-1">Optimal</div>
                  </div>
                </div>
              </div>

              {/* Data Timespan */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 hover:border-indigo-400/50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">
                      {selectedTimeRange === 'all' ? '2.5+' : selectedTimeRange === '2024' ? '1' : selectedTimeRange === '2023' ? '1' : '< 1'}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {selectedTimeRange === 'all' ? 'Years' : 'Year(s)'}
                    </div>
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
                      {selectedTimeRange === "all" ? "Complete Historical Analysis (2023-2025)" 
                       : selectedTimeRange === "2024-2025" ? "2024-2025 Comparative Analysis"
                       : `${timeRanges.find(r => r.value === selectedTimeRange)?.label} Analysis`}
                    </label>
                    <p className="text-gray-300 mt-2">
                      {selectedParameter === "all" ? "All water quality parameters" : `${parameters.find(p => p.value === selectedParameter)?.label} trends`}
                      {data && ` (${data.length.toLocaleString()} records)`}
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
                      <div className="text-white text-lg">Loading extensive historical data...</div>
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

                {/* Enhanced Data Insights */}
                {insights && insights.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {insights.map((insight, index) => (
                      <div 
                        key={index}
                        className={`rounded-2xl p-4 border ${
                          insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-400/30' :
                          insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-400/30' :
                          insight.type === 'danger' ? 'bg-red-500/10 border-red-400/30' :
                          'bg-blue-500/10 border-blue-400/30'
                        }`}
                      >
                        <h4 className={`font-semibold mb-2 ${
                          insight.type === 'success' ? 'text-emerald-300' :
                          insight.type === 'warning' ? 'text-yellow-300' :
                          insight.type === 'danger' ? 'text-red-300' :
                          'text-blue-300'
                        }`}>
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {insight.message}
                        </p>
                      </div>
                    ))}

                    {/* Additional historical insight for long-term data */}
                    {selectedTimeRange === 'all' && statistics && (
                      <div className="bg-indigo-500/10 rounded-2xl p-4 border border-indigo-400/30">
                        <h4 className="font-semibold text-indigo-300 mb-2">Long-term Trend</h4>
                        <p className="text-sm text-gray-300">
                          Over 2.5 years of monitoring, your system has maintained an average pH of {statistics.avgpH}, 
                          demonstrating {statistics.optimalPercentage > 80 ? 'excellent' : statistics.optimalPercentage > 60 ? 'good' : 'inconsistent'} long-term stability.
                        </p>
                      </div>
                    )}
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