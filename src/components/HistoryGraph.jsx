import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { historyData } from "../data/historyData";

const startDate = new Date("2023-01-01T08:00:00"); // Start date for your dataset

const generateDate = (day, hour, week) => {
  const baseDate = new Date(startDate);
  const baseDay = baseDate.getDate(); // Store the base day
  const dayOffset = (week * 7 + (day - 1)) * 24 * 60 * 60 * 1000; // Calculate total days offset including weeks
  const hourOffset = (hour - 8) * 60 * 60 * 1000; // Calculate total hours offset
  const targetDate = new Date(baseDate.getTime() + dayOffset + hourOffset);
  targetDate.setDate(baseDay); // Set the day to the base day
  return targetDate;
};

const determineSafety = (record) => {
  return (
    record.pH <= 7.8 &&
    record.pH >= 7.2 &&
    record.conductivity <= 2000 &&
    record.Turbidity <= 50
  );
};

const processData = (data) => {
  const safeCountByMonth = {};

  let week = 0; // Initialize week count

  const today = new Date();
  const past3Months = new Date(
    today.getFullYear(),
    today.getMonth() - 2,
    today.getDate()
  );
  const past6Months = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    today.getDate()
  );

  data.forEach((record) => {
    const recordDate = generateDate(record.Day, record.Hour, week);
    const monthKey = recordDate.getMonth() + 1; // Month number (1 for January, 2 for February, etc.)

    if (!safeCountByMonth[monthKey]) {
      safeCountByMonth[monthKey] = { safe: 0, unsafe: 0 };
    }
    if (determineSafety(record)) {
      safeCountByMonth[monthKey].safe++;
    } else {
      safeCountByMonth[monthKey].unsafe++;
    }

    // Increment week when it's the first day of the week (e.g., Monday)
    if (record.Day === 1) {
      week++;
    }
  });

  return Object.keys(safeCountByMonth).map((monthKey) => {
    return {
      month: monthKey, // Update to use the month number directly
      safe: safeCountByMonth[monthKey].safe,
      unsafe: safeCountByMonth[monthKey].unsafe,
    };
  });
};

export const HistoryGraph = () => {
  const [filter, setFilter] = useState("lifetime");
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    setProcessedData(processData(historyData));
  }, [historyData]);

  const totalSafeCount = processedData.reduce(
    (acc, curr) => acc + curr.safe,
    0
  );
  const totalUnsafeCount = processedData.reduce(
    (acc, curr) => acc + curr.unsafe,
    0
  );

  const pieChartData = [
    { name: "Safe", value: totalSafeCount },
    { name: "Unsafe", value: totalUnsafeCount },
  ];

  return (
    <div className=" mt-7">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="safe" fill="#82ca9d" name={"Safe water counts"} />
          <Bar dataKey="unsafe" fill="#ff7f0e" name={"Unsafe water counts"} />
        </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#82ca9d" : "#ff7f0e"}
                name={index === 0 ? "Safe water counts" : "Unsafe water counts"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};