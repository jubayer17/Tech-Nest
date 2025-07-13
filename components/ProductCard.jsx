"use client";

import React, { useEffect, useState } from "react";
import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, router, addToCart } = useAppContext();

  const stock =
    typeof product.stock === "number" && !isNaN(product.stock)
      ? product.stock
      : 0;

  // We'll keep avgRating as state, fetch reviews and calculate avgRating dynamically
  const [avgRating, setAvgRating] = useState(product.avgRating || 0);

  // Fetch and compute avgRating for this product on mount or when product changes
  useEffect(() => {
    const fetchReviews = async (productId) => {
      try {
        const res = await fetch(`/api/reviews/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        // Sort descending by date or createdAt
        const sorted = data.sort(
          (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        // Calculate average rating rounded to nearest 0.5
        const sum = sorted.reduce((acc, r) => acc + r.stars, 0);
        const avg = sorted.length ? Math.round((sum / sorted.length) * 2) / 2 : 0;
        setAvgRating(avg);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        // fallback to product.avgRating if fetch fails
        setAvgRating(product.avgRating || 0);
      }
    };

    if (product?._id) {
      fetchReviews(product._id);
    }
  }, [product]);

  const handleCardClick = () => {
    router.push(`/product/${product._id}`);
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id);
  };

  const handleBuyNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id);
    router.push("/cart");
  };

  return (
    <div>
      <div
        className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden"
        onClick={handleCardClick}
      >
        <Image
          src={product.image[0]}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
        />
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
            <span className="bg-red-600/90 text-white text-sm font-bold uppercase px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <svg
            className="h-3 w-3 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3
             7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 
             22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <p className="md:text-base font-semibold pt-2 w-full truncate text-gray-800">
        {product.name}
      </p>

      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate mt-1">
        {product.description}
      </p>

      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs">{avgRating.toFixed(1)}</p>
        <div className="flex items-center gap-0.5 text-orange-500">
          {Array.from({ length: 5 }).map((_, index) => {
            const full = index + 1 <= Math.floor(avgRating);
            const half =
              !full &&
              avgRating >= index + 0.5 &&
              avgRating < index + 1;
            return full ? (
              <MdStar key={index} className="w-4 h-4" />
            ) : half ? (
              <MdStarHalf key={index} className="w-4 h-4" />
            ) : (
              <MdStarBorder key={index} className="w-4 h-4" />
            );
          })}
        </div>
      </div>

      <p
        className={`text-xs font-medium mt-1 ${
          stock > 0 ? "text-green-600" : "text-red-500"
        }`}
      >
        {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
      </p>

      <div className="w-full mt-2">
        <div className="flex items-center gap-2">
          <p className="text-base font-medium text-gray-900">
            {currency}
            {product.offerPrice}
          </p>
          <p className="text-sm text-gray-500 line-through">
            {currency}
            {product.price}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-2 max-sm:hidden">
        <button
          type="button"
          onClick={handleAddToCartClick}
          disabled={stock <= 0}
          className="px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNowClick}
          disabled={stock <= 0}
          className="px-4 py-1.5 text-white bg-orange-500 border border-orange-500 rounded-full text-xs hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
