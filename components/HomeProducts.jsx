import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = ({ openDrawer }) => {
  const { products, router } = useAppContext();
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1280) return setColumns(5);
      if (w >= 1024) return setColumns(4);
      if (w >= 768)  return setColumns(3);
      return setColumns(2);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const maxItems = columns * 3;

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">
        Popular Products
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
        {products
          .slice(0, maxItems)
          .map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              openDrawer={openDrawer}
            />
          ))
        }
      </div>

      <button
        onClick={() => router.push("/all-products")}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
