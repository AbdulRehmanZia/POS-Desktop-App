import React, { useState } from "react";
import SalesTable from "../components/SaleTable";
import { ShoppingCart, Download, Calendar } from "lucide-react";
import axios from "axios"; // Add axios import
import toast from "react-hot-toast";

export default function Sale() {
  const [refresh, setRefresh] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/sales/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
         
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `sales-report-${currentDate}.csv`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      // Reset date range display
      setShowDateRange(false);
      toast.success("CSV Generated Successfully")
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export sales report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = () => {
    setStartDate("");
    setEndDate("");
    handleExportCSV();
  };

  const handleDateRangeExport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date');
      return;
    }
    handleExportCSV();
  };

  return (
    <div className="min-h-screen bg-[#F4F9F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading with icon and export functionality */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#2F4F4F] text-white">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2F4F4F]">Sales</h1>
              <p className="text-[#2F4F4F]/80">View your sales transactions</p>
            </div>
          </div>

          {/* Export Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Quick Export Button */}
            <button
              onClick={handleQuickExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#2F4F4F] text-white rounded-lg hover:bg-[#2F4F4F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export All"}
            </button>

            {/* Date Range Export Button */}
            <button
              onClick={() => setShowDateRange(!showDateRange)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2F4F4F] text-white rounded-lg hover:bg-[#2F4F4F]/90 transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Export by Date
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        {showDateRange && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h3 className="text-lg font-semibold text-[#2F4F4F] mb-4">Export Sales by Date Range</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent cursor-pointer"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent cursor-pointer"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDateRangeExport}
                  disabled={isExporting || !startDate || !endDate}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2F4F4F] text-white rounded-md hover:bg-[#2F4F4F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                </button>
                
                <button
                  onClick={() => setShowDateRange(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setStartDate(lastWeek.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-[#2F4F4F]/10 text-[#2F4F4F] rounded hover:bg-[#2F4F4F]/20 transition-colors cursor-pointer"
              >
                Last 7 Days
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setStartDate(lastMonth.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-[#2F4F4F]/10 text-[#2F4F4F] rounded hover:bg-[#2F4F4F]/20 transition-colors cursor-pointer"
              >
                Last 30 Days
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  setStartDate(startOfMonth.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-[#2F4F4F]/10 text-[#2F4F4F] rounded hover:bg-[#2F4F4F]/20 transition-colors cursor-pointer"
              >
                This Month
              </button>
            </div>
          </div>
        )}
        
        <SalesTable refresh={refresh} />
      </div>
    </div>
  );
}