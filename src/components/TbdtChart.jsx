import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const TbdtChart = ({ data }) => {
  // Custom tooltip for turbidity with water clarity status
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      
      const getWaterStatus = (val) => {
        if (val <= 10) return { text: 'Crystal Clear', color: 'text-emerald-400', icon: '💎' };
        if (val <= 25) return { text: 'Slightly Hazy', color: 'text-yellow-400', icon: '🌫️' };
        if (val <= 50) return { text: 'Moderately Turbid', color: 'text-orange-400', icon: '🌊' };
        return { text: 'Highly Turbid', color: 'text-red-400', icon: '☁️' };
      };
      
      const status = getWaterStatus(value);
      const isSafe = value <= 50;
      
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-orange-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-orange-300 font-semibold text-sm">{`Time: ${label}`}</p>
          <p className={`font-bold text-base ${status.color}`}>
            {`Turbidity: ${Number(value).toFixed(2)} NTU`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{status.icon}</span>
            <span className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            {isSafe ? '✓ Within Safe Limit' : '⚠ Exceeds Safe Limit (50 NTU)'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Higher values = More suspended particles
          </p>
        </div>
      );
    }
    return null;
  };

  const yAxisTickFormatter = (value) => {
    return value.toFixed(1);
  };

  // Get turbidity values for dynamic scaling
  const tbdtValues = data.map((item) => parseFloat(item.tbdt));
  const minTbdt = tbdtValues.length > 0 ? Math.min(...tbdtValues) : 0;
  const maxTbdt = tbdtValues.length > 0 ? Math.max(...tbdtValues) : 100;
  
  // Ensure we show a reasonable range
  const domainMin = 0;
  const domainMax = Math.max(100, maxTbdt + 10);

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-orange-300 font-bold text-lg mb-1">Turbidity Monitoring</h3>
        <p className="text-gray-400 text-sm">Safe Limit: ≤ 50 NTU • Current: {data.length > 0 ? parseFloat(data[data.length - 1]?.tbdt || 0).toFixed(2) : 'No data'} NTU</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
          
          {/* Y Axis - Turbidity Values */}
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
              value: 'Turbidity (NTU)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#f97316', fontWeight: 'bold', fontSize: '14px' }
            }}
          />
          
          {/* Water Clarity Zone Reference Lines */}
          <ReferenceLine 
            y={10} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Clear (10 NTU)", position: "topRight", fill: "#10b981", fontSize: 10 }}
          />
          <ReferenceLine 
            y={25} 
            stroke="#eab308" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            opacity={0.8}
            label={{ value: "Hazy (25 NTU)", position: "topRight", fill: "#eab308", fontSize: 10 }}
          />
          <ReferenceLine 
            y={50} 
            stroke="#f97316" 
            strokeDasharray="4 4" 
            strokeWidth={3}
            opacity={0.9}
            label={{ value: "Safe Limit (50 NTU)", position: "topRight", fill: "#f97316", fontSize: 11, fontWeight: "bold" }}
          />
          
          {/* Danger Zone */}
          <ReferenceLine 
            y={75} 
            stroke="#ef4444" 
            strokeDasharray="3 3" 
            strokeWidth={2}
            opacity={0.7}
            label={{ value: "High Turbidity", position: "topRight", fill: "#ef4444", fontSize: 10 }}
          />
          
          {/* Enhanced Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* Area Chart with Enhanced Styling */}
          <Area
            type="monotone"
            dataKey="tbdt"
            stroke="url(#turbidityGradient)"
            fill="url(#turbidityAreaGradient)"
            strokeWidth={4}
            dot={{ 
              fill: '#f97316', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 5
            }}
            activeDot={{ 
              r: 8, 
              fill: '#f97316',
              stroke: '#ffffff',
              strokeWidth: 3,
              filter: 'drop-shadow(0 0 10px #f97316)'
            }}
            connectNulls={false}
          />
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="turbidityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
              <stop offset="50%" stopColor="#ea580c" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="turbidityAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.4}/>
              <stop offset="50%" stopColor="#ea580c" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Enhanced Legend with Water Clarity Zones */}
      <div className="flex justify-center items-center gap-3 mt-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500 rounded"></div>
          <span className="text-emerald-400 font-medium">Clear (0-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-500 rounded"></div>
          <span className="text-yellow-400 font-medium">Hazy (10-25)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-orange-500 rounded"></div>
          <span className="text-orange-400 font-medium">Turbid (25-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 rounded"></div>
          <span className="text-red-400 font-medium">Cloudy (50+)</span>
        </div>
      </div>
      
      {/* Water Quality Status Indicator */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-orange-500/30">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span className="text-orange-300 text-sm font-medium">
            Real-time Turbidity Monitoring
          </span>
        </div>
      </div>
    </div>
  );
};

export default TbdtChart;