// app/api/product/seller-list/route.js
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

// Wrap your handler with authSeller so only sellers can fetch
export const GET = authSeller(async (req) => {
  // 1) Connect to the database
  await connectdb();

  // 2) Fetch all products as plain objects, selecting only needed fields
  const products = await Product.find({}).lean().select({
    name: 1,
    category: 1,
    offerPrice: 1,
    image: 1,
    stock: 1,
    reservedStock: 1,
    forceOutOfStock: 1,
    // add any other fields your UI needs…
  });

  // 3) Return them
  return NextResponse.json({ success: true, products }, { status: 200 });
});
