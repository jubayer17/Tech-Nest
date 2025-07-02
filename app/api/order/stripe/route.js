import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Stripe from "stripe";

import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Route handler
export async function POST(request) {
  try {
    await connectdb();

    const { userId } = await getAuth(request); // ✅ Corrected: use request instead of req
    const { address, items } = await request.json();
    const origin = request.headers.get("origin");

    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;

    const products = await Promise.all(
      items.map((item) => Product.findById(item.product))
    );

    for (let i = 0; i < items.length; i++) {
      const product = products[i];
      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product not found: ${items[i].product}`,
        });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: items[i].quantity,
      });

      amount += product.offerPrice * items[i].quantity;
    }

    const orderAmount = amount + Math.floor(amount * 0.02);

    // ✅ Create order in database
    const order = await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "Stripe", // ✅ hardcoded
      isPaid: false,
    });

    // ✅ Prepare Stripe line items
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Order Error:", err);
    return NextResponse.json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}
