import connectdb from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1. Authenticate user
    const { userId } = await getAuth(request);

    // 2. Authorize user as seller
    const isSeller = authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 403 }
      );
    }

    // 3. Connect to DB
    await connectdb();

    // 4. Fetch all products
    const products = await Product.find({});

    // 5. Return success
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (err) {
    // 6. Error handling
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
