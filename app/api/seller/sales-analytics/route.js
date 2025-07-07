// /app/api/seller/sales-analytics/route.js  (or /pages/api/seller/sales-analytics.js depending on your setup)

import connectdb from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb();

    // 1) Get total sales & total orders
    const totalOrders = await Order.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.totalAmount || 0;

    // 2) Sales by day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await Order.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo.getTime() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3) Top 5 products sold (by quantity)
    const productSales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          productName: "$productDetails.name",
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalSales,
        salesByDate,
        topProducts: productSales,
      },
    });
  } catch (error) {
    console.error("Sales Analytics API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
