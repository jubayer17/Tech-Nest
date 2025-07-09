"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryNavbar from "@/components/CategoryNavbar";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useAppContext } from "@/context/AppContext";
import CartButton from "@/components/CartButton";

const ClientAllProducts = () => {
  const { products } = useAppContext();
  const searchParams = useSearchParams();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    category: "All",
    minPrice: 0,
    maxPrice: Infinity,
    rating: 0,
    search: "",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const searchFromUrl = searchParams.get("search");

    setFilters((prev) => ({
      ...prev,
      category: categoryFromUrl || "All",
      search: searchFromUrl || "",
    }));
  }, [searchParams]);

  useEffect(() => {
    const filtered = products.filter((p) => {
      const rawPrice =
        typeof p.offerPrice === "number"
          ? p.offerPrice
          : parseFloat(String(p.offerPrice).replace(/[^0-9.]/g, "")) || 0;
      const price = Math.round(rawPrice * 100) / 100;

      const ratingValue =
        typeof p.rating === "number"
          ? p.rating
          : parseFloat(String(p.rating)) || 0;

      const matchesCategory =
        filters.category === "All" || p.category === filters.category;

      const matchesPrice =
        price >= filters.minPrice && price <= filters.maxPrice;

      const matchesRating =
        filters.rating === 0 || ratingValue >= filters.rating;

      const matchesSearch =
        filters.search === "" ||
        p.name.toLowerCase().includes(filters.search.toLowerCase());

      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      category:
        newFilters.category !== undefined ? newFilters.category : prev.category,
    }));
  }, []);

  const openDrawer = () => setDrawerOpen(true);

  return (
    <>
      <Navbar />
      <CategoryNavbar />
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex px-6 md:px-16 lg:px-32 gap-4">
        <aside className="hidden lg:block">
          <FilterSidebar
            onFilterChange={handleFilterChange}
            selectedCategory={filters.category}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice === Infinity ? 50000 : filters.maxPrice}
            selectedRating={filters.rating}
          />
        </aside>

        <main className="flex-1">
          <h2 className="text-2xl font-medium capitalize mb-4">
            {filters.category} Products
            {filters.search && (
              <>
                {" "}
                matching "<span className="italic">{filters.search}</span>"
              </>
            )}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 text-lg">
                No products found.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />

              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
      <CartButton openDrawer={openDrawer} />

    
    </>
  );
};

export default ClientAllProducts;
