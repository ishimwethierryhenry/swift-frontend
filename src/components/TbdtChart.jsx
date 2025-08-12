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

const TbdtChart = ({ data }) => {
  const yAxisTickFormatter = (value) => {
    return value.toFixed(2);
  };

  const tbdtValues = data.map((item) => item.tbdt);
  const minTbdt = Math.min(...tbdtValues);
  const maxTbdt = Math.max(...tbdtValues);

  return (
    <div className=" w-full">
      <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            tickFormatter={yAxisTickFormatter}
            domain={[minTbdt, maxTbdt]} // Set dynamic domain for y-axis
            tickCount={10} // Optional: Number of ticks on the y-axis
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="tbdt"
            name="Turbidity (NTU)"
            stroke="#ff7300"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TbdtChart;