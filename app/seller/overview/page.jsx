"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "@/components/seller/Footer";

const colors = [
  "bg-green-600",
  "bg-blue-600",
  "bg-yellow-500",
  "bg-purple-600",
  "bg-indigo-600",
  "bg-red-600",
  "bg-teal-600",
  "bg-pink-600",
  "bg-orange-600",
];

const Page = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/seller/overview").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <div className="p-6 text-center text-lg font-semibold">Loading...</div>;

  const info = [
    { title: "Total Sales", value: `$${(data.totalSales ?? 0).toFixed(2)}`, color: colors[0] },
    { title: "Total Orders", value: data.totalOrders ?? 0, color: colors[1] },
    { title: "Pending Orders", value: data.pendingOrders ?? 0, color: colors[2] },
    { title: "Total Categories", value: data.totalCategories ?? 0, color: colors[3] },
    { title: "Total Products", value: data.totalProducts ?? 0, color: colors[4] },
    { title: "Out of Stock", value: data.outOfStock ?? 0, color: colors[5] },
    { title: "Total Customers", value: data.totalCustomers ?? 0, color: colors[6] },
    {
      title: "Average Order Value",
      value: `$${(data.averageOrderValue ?? 0).toFixed(2)}`,
      color: colors[7],
    },
    { title: "Low Stock Products", value: data.lowStockProducts ?? 0, color: colors[8] },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900">Seller Overview</h2>

      <div className="grid grid-cols-[repeat(3,minmax(0,350px))] gap-x-12 gap-y-4 w-full justify-center">

        {info.map((item, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl text-white shadow-md ${item.color}`}
            aria-label={item.title}
          >
            <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
            <p className="text-3xl font-extrabold font-mono">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Top Selling Products</h3>
        {data.topProducts.length === 0 ? (
          <p className="text-gray-700">No top products available.</p>
        ) : (
          <div className="space-y-4">
            {data.topProducts.map((p, i) => (
              <div
                key={p.product._id}
                className="p-5 border border-gray-200 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow duration-300"
              >
                <span className="font-medium text-gray-900">
                  {i + 1}. {p.product.name}
                </span>
                <span className="font-semibold text-indigo-600">{p.totalSold} sold</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
      
    </div>

  );
};

export default Page;
