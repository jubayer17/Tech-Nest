// app/api/webhook/route.js

import connectdb from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Address from "@/models/Address";
import Stripe from "stripe";
import nodemailer from "nodemailer";

export const config = {
  // Ensure Vercel doesn’t parse the body so we can get the raw bytes
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  // 1. Connect to database
  await connectdb();

  // 2. Read raw body
  const rawBody = await req.arrayBuffer();
  const buf = Buffer.from(rawBody);

  // 3. Grab Stripe signature header
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  // 4. Verify webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 5. Handle the event
  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;

      // Mark order as paid
      const order = await Order.findById(orderId);
      if (!order) {
        console.error("❌ Order not found:", orderId);
        return new Response("Order not found", { status: 404 });
      }
      order.isPaid = true;
      await order.save();

      // Determine recipient email
      let recipientEmail;
      let addressDoc = order.address
        ? await Address.findById(order.address)
        : null;
      recipientEmail = addressDoc?.email;
      if (!recipientEmail) {
        const user = await User.findById(userId);
        recipientEmail = user?.email;
      }
      if (!recipientEmail) {
        console.error("❌ No recipient email for order:", order._id);
        return new Response("No recipient email available", { status: 400 });
      }

      // Fetch product details
      const populatedItems = await Promise.all(
        order.items.map(async ({ product, quantity }) => {
          const p = await Product.findById(product);
          return { product: p, quantity };
        })
      );

      // Build email HTML
      const itemsHtml = populatedItems
        .map(
          ({ product, quantity }) =>
            `<li>${product.name} — Qty: ${quantity} × $${(
              product.offerPrice || product.price
            ).toFixed(2)}</li>`
        )
        .join("");

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ccc;border-radius:8px">
          <h2 style="color:#4CAF50">Order Confirmed!</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          <p><strong>Payment:</strong> Stripe | <strong>Paid:</strong> Yes</p>
          <h3>Shipping Info:</h3>
          ${
            addressDoc
              ? `<p>${addressDoc.fullName}</p>
                 <p>${addressDoc.area}, ${addressDoc.city}, ${addressDoc.state} — ${addressDoc.pincode}</p>
                 <p><strong>Phone:</strong> ${addressDoc.phoneNumber}</p>`
              : ""
          }
          <p><strong>Email:</strong> ${recipientEmail}</p>
          <h3>Items:</h3>
          <ul>${itemsHtml}</ul>
          <p style="margin-top:15px;"><strong>Total Paid:</strong> $${order.amount.toFixed(
            2
          )}</p>
          <p style="color:#888;font-size:14px;">Thank you for shopping with us!</p>
        </div>
      `;

      // Send receipt email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: recipientEmail,
        subject: `Your Order Receipt — #${order._id}`,
        html,
      });

      console.log("✅ Receipt sent to:", recipientEmail);
    } catch (err) {
      console.error("❌ Error processing webhook:", err);
      // Let Stripe retry if you want, or swallow to avoid loops
    }
  }

  // 6. Return 200 to Stripe
  return new Response("Webhook handled successfully", { status: 200 });
}
