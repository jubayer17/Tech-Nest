import Stripe from "stripe";
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { cartItems, userId } = await req.json();

    if (
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0 ||
      !userId
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cart data or userId" },
        { status: 400 }
      );
    }

    await connectdb();

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId,
      items: cartItems.map(({ _id, quantity }) => ({
        product: _id,
        quantity,
      })),
      amount: totalAmount,
      isPaid: false,
      paymentType: "Stripe",
      date: Date.now(),
    });

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "usd", // or "bdt" if you need
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-placed`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe (simple) route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
