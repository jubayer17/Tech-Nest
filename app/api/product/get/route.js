import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await connectdb();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // If no search term, return all products (or you can limit here)
    const query = search
      ? { name: { $regex: search, $options: "i" } } // case-insensitive substring search
      : {};

    const products = await Product.find(query);

    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("Product GET error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
