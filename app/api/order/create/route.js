import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectdb();

    const { userId } = await getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address, items } = await req.json();
    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    let amount = 0;

    for (const { product: pid, quantity: qty } of items) {
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json(
          { success: false, message: `Invalid quantity for ${pid}` },
          { status: 400 }
        );
      }

      const product = await Product.findById(pid);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${pid}` },
          { status: 404 }
        );
      }

      if (product.stock < qty) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${product.stock} left in stock for ${product.name}`,
          },
          { status: 409 }
        );
      }

      console.log(`🟡 Before stock of ${product.name}: ${product.stock}`);

      const updatedProduct = await Product.findByIdAndUpdate(
        pid,
        { $inc: { stock: -qty } },
        { new: true }
      );

      console.log(
        `🟢 After stock of ${updatedProduct.name}: ${updatedProduct.stock}`
      );

      amount += product.offerPrice * qty;
    }

    const orderAmount = amount + Math.floor(amount * 0.02);

    await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "COD",
      isPaid: false,
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    return NextResponse.json({
      success: true,
      message: "Order placed and stock updated.",
    });
  } catch (err) {
    console.error("❌ Order POST Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
