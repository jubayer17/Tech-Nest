// app/api/order/all/route.js
import connectdb from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Address from "@/models/Address";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb();

    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.product", "name")
      .populate("address");

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
