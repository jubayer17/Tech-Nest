import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

export const DELETE = authSeller(async (req, { params }) => {
  try {
    await connectdb();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});
