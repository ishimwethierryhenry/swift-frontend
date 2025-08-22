import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const PhChart = ({ data }) => {
  // Custom tooltip for better visibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isOptimal = value >= 7.1 && value <= 7.3;
      
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-cyan-300 font-semibold text-sm">{`Time: ${label}`}</p>
          <p className={`font-bold text-base ${isOptimal ? 'text-emerald-400' : 'text-red-400'}`}>
            {`pH: ${Number(value).toFixed(2)}`}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {isOptimal ? '✓ Safe Range (7.1-7.3)' : '⚠ Outside Safe Range'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {value < 6.5 ? 'ACIDIC - More H⁺ ions' : 
             value > 7.5 ? 'ALKALINE - More OH⁻ ions' : 
             'NEUTRAL - Balanced ions'}
          </p>
        </div>
      );
    }
    return null;
  };

  const yAxisTickFormatter = (value) => {
    return value.toFixed(1);
  };

  // Get pH values for dynamic scaling
  const phValues = data.map((item) => parseFloat(item.ph));
  const minPh = phValues.length > 0 ? Math.min(...phValues) : 6.5;
  const maxPh = phValues.length > 0 ? Math.max(...phValues) : 8.5;
  
  // Ensure we show a reasonable range around the data
  const domainMin = Math.max(6.0, minPh - 0.5);
  const domainMax = Math.min(9.0, maxPh + 0.5);

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20">
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-cyan-300 font-bold text-lg mb-1">pH Level Monitoring</h3>
        <p className="text-gray-400 text-sm">Optimal Range: 7.1 - 7.3 • Current: {data.length > 0 ? parseFloat(data[data.length - 1]?.ph || 0).toFixed(2) : 'No data'}</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          {/* Enhanced Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155" 
            strokeOpacity={0.3}
            horizontal={true}
            vertical={false}
          />
          
          {/* X Axis - Time */}
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 11,
              fontWeight: 'medium'
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          
          {/* Y Axis - pH Values */}
          <YAxis 
            domain={[domainMin, domainMax]}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 12,
              fontWeight: 'medium'
            }}
            tickFormatter={yAxisTickFormatter}
            tickCount={8}
            label={{ 
              value: 'pH Level', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#06b6d4', fontWeight: 'bold', fontSize: '14px' }
            }}
          />
          
          {/* Safe Zone Reference Lines */}
          <ReferenceLine 
            y={7.1} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Safe Min (7.1)", position: "topRight", fill: "#10b981", fontSize: 10 }}
          />
          <ReferenceLine 
            y={7.3} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Safe Max (7.3)", position: "topRight", fill: "#10b981", fontSize: 10 }}
          />
          
          {/* Neutral pH Line */}
          <ReferenceLine 
            y={7.0} 
            stroke="#94a3b8" 
            strokeDasharray="2 2" 
            strokeWidth={1}
            opacity={0.5}
            label={{ value: "Neutral (7.0)", position: "topRight", fill: "#94a3b8", fontSize: 10 }}
          />
          
          {/* Warning Zones */}
          <ReferenceLine 
            y={6.8} 
            stroke="#f59e0b" 
            strokeDasharray="3 3" 
            strokeWidth={1}
            opacity={0.6}
          />
          <ReferenceLine 
            y={7.6} 
            stroke="#f59e0b" 
            strokeDasharray="3 3" 
            strokeWidth={1}
            opacity={0.6}
          />
          
          {/* Enhanced Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* Main pH Line with Enhanced Styling */}
          <Line
            type="monotone"
            dataKey="ph"
            stroke="url(#phGradient)"
            strokeWidth={4}
            dot={{ 
              fill: '#06b6d4', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 5
            }}
            activeDot={{ 
              r: 8, 
              fill: '#06b6d4',
              stroke: '#ffffff',
              strokeWidth: 3,
              filter: 'drop-shadow(0 0 10px #06b6d4)'
            }}
            connectNulls={false}
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
      
      {/* Enhanced Legend */}
      <div className="flex justify-center items-center gap-4 mt-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500 rounded"></div>
          <span className="text-emerald-400 font-medium">Safe Zone (7.1-7.3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
          <span className="text-cyan-400 font-medium">Current pH</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-500 opacity-60 rounded"></div>
          <span className="text-yellow-400 font-medium">Warning Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400 opacity-50 rounded"></div>
          <span className="text-gray-400 font-medium">Neutral (7.0)</span>
        </div>
      </div>
    </div>
  );
};

export default PhChart;