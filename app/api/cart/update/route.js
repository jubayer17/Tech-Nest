import connectdb from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get user ID from the authenticated session
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse cart data from request body
    const { cartData } = await request.json();

    // Connect to database
    await connectdb();

    // Find user in database
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user's cart items
    user.cartItems = cartData;
    await user.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (err) {
    console.error("Error updating cart:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
