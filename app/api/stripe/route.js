import { buffer } from "micro";
import connectdb from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const rawBody = await buffer(request);
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const session = sessionList.data[0];
      const { orderId, userId } = session.metadata;

      await connectdb();

      if (isPaid) {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
      } else {
        await Order.findByIdAndDelete(orderId);
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntent(event.data.object.id, true);
        break;
      case "payment_intent.canceled":
        await handlePaymentIntent(event.data.object.id, false);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Stripe webhook error:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
}
