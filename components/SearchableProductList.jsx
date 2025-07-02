"use client";
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";

const SearchableProductList = ({ products = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Whenever the full products list changes, reset the filtered list
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (term === "") {
      // empty input → show everything
      setFilteredProducts(products);
    } else {
      // filter by substring match
      setFilteredProducts(
        products.filter((p) => p.name.toLowerCase().includes(term))
      );
    }
  };

  return (
    <div>
      {/* Search bar */}
      <div className="flex mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search products..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none"
        />
        <button
          onClick={handleSearch}
          aria-label="Search"
          className="p-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none"
        >
          <FiSearch size={20} />
        </button>
      </div>

      {/* Filtered results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchableProductList;
