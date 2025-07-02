import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectdb from "@/config/db";

export async function POST(request) {
  try {
    // ✅ No await here
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    const { address } = await request.json();
    await connectdb();

    const newAddress = await Address.create({ ...address, userId });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      newAddress,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
