import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

export const POST = authSeller(async (req, context) => {
  try {
    await connectdb();
    const { productId, newStock } = await req.json();

    if (!productId || typeof newStock !== "number" || newStock < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID or stock value" },
        { status: 400 }
      );
    }

    // Just find product by id, no ownership check
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Update stock without checking userId ownership
    product.stock = newStock;
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});
