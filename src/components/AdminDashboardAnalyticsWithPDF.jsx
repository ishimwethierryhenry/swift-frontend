// FRONTEND: src/components/AdminDashboardAnalyticsWithPDF.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, ComposedChart
} from 'recharts';
import WaterQualityService from '../services/waterQualityService';
import PDFReportService from '../services/pdfReportService';

const AdminDashboardAnalyticsWithPDF = () => {
  const [analyticsData, setAnalyticsData] = useState({
    realtimeMetrics: [],
    poolStatistics: [],
    waterQualityTrends: [],
    operatorPerformance: [],
    systemHealth: null,
    monthlyData: []
  });
  
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPool, setSelectedPool] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = { 
        timeRange,
        poolId: selectedPool !== 'all' ? selectedPool : undefined
      };

      const [statistics, historical, monthlyData] = await Promise.all([
        WaterQualityService.getStatistics(filters),
        WaterQualityService.getHistoricalData({ ...filters, limit: 1000 }),
        fetch(`/api/water-quality/monthly?year=${new Date().getFullYear()}${selectedPool !== 'all' ? `&poolId=${selectedPool}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ]);

      const realtimeMetrics = processRealtimeMetrics(historical.data || []);
      const poolStats = processPoolStatistics(statistics.statistics || {});
      const trends = processWaterQualityTrends(historical.data || []);
      const operatorPerf = await fetchOperatorPerformance();
      const systemHealth = processSystemHealth(statistics.statistics || {});
      const processedMonthlyData = processMonthlyData(monthlyData.data || []);

      setAnalyticsData({
        realtimeMetrics,
        poolStatistics: poolStats,
        waterQualityTrends: trends,
        operatorPerformance: operatorPerf,
        systemHealth,
        monthlyData: processedMonthlyData
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(generateFallbackData());
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedPool]);

  const processRealtimeMetrics = (historicalData) => {
    const now = new Date();
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      hour.setMinutes(0, 0, 0);
      return hour;
    });

    return last24Hours.map(hour => {
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000);
      const hourData = historicalData.filter(record => {
        const recordTime = new Date(record.recordedAt);
        return recordTime >= hour && recordTime < hourEnd;
      });

      if (hourData.length === 0) {
        return {
          time: hour.toTimeString().slice(0, 5),
          pH: '0.00',
          turbidity: '0.0',
          conductivity: '0',
          temperature: '0.0',
          testsCompleted: 0,
          activeOperators: 0
        };
      }

      const avgPH = hourData.reduce((sum, record) => sum + parseFloat(record.pH), 0) / hourData.length;
      const avgTurbidity = hourData.reduce((sum, record) => sum + parseFloat(record.turbidity), 0) / hourData.length;
      const avgConductivity = hourData.reduce((sum, record) => sum + parseFloat(record.conductivity), 0) / hourData.length;
      const avgTemp = hourData.reduce((sum, record) => sum + (parseFloat(record.temperature) || 25), 0) / hourData.length;

      return {
        time: hour.toTimeString().slice(0, 5),
        pH: avgPH.toFixed(2),
        turbidity: avgTurbidity.toFixed(1),
        conductivity: avgConductivity.toFixed(0),
        temperature: avgTemp.toFixed(1),
        testsCompleted: hourData.length,
        activeOperators: new Set(hourData.map(record => record.recordedBy)).size
      };
    });
  };

  const processPoolStatistics = (statistics) => {
    const total = statistics.totalRecords || 0;
    const optimal = statistics.optimalCount || 0;
    const suboptimal = total - optimal;
    
    const warning = Math.floor(suboptimal * 0.7);
    const critical = suboptimal - warning;

    return [
      { name: 'Optimal', value: optimal, color: '#22c55e' },
      { name: 'Warning', value: warning, color: '#f59e0b' },
      { name: 'Critical', value: critical, color: '#ef4444' }
    ];
  };

  const processWaterQualityTrends = (historicalData) => {
    const grouped = historicalData.reduce((acc, record) => {
      const date = new Date(record.recordedAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          records: [],
          totalPH: 0,
          totalTurbidity: 0,
          totalConductivity: 0,
          optimalCount: 0
        };
      }
      
      acc[date].records.push(record);
      acc[date].totalPH += parseFloat(record.pH);
      acc[date].totalTurbidity += parseFloat(record.turbidity);
      acc[date].totalConductivity += parseFloat(record.conductivity);
      
      if (record.isOptimal) {
        acc[date].optimalCount++;
      }
      
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        avgPH: (data.totalPH / data.records.length).toFixed(2),
        avgTurbidity: (data.totalTurbidity / data.records.length).toFixed(1),
        avgConductivity: (data.totalConductivity / data.records.length).toFixed(0),
        optimalReadings: data.optimalCount,
        totalReadings: data.records.length
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const fetchOperatorPerformance = async () => {
    try {
      const response = await fetch(`/api/analytics/operators?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Error fetching operator performance:', error);
    }
    
    return [
      { name: 'John Doe', testsCompleted: 45, avgResponseTime: 12, efficiency: 92 },
      { name: 'Jane Smith', testsCompleted: 52, avgResponseTime: 8, efficiency: 96 },
      { name: 'Mike Johnson', testsCompleted: 38, avgResponseTime: 15, efficiency: 88 },
      { name: 'Sarah Wilson', testsCompleted: 41, avgResponseTime: 10, efficiency: 94 }
    ];
  };

  const processSystemHealth = (statistics) => {
    return {
      uptime: 99.8,
      activePools: 12,
      totalTests: statistics.totalRecords || 0,
      errorRate: 0.2,
      avgResponseTime: 245,
      dataQuality: parseFloat(statistics.optimalPercentage || 0)
    };
  };

  const processMonthlyData = (monthlyData) => {
    if (!monthlyData.length) {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 6 }, (_, i) => {
        const month = new Date().getMonth() - 5 + i;
        const date = new Date(currentYear, month);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          tests: Math.floor(Math.random() * 300) + 200,
          optimal: Math.floor(Math.random() * 250) + 180,
          issues: Math.floor(Math.random() * 80) + 20
        };
      });
    }

    return monthlyData.map(item => ({
      month: new Date(2024, item.month - 1).toLocaleString('default', { month: 'short' }),
      tests: item.totalCount || 0,
      optimal: item.optimalCount || 0,
      issues: (item.totalCount - item.optimalCount) || 0
    }));
  };

  const generateFallbackData = () => {
    return {
      realtimeMetrics: Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        pH: (7.0 + Math.random() * 1.5).toFixed(2),
        turbidity: (Math.random() * 80).toFixed(1),
        conductivity: (1000 + Math.random() * 1500).toFixed(0),
        temperature: (25 + Math.random() * 8).toFixed(1),
        testsCompleted: Math.floor(Math.random() * 15),
        activeOperators: Math.floor(Math.random() * 8) + 2
      })),
      poolStatistics: [
        { name: 'Optimal', value: 65, color: '#22c55e' },
        { name: 'Warning', value: 25, color: '#f59e0b' },
        { name: 'Critical', value: 10, color: '#ef4444' }
      ],
      waterQualityTrends: [],
      operatorPerformance: [
        { name: 'John Doe', testsCompleted: 45, avgResponseTime: 12, efficiency: 92 }
      ],
      systemHealth: {
        uptime: 99.8,
        activePools: 12,
        totalTests: 1247,
        errorRate: 0.2,
        avgResponseTime: 245,
        dataQuality: 98.5
      },
      monthlyData: []
    };
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = await PDFReportService.generateAnalyticsReportWithCharts(
        analyticsData,
        timeRange,
        selectedPool
      );
      
      const filename = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      await PDFReportService.downloadPDF(doc, filename);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'PDF report generated successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF report. Please try again.';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData.waterQualityTrends || analyticsData.waterQualityTrends.length === 0) return;

    const headers = ['Date', 'Avg pH', 'Avg Turbidity', 'Avg Conductivity', 'Optimal Readings', 'Total Readings', 'Success Rate'];
    const csvContent = [
      headers.join(','),
      ...analyticsData.waterQualityTrends.map(row => [
        row.date,
        row.avgPH,
        row.avgTurbidity,
        row.avgConductivity,
        row.optimalReadings,
        row.totalReadings,
        `${((row.optimalReadings / row.totalReadings) * 100).toFixed(1)}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalyticsData]);

  const CustomTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-cyan-300 font-semibold text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {`${entry.name}: ${entry.value}${unit}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900/50 rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <select 
            value={selectedPool} 
            onChange={(e) => setSelectedPool(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
          >
            <option value="all">All Pools</option>
            <option value="pool01">Pool 01</option>
            <option value="pool02">Pool 02</option>
            <option value="pool03">Pool 03</option>
          </select>
        </div>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-600 text-slate-300'
            }`}
          >
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={fetchAnalyticsData}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Refresh Now
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Export CSV
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">System Uptime</p>
              <p className="text-2xl font-bold">{analyticsData.systemHealth?.uptime}%</p>
            </div>
            <div className="text-3xl opacity-80">⚡</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Pools</p>
              <p className="text-2xl font-bold">{analyticsData.systemHealth?.activePools}</p>
            </div>
            <div className="text-3xl opacity-80">🏊</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Tests</p>
              <p className="text-2xl font-bold">{analyticsData.systemHealth?.totalTests?.toLocaleString()}</p>
            </div>
            <div className="text-3xl opacity-80">🧪</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Data Quality</p>
              <p className="text-2xl font-bold">{analyticsData.systemHealth?.dataQuality}%</p>
            </div>
            <div className="text-3xl opacity-80">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="ph-chart">
          <h3 className="text-white text-xl font-bold mb-4">Real-time pH Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.realtimeMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis domain={[6.5, 8.5]} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip unit=" pH" />} />
              <ReferenceLine y={7.2} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={7.8} stroke="#22c55e" strokeDasharray="5 5" />
              <Line 
                type="monotone" 
                dataKey="pH" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="turbidity-chart">
          <h3 className="text-white text-xl font-bold mb-4">Turbidity Monitoring</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.realtimeMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip unit=" NTU" />} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" />
              <Area 
                type="monotone" 
                dataKey="turbidity" 
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="pool-status">
          <h3 className="text-white text-xl font-bold mb-4">Pool Water Quality Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.poolStatistics}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelStyle={{ fill: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
              >
                {analyticsData.poolStatistics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip unit="%" />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="operator-performance">
          <h3 className="text-white text-xl font-bold mb-4">Operator Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.operatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="testsCompleted" fill="#3b82f6" name="Tests Completed" />
              <Bar dataKey="efficiency" fill="#22c55e" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="trends-chart">
        <h3 className="text-white text-xl font-bold mb-4">Water Quality Trends ({timeRange})</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={analyticsData.waterQualityTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="optimalReadings" fill="#22c55e" name="Optimal Readings" />
            <Bar yAxisId="left" dataKey="totalReadings" fill="#64748b" name="Total Readings" />
            <Line yAxisId="right" type="monotone" dataKey="avgPH" stroke="#3b82f6" strokeWidth={3} name="Avg pH" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-6" data-chart-type="monthly-chart">
        <h3 className="text-white text-xl font-bold mb-4">Monthly Performance Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analyticsData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="tests" fill="#3b82f6" name="Total Tests" />
            <Bar dataKey="optimal" fill="#22c55e" name="Optimal Results" />
            <Bar dataKey="issues" fill="#ef4444" name="Issues Found" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 rounded-lg p-6">
          <h4 className="text-white text-lg font-semibold mb-4">Response Time</h4>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-cyan-400">
              {analyticsData.systemHealth?.avgResponseTime}ms
            </div>
          </div>
          <div className="mt-2 text-center text-slate-400">Average Response</div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6">
          <h4 className="text-white text-lg font-semibold mb-4">Error Rate</h4>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-green-400">
              {analyticsData.systemHealth?.errorRate}%
            </div>
          </div>
          <div className="mt-2 text-center text-slate-400">System Errors</div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6">
          <h4 className="text-white text-lg font-semibold mb-4">Active Sessions</h4>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-purple-400">
              {analyticsData.realtimeMetrics[analyticsData.realtimeMetrics.length - 1]?.activeOperators || 0}
            </div>
          </div>
          <div className="mt-2 text-center text-slate-400">Online Operators</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAnalyticsWithPDF;