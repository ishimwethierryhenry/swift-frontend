import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const TdsChart = ({ data }) => {
  // Custom tooltip for TDS with water hardness classification
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      
      const getWaterHardness = (val) => {
        if (val < 300) return { text: 'Soft Water', color: 'text-emerald-400', icon: '💧', desc: 'Low mineral content' };
        if (val < 600) return { text: 'Moderately Soft', color: 'text-green-400', icon: '🌊', desc: 'Acceptable minerals' };
        if (val < 900) return { text: 'Slightly Hard', color: 'text-yellow-400', icon: '⚡', desc: 'Moderate minerals' };
        if (val < 1200) return { text: 'Moderately Hard', color: 'text-orange-400', icon: '🔶', desc: 'Higher minerals' };
        if (val < 2000) return { text: 'Hard Water', color: 'text-red-400', icon: '🔥', desc: 'High mineral content' };
        return { text: 'Very Hard', color: 'text-red-500', icon: '⚠️', desc: 'Excessive minerals' };
      };
      
      const hardness = getWaterHardness(value);
      const isSafe = value < 2000;
      
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-blue-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-blue-300 font-semibold text-sm">{`Time: ${label}`}</p>
          <p className={`font-bold text-base ${hardness.color}`}>
            {`TDS: ${Number(value).toFixed(2)} ppm`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{hardness.icon}</span>
            <span className={`text-sm font-medium ${hardness.color}`}>
              {hardness.text}
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            {hardness.desc}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {isSafe ? '✓ Within Safe Limit' : '⚠ Exceeds Safe Limit (2000 ppm)'}
          </p>
        </div>
      );
    }
    return null;
  };

  const yAxisTickFormatter = (value) => {
    return value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toFixed(0);
  };

  // Get TDS values for dynamic scaling
  const tdsValues = data.map((item) => parseFloat(item.tds));
  const minTds = tdsValues.length > 0 ? Math.min(...tdsValues) : 0;
  const maxTds = tdsValues.length > 0 ? Math.max(...tdsValues) : 3000;
  
  // Ensure we show a reasonable range
  const domainMin = 0;
  const domainMax = Math.max(3000, maxTds + 200);

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-blue-300 font-bold text-lg mb-1">TDS/Conductivity Monitor</h3>
        <p className="text-gray-400 text-sm">Safe Limit: &lt; 2000 ppm • Current: {data.length > 0 ? parseFloat(data[data.length - 1]?.tds || 0).toFixed(0) : 'No data'} ppm</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
          
          {/* Y Axis - TDS Values */}
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
              value: 'TDS (ppm)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#3b82f6', fontWeight: 'bold', fontSize: '14px' }
            }}
          />
          
          {/* Water Hardness Zone Reference Lines */}
          <ReferenceLine 
            y={300} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Soft (300)", position: "topRight", fill: "#10b981", fontSize: 10 }}
          />
          <ReferenceLine 
            y={600} 
            stroke="#22c55e" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.7}
            label={{ value: "Mod. Soft (600)", position: "topRight", fill: "#22c55e", fontSize: 10 }}
          />
          <ReferenceLine 
            y={900} 
            stroke="#eab308" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Slightly Hard (900)", position: "topRight", fill: "#eab308", fontSize: 10 }}
          />
          <ReferenceLine 
            y={1200} 
            stroke="#f97316" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Mod. Hard (1200)", position: "topRight", fill: "#f97316", fontSize: 10 }}
          />
          <ReferenceLine 
            y={2000} 
            stroke="#dc2626" 
            strokeDasharray="4 4" 
            strokeWidth={3}
            opacity={0.9}
            label={{ value: "Safe Limit (2000)", position: "topRight", fill: "#dc2626", fontSize: 11, fontWeight: "bold" }}
          />
          
          {/* Enhanced Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* TDS Bars with Dynamic Height */}
          <Bar
            dataKey="tds"
            fill="url(#tdsBarGradient)"
            stroke="#3b82f6"
            strokeWidth={1}
            radius={[3, 3, 0, 0]}
            opacity={0.7}
          />
          
          {/* TDS Line for Trend */}
          <Line
            type="monotone"
            dataKey="tds"
            stroke="url(#tdsLineGradient)"
            strokeWidth={3}
            dot={{ 
              fill: '#3b82f6', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 4
            }}
            activeDot={{ 
              r: 7, 
              fill: '#3b82f6',
              stroke: '#ffffff',
              strokeWidth: 3,
              filter: 'drop-shadow(0 0 10px #3b82f6)'
            }}
            connectNulls={false}
          />
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="tdsBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#1d4ed8" stopOpacity={0.6}/>
              <stop offset="100%" stopColor="#1e40af" stopOpacity={0.4}/>
            </linearGradient>
            <linearGradient id="tdsLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Enhanced Legend with Water Hardness Classifications */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-emerald-500 rounded"></div>
          <span className="text-emerald-400 font-medium">Soft (0-300)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500 rounded"></div>
          <span className="text-green-400 font-medium">Mod. Soft (300-600)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-yellow-500 rounded"></div>
          <span className="text-yellow-400 font-medium">Slightly Hard (600-900)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-orange-500 rounded"></div>
          <span className="text-orange-400 font-medium">Mod. Hard (900-1200)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500 rounded"></div>
          <span className="text-red-400 font-medium">Hard (1200-2000)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-600 rounded"></div>
          <span className="text-red-500 font-medium">Very Hard (2000+)</span>
        </div>
      </div>
      
      {/* Water Quality Status Indicator */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-blue-500/30">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span className="text-blue-300 text-sm font-medium">
            Real-time TDS/Conductivity Monitoring
          </span>
        </div>
      </div>
      
      {/* Current Water Status */}
      {data.length > 0 && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/30 border border-blue-500/20">
            <span className="text-blue-300 text-xs">Current Status:</span>
            <span className={`text-xs font-semibold ${
              parseFloat(data[data.length - 1]?.tds || 0) < 300 ? 'text-emerald-400' :
              parseFloat(data[data.length - 1]?.tds || 0) < 600 ? 'text-green-400' :
              parseFloat(data[data.length - 1]?.tds || 0) < 900 ? 'text-yellow-400' :
              parseFloat(data[data.length - 1]?.tds || 0) < 1200 ? 'text-orange-400' :
              parseFloat(data[data.length - 1]?.tds || 0) < 2000 ? 'text-red-400' :
              'text-red-500'
            }`}>
              {parseFloat(data[data.length - 1]?.tds || 0) < 300 ? '💧 Soft Water' :
               parseFloat(data[data.length - 1]?.tds || 0) < 600 ? '🌊 Moderately Soft' :
               parseFloat(data[data.length - 1]?.tds || 0) < 900 ? '⚡ Slightly Hard' :
               parseFloat(data[data.length - 1]?.tds || 0) < 1200 ? '🔶 Moderately Hard' :
               parseFloat(data[data.length - 1]?.tds || 0) < 2000 ? '🔥 Hard Water' :
               '⚠️ Very Hard Water'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TdsChart;