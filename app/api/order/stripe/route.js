import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
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
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    const products = await Promise.all(
      items.map((item) => Product.findById(item.product))
    );

    let productData = [];
    let amount = 0;

    for (let i = 0; i < items.length; i++) {
      const product = products[i];
      const quantity = items[i].quantity;

      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product not found: ${items[i].product}`,
        });
      }

      if (quantity > product.stock - product.reservedStock) {
        return NextResponse.json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity,
      });

      amount += product.offerPrice * quantity;
    }

    const orderAmount = amount + Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "Stripe",
      isPaid: false,
    });

    // Reserve stock
    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { reservedStock: item.quantity },
        })
      )
    );

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

    const user = await User.findById(userId);

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      customer_email: user?.email || undefined,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Order Error:", err.stack || err);
    return NextResponse.json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}
