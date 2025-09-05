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

const DailySalesChart = ({ data, dateRange }) => {
  const chartData = Object.keys(data || {}).map(date => ({
    date,
    sales: data[date],
  }));

  const getChartTitle = () => {
    switch(dateRange) {
      case '7days': return 'Last 7 Days Sales';
      case '30days': return 'Last 30 Days Sales';
      case '90days': return 'Last 90 Days Sales';
      case '6months': return 'Last 6 Months Sales';
      case '12months': return 'Last 12 Months Sales';
      case 'all': return 'All Time Sales';
      default: return 'Daily Sales';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">{getChartTitle()}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#00A896"
            activeDot={{ r: 8 }}
            name="Daily Sales"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySalesChart;