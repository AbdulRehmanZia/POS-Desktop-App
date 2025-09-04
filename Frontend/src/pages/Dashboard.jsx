import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { api } from "../Instance/api";
import StatCards from "../components/StateCards";
import CategoryWiseProducts from "../components/CategoryWiseProducts";
import DailySalesChart from "../components/DailySalesChart";
import RecentActivity from "../components/RecentActivity";
import { Loader, ShoppingCart } from "lucide-react";

export default function Dashboard() {
  const [analyst, setAnalyst] = useState(null);
  const [users, setUsers] = useState([]);
  const [category, setCategory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analystRes, activityRes] = await Promise.all([
          api.get("analyst"),
          api.get("analyst/recent-activity")
        ]);
        
        setAnalyst(analystRes.data.data);
        
        const { categories = [], users = [], sales = [] } = activityRes.data.data || {};
        setCategory(Array.isArray(categories) ? categories : []);
        setUsers(Array.isArray(users) ? users : []);
        setSales(Array.isArray(sales) ? sales : []);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const categoryData = analyst?.categoryWiseProductCount?.map((d) => ({
    name: d.name,
    products: d._count.products,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F9F9] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#2F4F4F] text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2F4F4F]">Dashboard</h1>
                <p className="text-[#2F4F4F]/80">Loading your dashboard...</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center items-center h-64">
             <Loader className="animate-spin h-10 w-10 text-[#1C3333]" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome back, {user.fullname}
      </h1>

      {user.role === "admin" ? (
        <>
          {/* Stat Cards Component */}
          <StatCards analyst={analyst} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Category Wise Products Chart Component */}
            <CategoryWiseProducts data={categoryData} />

            {/* Daily Sales Chart Component */}
            <DailySalesChart data={analyst?.dailySales} />
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