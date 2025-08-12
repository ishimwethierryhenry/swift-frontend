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

const PhChart = ({ data }) => {
  const yAxisTickFormatter = (value) => {
    return value.toFixed(2);
  };

  const phValues = data.map((item) => item.ph);
  const minPh = Math.min(...phValues);
  const maxPh = Math.max(...phValues);

  return (
    <div className=" w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            tickFormatter={yAxisTickFormatter}
            domain={[minPh, maxPh]} // Set dynamic domain for y-axis
            tickCount={10} // Optional: Number of ticks on the y-axis
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ph" name="pH" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PhChart;