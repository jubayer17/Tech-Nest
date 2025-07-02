"use client";

import React, { useState } from "react";

const CategoryNavbar = ({
  categories = [],
  onCategorySelect,
  className = "",
}) => {
  const [active, setActive] = useState(categories[0] || "All");

  const handleClick = (cat) => {
    setActive(cat);
    onCategorySelect?.(cat);
  };

  return (
    <div
      className={`sticky top-[64px] z-20 w-full bg-white border-t border-b border-gray-300 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
        <ul className="flex justify-center space-x-6 whitespace-nowrap py-3 m-0">
          {categories.map((cat) => {
            const isActive = active === cat;
            const base = "text-sm font-medium px-4 py-1 rounded-lg transition";
            const activeCls =
              "text-orange-600 relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-1 after:bg-orange-600";
            const inactiveCls =
              "text-gray-700 hover:text-orange-600 hover:bg-orange-50";
            return (
              <li key={cat} className="m-0 p-0">
                <button
                  type="button"
                  onClick={() => handleClick(cat)}
                  className={`${base} ${isActive ? activeCls : inactiveCls}`}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
        {/* Separator line (centered, short) */}
        <div className="h-px bg-gray-300 w-20 mx-auto" />
      </div>
    </div>
  );
};

export default CategoryNavbar;
