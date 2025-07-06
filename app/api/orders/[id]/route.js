import connectdb from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Address from "@/models/Address";

export async function GET(req, { params }) {
  await connectdb();

  try {
    const order = await Order.findById(params.id)
      .populate("userId")
      .populate("items.product");

    const address = await Address.findById(order.address);

    return new Response(JSON.stringify({ ...order.toObject(), address }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
