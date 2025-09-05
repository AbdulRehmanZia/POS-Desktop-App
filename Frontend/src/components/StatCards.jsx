import React from "react";
import { CreditCard, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

function StatCard({ icon, title, value, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="bg-gray-100 p-3 rounded-full flex-shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer">
          {icon}
        </div>
      </div>
    </div>
  );
}

const StatCards = ({ analyst }) => {
  const timeStats = analyst?.timeBasedSales ? [
    {
      title: "Today's Sales",
      value: `Rs.${(analyst.timeBasedSales.today || 0).toLocaleString("en-US")}`,
      description: "Today",
      icon: <TrendingUp className="h-5 w-5 text-blue-600 cursor-pointer" />
    },
    {
      title: "Last Week Sales",
      value: `Rs.${(analyst.timeBasedSales.lastWeek || 0).toLocaleString("en-US")}`,
      description: "7 days",
      icon: <TrendingUp className="h-5 w-5 text-green-600 cursor-pointer" />
    },
    {
      title: "Last Month Sales",
      value: `Rs.${(analyst.timeBasedSales.lastMonth || 0).toLocaleString("en-US")}`,
      description: "30 days",
      icon: <TrendingUp className="h-5 w-5 text-purple-600 cursor-pointer" />
    },
    {
      title: "Last 6 Months Sales",
      value: `Rs.${(analyst.timeBasedSales.lastSixMonths || 0).toLocaleString("en-US")}`,
      description: "6 months",
      icon: <TrendingUp className="h-5 w-5 text-orange-600 cursor-pointer" />
    },
    {
      title: "Last Year Sales",
      value: `Rs.${(analyst.timeBasedSales.lastYear || 0).toLocaleString("en-US")}`,
      description: "1 year",
      icon: <TrendingUp className="h-5 w-5 text-red-600 cursor-pointer" />
    },
    {
      title: "All Time Sales",
      value: `Rs.${(analyst.timeBasedSales.allTime || 0).toLocaleString("en-US")}`,
      description: "All time",
      icon: <TrendingUp className="h-5 w-5 text-indigo-600 cursor-pointer" />
    }
  ] : [];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={<ShoppingCart className="h-5 w-5 text-blue-600 cursor-pointer" />}
          title="Total Sales Amount"
          value={`Rs.${analyst?.totalSalesAmount?.toLocaleString("en-US") ?? 0}`}
        />
        <StatCard
          icon={<Package className="h-5 w-5 text-green-600 cursor-pointer" />}
          title="Total Sale Items"
          value={analyst?.totalSaleItems?.toLocaleString("en-US") ?? 0}
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-purple-600 cursor-pointer" />}
          title="Products"
          value={analyst?.totalProducts?.toLocaleString("en-US") ?? 0}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-orange-600 cursor-pointer" />}
          title="Members"
          value={analyst?.totalMembers?.toLocaleString("en-US") ?? 0}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {timeStats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  );
};

export default StatCards;