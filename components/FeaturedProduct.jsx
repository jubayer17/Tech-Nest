"use client";
import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
    category: "Headphone", // ✅ Use this
  },
  {
    id: 2,
    image: assets.boy_with_camera_image,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
    category: "Camera",
  },
  {
    id: 3,
    image: assets.girl_with_laptop,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
    category: "Laptop",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-semibold text-gray-900">Featured Products</p>
        <div className="w-28 h-1 bg-orange-600 mt-2 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description, category }) => {
          const encodedCategory = encodeURIComponent(category); // ✅ Encode safely
          const url = `/all-products?category=${encodedCategory}`;

          return (
            <div key={id} className="rounded-xl overflow-hidden shadow-md relative">
              <div className="relative w-full h-[400px]">
                <Image
                  src={image}
                  alt={title}
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-6 left-6 z-10 space-y-2 text-white">
                  <p className="font-semibold text-xl lg:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {title}
                  </p>
                  <p className="text-sm lg:text-base leading-5 max-w-[240px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {description}
                  </p>
                  <Link href={url}>
                    <button className="mt-2 flex items-center gap-1.5 bg-orange-600 hover:bg-black hover:scale-110 hover:transition-all duration-200 ease-in-out  px-4 py-2 rounded text-sm font-medium text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                      Buy now
                      <Image
                        src={assets.redirect_icon}
                        alt="Redirect Icon"
                        width={12}
                        height={12}
                      />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProduct;
