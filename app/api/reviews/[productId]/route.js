import { getAuth } from "@clerk/nextjs/server"; // optional auth
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Review from "@/models/Review";

export async function GET(request, context) {
  try {
    await connectdb();

    // ✅ explicitly await params
    const { productId } = await context.params;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("Review GET Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    // optional: require a logged‑in user
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, stars, reviewText } = await request.json();

    if (!productId || typeof stars !== "number") {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (stars < 0.5 || stars > 5) {
      return NextResponse.json(
        { success: false, message: "Stars must be between 0.5 and 5" },
        { status: 400 }
      );
    }

    await connectdb();

    const newReview = await Review.create({
      productId,
      stars,
      reviewText: (reviewText || "").trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Review POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
