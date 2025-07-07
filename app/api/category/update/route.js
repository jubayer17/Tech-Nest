import connectdb from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectdb();
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json(
        { success: false, message: "Both oldName and newName are required." },
        { status: 400 }
      );
    }

    // ensure newName isn't already taken
    const existing = await Category.findOne({ name: newName });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category name already exists." },
        { status: 400 }
      );
    }

    const updated = await Category.findOneAndUpdate(
      { name: oldName },
      { name: newName },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Category "${oldName}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
