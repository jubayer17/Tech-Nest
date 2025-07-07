"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import logo2 from "../assets/logo.svg";
import { useClerk, UserButton } from "@clerk/nextjs";
import axios from "axios";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import technest from "../assets/technest.svg"
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const Navbar = ({
  className = "",
  categories = [
    "All",
    "Laptop",
    "Smartphone",
    "Tablet",
    "Earphone",
    "Headphone",
    "Watch",
    "Software",
    "Camera",
    "Mouse",
    "Keyboard",
    "Monitor",
    "Security",
    "Processor",
    "Accessories",
  ],
  onCategorySelect,
  categoryClassName = "",
}) => {
  const { isSeller, user, getCartCount } = useAppContext();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const cartCount = getCartCount();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [filteredProducts, setFilteredProducts] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch filtered product suggestions for dropdown
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        const res = await axios.get(
          `/api/product/get?search=${encodeURIComponent(debouncedSearchTerm)}`
        );
        if (res.data.success) {
          setFilteredProducts(res.data.products);
        } else {
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Search API error:", error);
        setFilteredProducts([]);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  // Sync search box when navigating via back/forward
  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    setSearchTerm(newSearch);
  }, [searchParams]);

  const handleProductClick = (id) => {
    setSearchTerm("");
    setFilteredProducts([]);
    router.push(`/product/${id}`);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      router.push(
        `/all-products?search=${encodeURIComponent(searchTerm.trim())}`
      );
      setFilteredProducts([]);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts([]);
    if (pathname === "/all-products") {
      router.push("/all-products"); // clears the ?search param
    }
  };

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const containerRef = useRef(null);

  const scrollCategories = (direction) => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const amount = clientWidth * 0.5;
      containerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - amount : scrollLeft + amount,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    router.push(`/all-products?category=${encodeURIComponent(cat)}`);
    onCategorySelect?.(cat);
  };

  return (
    <nav
      className={`sticky top-0 z-30 bg-white border-b border-gray-300 text-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3">
        <Image
          src={technest}
          alt="logo"
          className="cursor-pointer w-28 md:w-32"
          onClick={() => router.push("/")}
        />

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {["Home", "Shop", "About Us", "Contact"].map((label, idx) => (
            <Link
              key={label}
              href={idx === 1 ? "/all-products" : "/"}
              className="border-b-2 border-transparent hover:border-red-700 transition-all duration-300"
            >
              {label}
            </Link>
          ))}
          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs border px-4 py-1.5 rounded-full"
            >
              Seller Dashboard
            </button>
          )}
        </div>

        {/* Search bar + Cart + Account */}
        <div className="hidden md:flex items-center gap-4 relative">
          <div className="relative w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
            />

            {/* ❌ clear icon */}
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-8 flex items-center px-2 text-gray-500 hover:text-gray-700"
                title="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}

            {/* 🔍 search icon */}
            <button
              onClick={handleSearchSubmit}
              aria-label="Search"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <Image
                src={assets.search_icon}
                alt="search"
                className="w-5 h-5"
              />
            </button>

            {/* Live dropdown suggestions */}
            {filteredProducts.length > 0 && (
              <div className="absolute z-50 top-12 left-0 right-0 bg-white border max-h-60 overflow-y-auto rounded shadow">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleProductClick(product._id)}
                  >
                    {product.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <div
            className="relative cursor-pointer"
            onClick={() => router.push("/cart")}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          {/* Account */}
          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex items-center md:hidden gap-3">
          {isSeller && (
            <button
              onClick={() => router.push("/seller")}
              className="text-xs border px-4 py-1.5 rounded-full"
            >
              Seller
            </button>
          )}
          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Home"
                  labelIcon={<HomeIcon />}
                  onClick={() => router.push("/")}
                />
                <UserButton.Action
                  label="Products"
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push("/all-products")}
                />
                <UserButton.Action
                  label="Cart"
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
                <UserButton.Action
                  label="My Orders"
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="user icon" />
              Account
            </button>
          )}
        </div>
      </div>

      {/* Category Navbar */}
      <div
        className={`w-full bg-gray-100 border-t border-gray-300 shadow-sm ${categoryClassName}`}
      >
        <div className="relative max-w-7xl mx-auto px-6">
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-500 text-orange-500 shadow-md hover:bg-gray-200 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
          </button>

          <ul
            ref={containerRef}
            className="flex space-x-6 whitespace-nowrap py-3 overflow-x-auto scroll-smooth m-0 pl-24 pr-24"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const baseCls =
                "text-sm font-medium px-4 py-1 rounded-2xl transition duration-300 ease-in-out";
              const activeCls =
                "text-orange-600 bg-white shadow-md relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-1 after:bg-orange-600";
              const inactiveCls =
                "text-gray-700 hover:text-orange-600 hover:bg-gray-200";

              return (
                <li key={cat} className="list-none">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={`${baseCls} ${
                      isActive ? activeCls : inactiveCls
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-500 text-orange-500 shadow-md hover:bg-gray-200 transition"
          >
            <FontAwesomeIcon icon={faArrowRight} className="text-2xl" />
          </button>

          <div className="h-px bg-gray-300 w-20 mx-auto" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
