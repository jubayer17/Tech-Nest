import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import connectdb from "@/config/db";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = await getAuth(req);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stock = formData.get("stock");
    const specsRaw = formData.get("specs");
    const files = formData.getAll("images");

    if (
      !name ||
      !description ||
      !category ||
      price === null ||
      offerPrice === null ||
      stock === null ||
      stock === ""
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (isNaN(price) || isNaN(offerPrice) || isNaN(stock)) {
      return NextResponse.json(
        {
          success: false,
          message: "Price, offer price, and stock must be valid numbers",
        },
        { status: 400 }
      );
    }

    if (Number(offerPrice) >= Number(price)) {
      return NextResponse.json(
        { success: false, message: "Offer price must be less than price" },
        { status: 400 }
      );
    }

    if (Number(stock) < 0) {
      return NextResponse.json(
        { success: false, message: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    // ✅ Parse specs (from stringified JSON to object)
    let specs = {};
    try {
      specs = specsRaw ? JSON.parse(specsRaw) : {};
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid specification format" },
        { status: 400 }
      );
    }

    // ⬆️ Upload images to Cloudinary
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = result.map((r) => r.secure_url);

    await connectdb();

    // ✅ Include specs in product creation
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: imageUrls,
      date: Date.now(),
      stock: Number(stock),
      specs,
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      newProduct,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
