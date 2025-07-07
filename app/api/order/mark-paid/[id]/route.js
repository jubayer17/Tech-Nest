// app/api/order/mark-paid/[id]/route.js
import connectdb from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectdb();
    const { id } = params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { isPaid: true },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update" },
      { status: 500 }
    );
  }
}
