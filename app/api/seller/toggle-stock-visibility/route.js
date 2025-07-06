// app/api/seller/toggle-stock-visibility/route.js
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

export const POST = authSeller(async (req) => {
  await connectdb();
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json(
      { success: false, message: "Product ID is required" },
      { status: 400 }
    );
  }

  // Load current product
  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 }
    );
  }

  // Compute new values
  let newStock, newReserved, newFlag;
  if (!product.forceOutOfStock) {
    // Hide stock
    newReserved = product.reservedStock ?? product.stock;
    newStock = 0;
    newFlag = true;
  } else {
    // Show stock
    newStock = product.reservedStock ?? product.stock;
    newReserved = null;
    newFlag = false;
  }

  // Atomically update and return lean object with all fields
  const updated = await Product.findByIdAndUpdate(
    productId,
    { stock: newStock, reservedStock: newReserved, forceOutOfStock: newFlag },
    { new: true }
  )
    .lean()
    .select({
      stock: 1,
      reservedStock: 1,
      forceOutOfStock: 1,
      name: 1,
      category: 1,
      offerPrice: 1,
      image: 1,
    });

  return NextResponse.json({
    success: true,
    message: `Toggled to ${
      updated.forceOutOfStock ? "Out of Stock" : "In Stock"
    }`,
    product: updated,
  });
});
