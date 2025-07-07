import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

export const DELETE = authSeller(async (req, { params }) => {
  await connectdb();

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Product ID is required" },
      { status: 400 }
    );
  }

  const deleted = await Product.findOneAndDelete({
    _id: id,
    sellerId: req.user._id,
  });

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Product not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Product deleted successfully",
  });
});
