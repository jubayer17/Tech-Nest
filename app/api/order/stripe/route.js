import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    await connectdb();

    const { userId } = await getAuth(request);
    const { address, items } = await request.json();
    const origin = request.headers.get("origin");

    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // Calculate total and prepare line items
    let amount = 0;
    const productData = [];

    for (const { product: pid, quantity } of items) {
      const product = await Product.findById(pid);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${pid}` },
          { status: 404 }
        );
      }
      const price = product.offerPrice ?? product.price;
      amount += price * quantity;
      productData.push({ name: product.name, price, quantity });
    }

    const orderAmount = amount + Math.floor(amount * 0.02);

    // Create the order (isPaid remains false until webhook)
    const createdOrder = await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "Stripe",
      isPaid: false,
    });

    // Clear the user's cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Build Stripe line_items for checkout
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd", // or your local currency
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: createdOrder._id.toString(),
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Order Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
