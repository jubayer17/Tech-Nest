"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";

const FilterSidebar = ({ onFilterChange }) => {
  const { products } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedRating, setSelectedRating] = useState(0);

  const categories = [
    "Earphone",
    "Headphone",
    "Watch",
    "Smartphone",
    "Laptop",
    "Camera",
    "Mouse",
    "Keyboard",
    "Monitor",
    "Processor",
    "Accessories",
  ];

  const priceRanges = [
    { label: "$0–$500", min: 0, max: 500 },
    { label: "$501–$1000", min: 501, max: 1000 },
    { label: "$1001–$3000", min: 1001, max: 3000 },
    { label: "$3001–$5000", min: 3001, max: 5000 },
    { label: "$5001–$10000", min: 5001, max: 10000 },
    { label: "$10001–$20000", min: 10001, max: 20000 },
    { label: "$20001–$50000", min: 20001, max: 50000 },
    { label: ">50000", min: 50001, max: Number.MAX_SAFE_INTEGER },
  ];

  const applyFilter = () => {
    onFilterChange({
      category: selectedCategory,
      minPrice,
      maxPrice,
      rating: selectedRating,
    });
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    applyFilter();
  };

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setMaxPrice(value);
    applyFilter();
  };

  const handleRatingChange = (star) => {
    setSelectedRating(star);
    applyFilter();
  };

  const handleManualFilter = () => {
    const min = Math.max(0, Number(minPrice) || 0);
    const max = Math.max(min, Number(maxPrice) || min);
    setMinPrice(min);
    setMaxPrice(max);
    onFilterChange({
      category: selectedCategory,
      minPrice: min,
      maxPrice: max,
      rating: selectedRating,
    });
  };

  const handleRangeButton = (range) => {
    setMinPrice(range.min);
    setMaxPrice(range.max);
    onFilterChange({
      category: selectedCategory,
      minPrice: range.min,
      maxPrice: range.max,
      rating: selectedRating,
    });
  };

  return (
    <div className="w-64 p-4 bg-white shadow-xl rounded-2xl sticky top-6 h-[calc(100vh-2rem)] overflow-y-auto">
      <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-5">
        Filters
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="All">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingChange(star)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                selectedRating === star
                  ? "bg-orange-600 text-white border-orange-600 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">{star}</span>
                {Array.from({ length: star }).map((_, i) => (
                  <span key={i} className="text-orange-500">
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm font-medium">& Up</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Price: ৳{Math.min(maxPrice, 50000)}
        </label>
        <input
          type="range"
          min="0"
          max="50000"
          step="1"
          value={Math.min(maxPrice, 50000)}
          onChange={handleSliderChange}
          className="w-full cursor-pointer"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={handleManualFilter}
          className="mt-3 w-full px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm transition hover:bg-orange-700"
        >
          Filter
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Price Ranges
        </label>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => {
            const isActive = minPrice === range.min && maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() => handleRangeButton(range)}
                className={`px-4 py-2 rounded-lg border transition duration-200 ${
                  isActive
                    ? "bg-orange-600 text-white border-orange-600 shadow"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-orange-50 hover:border-orange-400"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
