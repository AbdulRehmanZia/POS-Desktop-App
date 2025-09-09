import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { api } from "../Instance/api";
import StatCards from "../components/StatCards";
import CategoryWiseProducts from "../components/CategoryWiseProducts";
import DailySalesChart from "../components/DailySalesChart";
import RecentActivity from "../components/RecentActivity";
import { Loader, ShoppingCart, Calendar, ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [analyst, setAnalyst] = useState(null);
  const [users, setUsers] = useState([]);
  const [category, setCategory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const { user } = useContext(UserContext);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAnalystData = async (range = dateRange) => {
    try {
      const response = await api.get(`analyst?range=${range}`);
      setAnalyst(response.data.data);
    } catch (err) {
      console.error("Analyst API Error:", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get("analyst/recent-activity");
      const { categories = [], users = [], sales = [] } = response.data.data || {};
      setCategory(Array.isArray(categories) ? categories : []);
      setUsers(Array.isArray(users) ? users : []);
      setSales(Array.isArray(sales) ? sales : []);
    } catch (err) {
      console.error("Recent Activity API Error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchAnalystData(),
          fetchRecentActivity()
        ]);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDateRangeChange = async (newRange) => {
    setDateRange(newRange);
    setShowDropdown(false);
    setLoading(true);
    await fetchAnalystData(newRange);
    setLoading(false);
  };

  const categoryData = analyst?.categoryWiseProductCount?.map((d) => ({
    name: d.name,
    products: d._count.products,
  }));

  const getRangeLabel = () => {
    switch(dateRange) {
      case 'today': return 'Today';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      case '6months': return 'Last 6 Months';
      case '12months': return 'Last 12 Months';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-800 text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-10 w-10 text-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.fullname}
        </h1>

        {user.role === "admin" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{getRangeLabel()}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => handleDateRangeChange('today')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('7days')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('30days')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('90days')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Last 90 Days
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('6months')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('12months')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Last 12 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('all')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    All Time
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {user.role === "admin" ? (
        <>
          {/* Stat Cards Component */}
          <StatCards analyst={analyst} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Category Wise Products Chart Component */}
            <CategoryWiseProducts data={categoryData} />

            {/* Daily Sales Chart Component */}
            <DailySalesChart data={analyst?.dailySales} dateRange={dateRange} />
          </div>

          {/* Recent Activity Component */}
          <RecentActivity users={users} categories={category} sales={sales} />
        </>
      ) : (
        <>
          {/* Regular User Dashboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Your Recent Orders</h2>
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <p className="text-gray-500">Order history would appear here</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}