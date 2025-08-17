// =================== UPDATED HISTORY GRAPH COMPONENT ===================
// src/components/HistoryGraph.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

export const HistoryGraph = ({ data, parameter, timeRange }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by date for time series
    const groupedByDate = data.reduce((acc, record) => {
      const date = new Date(record.recordedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          records: [],
          safe: 0,
          unsafe: 0,
          totalPH: 0,
          totalTurbidity: 0,
          totalConductivity: 0,
          totalTemperature: 0,
          count: 0
        };
      }
      
      acc[date].records.push(record);
      acc[date].count++;
      acc[date].totalPH += parseFloat(record.pH);
      acc[date].totalTurbidity += parseFloat(record.turbidity);
      acc[date].totalConductivity += parseFloat(record.conductivity);
      if (record.temperature) {
        acc[date].totalTemperature += parseFloat(record.temperature);
      }
      
      if (record.isOptimal) {
        acc[date].safe++;
      } else {
        acc[date].unsafe++;
      }
      
      return acc;
    }, {});

    // Convert to array and calculate averages
    return Object.values(groupedByDate).map(group => ({
      date: group.date,
      safe: group.safe,
      unsafe: group.unsafe,
      avgPH: (group.totalPH / group.count).toFixed(2),
      avgTurbidity: (group.totalTurbidity / group.count).toFixed(2),
      avgConductivity: (group.totalConductivity / group.count).toFixed(2),
      avgTemperature: group.totalTemperature > 0 ? (group.totalTemperature / group.count).toFixed(2) : null,
      total: group.count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const pieChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const safeCount = data.filter(record => record.isOptimal).length;
    const unsafeCount = data.length - safeCount;
    
    return [
      { name: "Optimal", value: safeCount, color: "#82ca9d" },
      { name: "Needs Attention", value: unsafeCount, color: "#ff7f0e" },
    ];
  }, [data]);

  const renderParameterChart = () => {
    if (!processedData.length) return null;

    switch (parameter) {
      case 'ph':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff80" />
            <YAxis domain={[6.5, 8.5]} stroke="#ffffff80" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgPH" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Average pH"
            />
            {/* pH optimal range indicators */}
            <Line 
              type="monotone" 
              dataKey={() => 7.2} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false}
              name="Min Optimal (7.2)"
            />
            <Line 
              type="monotone" 
              dataKey={() => 7.8} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false}
              name="Max Optimal (7.8)"
            />
          </LineChart>
        );

      case 'turbidity':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgTurbidity" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Average Turbidity (NTU)"
            />
            <Line 
              type="monotone" 
              dataKey={() => 50} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false}
              name="Max Safe Level (50 NTU)"
            />
          </LineChart>
        );

      case 'conductivity':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgConductivity" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              name="Average Conductivity (µS/cm)"
            />
            <Line 
              type="monotone" 
              dataKey={() => 2000} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false}
              name="Max Safe Level (2000 µS/cm)"
            />
          </LineChart>
        );

      case 'temperature':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgTemperature" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Average Temperature (°C)"
            />
          </LineChart>
        );

      default:
        return (
          <>
            {/* Multi-parameter line chart */}
            <div className="mb-8">
              <h3 className="text-white text-xl font-semibold mb-4">Parameter Trends</h3>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgPH" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="pH"
                  yAxisId="ph"
                />
              </LineChart>
            </div>

            {/* Safety overview bar chart */}
            <div className="mb-8">
              <h3 className="text-white text-xl font-semibold mb-4">Daily Safety Overview</h3>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="safe" fill="#82ca9d" name="Optimal Readings" />
                <Bar dataKey="unsafe" fill="#ff7f0e" name="Attention Needed" />
              </BarChart>
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={500}>
        {renderParameterChart()}
      </ResponsiveContainer>
      
      {parameter === 'all' && (
        <div className="mt-8">
          <h3 className="text-white text-xl font-semibold mb-4">Overall Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelStyle={{ fill: '#ffffff', fontWeight: 'bold' }}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};