import connectdb from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get userId from Clerk auth
    const { userId } = getAuth(request);

    // Connect to the database
    await connectdb();

    // Fetch all addresses for this user
    const addresses = await Address.find({ userId });

    // Return the list of addresses
    return NextResponse.json({ success: true, addresses });
  } catch (err) {
    // Properly return error message
    return NextResponse.json({ success: false, message: err.message });
  }
}
