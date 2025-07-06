import connectdb from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectdb();
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Name required" },
      { status: 400 }
    );
  }

  const exists = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (exists) {
    return NextResponse.json(
      { success: false, message: "Category already exists" },
      { status: 409 }
    );
  }

  const newCategory = await Category.create({ name });
  return NextResponse.json({ success: true, category: newCategory });
}
