import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await connectdb();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const products = await Product.find(query).lean(); // lean returns plain JS objects

    // Convert _id from ObjectId to string for frontend ease
    const productsWithStringId = products.map(product => ({
      ...product,
      _id: product._id.toString(),
    }));

    return NextResponse.json({ success: true, products: productsWithStringId });
  } catch (err) {
    console.error("Product GET error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
