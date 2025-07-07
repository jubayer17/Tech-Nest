"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Download, RefreshCw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const dateRanges = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export default function SalesAnalytics() {
  const [range, setRange] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 10000);
    }
    return () => clearInterval(interval);
  }, [range, autoRefresh]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/api/seller/sales-analytics?days=${range}`);
      if (data.success) setAnalytics(data.data);
      else setError("Analytics fetch failed");
    } catch (err) {
      setError(err.message || "Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!analytics) return null;
    return {
      labels: analytics.salesByDate.map((d) => d._id),
      datasets: [
        {
          label: "Sales ($)",
          data: analytics.salesByDate.map((d) => d.total),
          borderColor: "#6366F1",
          backgroundColor: "rgba(99,102,241,0.3)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [analytics]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Sales in the Last ${range} Days`,
        font: { size: 18 },
      },
    },
  }), [range]);

  const exportToCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Date", "Sales"],
      ...analytics.salesByDate.map((item) => [item._id, item.total]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_${range}_days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse text-center text-gray-500">
        Loading sales analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!analytics) return null;

  const {
    totalOrders,
    totalSales,
    topProducts,
    trend = { sales: 0, orders: 0 },
  } = analytics;

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-800">Sales Analytics</h1>
        <div className="flex items-center gap-4">
          <select
            className="border px-3 py-1 rounded text-sm"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
          >
            {dateRanges.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            className={`px-3 py-1 rounded text-sm ${autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setAutoRefresh((prev) => !prev)}
          >
            <RefreshCw size={14} className="inline mr-1" /> Auto-Refresh
          </button>
          <button
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
            onClick={exportToCSV}
          >
            <Download size={14} className="inline mr-1" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-100 text-purple-900 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Sales</h2>
          <p className="text-2xl font-bold mt-2">${totalSales.toFixed(2)}</p>
          <p className="text-sm text-purple-700">{trend.sales > 0 ? "↑" : "↓"} {Math.abs(trend.sales)}% from last</p>
        </div>
        <div className="bg-green-100 text-green-900 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold mt-2">{totalOrders}</p>
          <p className="text-sm text-green-700">{trend.orders > 0 ? "↑" : "↓"} {Math.abs(trend.orders)}% from last</p>
        </div>
        <div className="bg-blue-100 text-blue-900 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Top Products</h2>
          <ul className="mt-2 text-sm max-h-32 overflow-y-auto list-disc list-inside">
            {topProducts.length === 0 ? (
              <li>No products sold yet</li>
            ) : (
              topProducts.map((p) => (
                <li key={p._id}>{p.productName} — {p.totalQuantity} units</li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        {chartData ? (
          <Line options={chartOptions} data={chartData} />
        ) : (
          <p className="text-center text-gray-500">No chart data</p>
        )}
      </div>
    </div>
  );
}
