import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TdsChart = ({ data }) => {
  const yAxisTickFormatter = (value) => {
    return value.toFixed(2);
  };

  const tdsValues = data.map((item) => item.tds);
  const minTds = Math.min(...tdsValues);
  const maxTds = Math.max(...tdsValues);

  return (
    <div className=" w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            tickFormatter={yAxisTickFormatter}
            domain={[minTds, maxTds]} // Set dynamic domain for y-axis
            tickCount={10} // Optional: Number of ticks on the y-axis
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="tds"
            name="TDS (ppm)"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TdsChart;
