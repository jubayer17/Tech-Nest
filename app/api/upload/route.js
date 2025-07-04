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

const ALLOWED_CATEGORIES = [
  "Earphone",
  "Headphone",
  "Watch",
  "Smartphone",
  "Laptop",
  "Camera",
  "Mouse",
  "Tablet",
  "Keyboard",
  "Monitor",
  "Processor",
  "Accessories",
];

function isPlainObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

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
    const file = formData.get("file");

    if (!file || file.type !== "application/json") {
      return NextResponse.json(
        { success: false, message: "Only JSON files allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let productArray;
    try {
      productArray = JSON.parse(buffer.toString("utf-8"));
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    if (!Array.isArray(productArray)) {
      return NextResponse.json(
        { success: false, message: "JSON must be an array of products" },
        { status: 400 }
      );
    }

    await connectdb();

    const validProducts = [];
    const invalidProducts = [];

    for (const product of productArray) {
      try {
        const {
          name,
          description,
          category,
          price,
          offerPrice,
          specs,
          images,
          stock = 10,
        } = product;

        // Basic required field validation
        if (
          !name ||
          typeof name !== "string" ||
          name.trim().length < 3 ||
          !description ||
          typeof description !== "string" ||
          !category ||
          typeof category !== "string" ||
          !ALLOWED_CATEGORIES.includes(category) ||
          typeof price !== "number" ||
          price < 0 ||
          typeof offerPrice !== "number" ||
          offerPrice < 0 ||
          offerPrice >= price ||
          stock < 0 ||
          !specs ||
          !isPlainObject(specs)
        ) {
          invalidProducts.push({ product, reason: "Validation failed" });
          continue;
        }

        // Optional: specs deeper validation (Map of Maps)
        let validSpecs = true;
        for (const key in specs) {
          if (!isPlainObject(specs[key])) {
            validSpecs = false;
            break;
          }
          for (const subKey in specs[key]) {
            if (typeof specs[key][subKey] !== "string") {
              validSpecs = false;
              break;
            }
          }
          if (!validSpecs) break;
        }
        if (!validSpecs) {
          invalidProducts.push({ product, reason: "Specs structure invalid" });
          continue;
        }

        // Validate images array and urls
        let uploadedImages = [];
        if (
          images &&
          Array.isArray(images) &&
          images.length > 0 &&
          images.every(
            (img) => typeof img === "string" && img.startsWith("http")
          )
        ) {
          uploadedImages = images;
        } else {
          invalidProducts.push({ product, reason: "Invalid images array" });
          continue;
        }

        validProducts.push({
          userId,
          name: name.trim(),
          description: description.trim(),
          category,
          price,
          offerPrice,
          image: uploadedImages,
          stock,
          specs,
        });
      } catch (err) {
        invalidProducts.push({ product, reason: "Exception: " + err.message });
      }
    }

    if (validProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid products to insert",
          invalidProducts,
        },
        { status: 400 }
      );
    }

    const insertedProducts = await Product.insertMany(validProducts);

    return NextResponse.json({
      success: true,
      message: `${insertedProducts.length} product(s) uploaded successfully.`,
      insertedProducts,
      invalidProductsCount: invalidProducts.length,
      invalidProducts,
    });
  } catch (err) {
    console.error("Bulk Upload Error:", err);
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
