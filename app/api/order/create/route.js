// /app/api/order/create/route.js

import connectdb from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Address from "@/models/Address";
import nodemailer from "nodemailer";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectdb();

    // 1) Authenticate
    const { userId } = await getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2) Validate payload
    const { address, items } = await req.json();
    if (!address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // 3) Compute totals & update stock
    let amount = 0;
    const populatedItems = [];

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
            message: `Only ${product.stock} left for ${product.name}`,
          },
          { status: 409 }
        );
      }

      await Product.findByIdAndUpdate(pid, { $inc: { stock: -qty } });
      populatedItems.push({ product, quantity: qty });
      amount += product.offerPrice * qty;
    }

    const orderAmount = amount + Math.floor(amount * 0.02);

    // 4) Create the order & clear cart
    const createdOrder = await Order.create({
      userId,
      address,
      items,
      amount: orderAmount,
      date: Date.now(),
      paymentType: "COD",
      isPaid: false,
    });
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // 5) Fetch full address
    const addressDoc = await Address.findById(address);
    if (!addressDoc) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // 6) Determine recipient email
    let recipientEmail = addressDoc.email;
    if (!recipientEmail) {
      // Fallback: use user's primary email
      const user = await User.findById(userId);
      if (user && user.email) {
        recipientEmail = user.email;
      } else {
        console.error("No email found on address or user:", {
          addressDoc,
          user,
        });
        return NextResponse.json(
          { success: false, message: "No recipient email available" },
          { status: 400 }
        );
      }
    }

    // 7) Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const itemsHtml = populatedItems
      .map(
        (item) =>
          `<li>${item.product.name} — Qty: ${item.quantity} × $${(
            item.product.offerPrice || item.product.price
          ).toFixed(2)}</li>`
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ccc;border-radius:8px">
        <h2 style="color:#4CAF50">Order Confirmed!</h2>
        <p><strong>Order ID:</strong> ${createdOrder._id}</p>
        <p><strong>Date:</strong> ${new Date(
          createdOrder.date
        ).toLocaleString()}</p>
        <p><strong>Payment:</strong> COD | <strong>Paid:</strong> No</p>
        <h3>Shipping Info:</h3>
        <p>${addressDoc.fullName}</p>
        <p>${addressDoc.area}, ${addressDoc.city}, ${addressDoc.state} — ${
      addressDoc.pincode
    }</p>
        <p><strong>Phone:</strong> ${addressDoc.phoneNumber}</p>
        <p><strong>Email:</strong> ${recipientEmail}</p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p style="margin-top:15px;"><strong>Total Paid:</strong> $${orderAmount.toFixed(
          2
        )}</p>
        <p style="color:#888;font-size:14px;">Thank you for shopping with us!</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: recipientEmail,
      subject: `Your Order Receipt — #${createdOrder._id}`,
      html,
    });

    // 8) Return success
    return NextResponse.json({
      success: true,
      message: "Order placed and receipt emailed.",
      orderId: createdOrder._id,
    });
  } catch (err) {
    console.error("❌ Order POST Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
