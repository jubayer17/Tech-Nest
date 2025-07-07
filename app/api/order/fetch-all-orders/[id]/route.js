// app/api/order/fetch-all-orders/[id]/route.js
import connectdb from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectdb();
    const { id } = params;

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.product", "name")
      .populate("address");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
