import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { cartItems, userId } = await req.json();

    if (!cartItems || cartItems.length === 0 || !userId) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    await connectdb();

    const order = await Order.create({
      userId,
      items: cartItems,
      isPaid: false,
      date: Date.now(),
    });

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Order Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
