// app/api/reviews/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectdb from "@/config/db";
import Review from "@/models/Review";

export async function POST(request) {
  try {
    await connectdb();

    // 1. Parse the incoming body
    const body = await request.json();
    console.log("📥 Review POST body:", body);

    const { productId, stars, reviewText } = body;

    // 2. Validate required fields and types
    if (!productId || typeof stars !== "number") {
      console.error("❌ Missing fields or wrong types");
      return NextResponse.json(
        { success: false, message: "Missing productId or stars" },
        { status: 400 }
      );
    }

    if (stars < 0.5 || stars > 5) {
      console.error("❌ Invalid stars value:", stars);
      return NextResponse.json(
        { success: false, message: "Stars must be between 0.5 and 5" },
        { status: 400 }
      );
    }

    // 3. Validate productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.warn("⚠️ productId is not a valid ObjectId:", productId);
      return NextResponse.json(
        { success: false, message: "Invalid productId" },
        { status: 400 }
      );
    }

    const pid = new mongoose.Types.ObjectId(productId);

    // 4. Create the review document
    const review = await Review.create({
      productId: pid,
      stars,
      reviewText: (reviewText || "").trim(),
    });

    console.log("✅ Created review:", review);

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err) {
    console.error("🚨 Review POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
