// /app/api/category/add-subcategory/route.js
import connectdb from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectdb();
    const { category, subcategory } = await req.json();

    const updated = await Category.findOneAndUpdate(
      { name: { $regex: `^${category}$`, $options: "i" } }, // case-insensitive find
      { $addToSet: { subcategories: subcategory } },
      { new: true }
    );

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
