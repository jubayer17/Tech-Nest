import connectdb from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1. Authenticate user
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Connect to MongoDB
    await connectdb();

    // 3. Fetch user orders (COD or Paid Stripe), populate related data, sort newest first
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { paymentType: "Stripe", isPaid: true }],
    })
      .populate("address", "fullName area city state phoneNumber")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 })
      .lean();

    // 4. Return orders
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("Order fetch error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
