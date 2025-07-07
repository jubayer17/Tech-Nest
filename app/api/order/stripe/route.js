import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Stripe from "stripe";
import axios from "axios";
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
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { address, items } = await request.json();
    const origin = request.headers.get("origin");

    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // Fetch products from DB
    const products = await Promise.all(
      items.map((item) => Product.findById(item.product))
    );

    let amount = 0;
    const productData = [];
    const populatedItems = [];

    for (let i = 0; i < items.length; i++) {
      const product = products[i];
      const quantity = items[i].quantity;

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product not found: ${items[i].product}`,
          },
          { status: 404 }
        );
      }

      amount += (product.offerPrice ?? product.price) * quantity;

      productData.push({
        name: product.name,
        price: product.offerPrice ?? product.price,
        quantity,
      });

      populatedItems.push({ product, quantity });
    }

    // Add 2% extra fee (tax/shipping etc.)
    const orderAmount = amount + Math.floor(amount * 0.02);

    const createdOrder = await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "Stripe",
      isPaid: false,
    });

    // Clear user's cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Get address document
    const addressDoc = await Address.findById(address);
    if (!addressDoc) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    const email = addressDoc.email;
    if (!email) {
      console.warn(
        "No email found on address document. Skipping sending receipt email."
      );
    } else {
      // Send receipt email via your email API route
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-receipt`,
          {
            to: email,
            subject: `Your Order Receipt - Order #${createdOrder._id}`,
            html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ccc;border-radius:8px">
              <h2 style="color:#4CAF50">Order Confirmed!</h2>
              <p><strong>Order ID:</strong> ${createdOrder._id}</p>
              <p><strong>Date:</strong> ${new Date(
                createdOrder.date
              ).toLocaleString()}</p>
              <p><strong>Status:</strong> ${
                createdOrder.status || "Order Placed"
              }</p>
              <p><strong>Payment:</strong> Stripe | Paid: No</p>
              <h3>Shipping Info:</h3>
              <p><strong>${addressDoc.fullName}</strong></p>
              <p>${addressDoc.area}, ${addressDoc.city}, ${
              addressDoc.state
            } - ${addressDoc.pincode}</p>
              <p><strong>Phone:</strong> ${addressDoc.phoneNumber}</p>
              <p><strong>Email:</strong> ${email}</p>
              <h3>Items:</h3>
              <ul>
                ${populatedItems
                  .map(
                    (item) =>
                      `<li>${item.product.name} - Qty: ${item.quantity} × $${(
                        item.product.offerPrice ?? item.product.price
                      ).toFixed(2)}</li>`
                  )
                  .join("")}
              </ul>
              <p style="margin-top:15px;"><strong>Total Paid:</strong> $${orderAmount.toFixed(
                2
              )}</p>
              <p style="color:#888;font-size:14px;">Thank you for shopping with us!</p>
            </div>
          `,
          }
        );
      } catch (emailErr) {
        console.error("❌ Email sending failed:", emailErr);
      }
    }

    // Prepare Stripe line items
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

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
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
