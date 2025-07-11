"use client";

import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import ProductDetailsTabs from "@/components/ProductDetailsTabs";
import CartDrawer from "@/components/CartDrawer";
import CartButton from "@/components/CartButton";

const Product = () => {
  const { id } = useParams();
  const { products, router, addToCart } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const product = products.find((p) => p._id === id);
    if (product) {
      setProductData(product);
      setQuantity(1);
      setMainImage(null);
    }
  }, [id, products]);

  if (!productData) return <Loading />;

  const inStock = productData.stock;

  const increaseQty = () => {
    setQuantity((q) => (q < inStock ? q + 1 : q));
  };

  const decreaseQty = () => {
    setQuantity((q) => (q > 1 ? q - 1 : q));
  };

  const handleAddToCart = () => {
    addToCart(productData._id, quantity);
    openDrawer();
  };

  const handleBuyNow = () => {
    addToCart(productData._id, quantity);
    router.push("/cart");
  };

  return (
    <>
      <Navbar />
      <CartDrawer isOpen={drawerOpen} onClose={closeDrawer} />

      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image gallery */}
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage || productData.image[0]}
                alt={productData.name}
                className="w-full h-auto object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.image.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImage(img)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={img}
                    alt={`${productData.name} ${i + 1}`}
                    className="w-full h-auto object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details & actions */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <Image key={i} className="h-4 w-4" src={assets.star_icon} alt="star" />
                ))}
                <Image className="h-4 w-4" src={assets.star_dull_icon} alt="star empty" />
              </div>
              <p>(4.5)</p>
            </div>

            <p className="text-gray-600 mt-3">{productData.description}</p>

            <p className="text-3xl font-medium mt-6">
              ${productData.offerPrice}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                ${productData.price}
              </span>
            </p>

            <hr className="bg-gray-600 my-6" />

            {/* Specs table */}
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">{productData.specs?.General?.Brand || "Generic"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">{productData.specs?.General?.Color || "Multi"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">{productData.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center mt-10 gap-4">
              <div className="flex items-center border border-orange-500 rounded overflow-hidden">
                <button
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  className={`px-4 py-2 text-xl font-bold ${quantity <= 1 ? 'text-orange-300 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-100'} transition select-none`}
                >
                  -
                </button>
                <div className="px-6 py-2 border-x border-orange-500 text-lg font-semibold text-gray-700 select-none">
                  {quantity}
                </div>
                <button
                  onClick={increaseQty}
                  disabled={quantity >= inStock}
                  className={`px-4 py-2 text-xl font-bold ${quantity >= inStock ? 'text-orange-300 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-100'} transition select-none`}
                >
                  +
                </button>
              </div>
              {inStock <= 5 && <span className="text-sm text-red-600">Only {inStock} left</span>}
            </div>

            {/* Action buttons */}
            <div className="flex items-center mt-6 gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        <ProductDetailsTabs specs={productData.specs || {}} description={productData.description || ""} questions={[]} reviews={[]} />

        {/* Featured */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products.slice(0, 5).map((p, idx) => <ProductCard key={idx} product={p} />)}
          </div>
          <button className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50 transition">
            See more
          </button>
        </div>
      </div>

      <Footer />
      <CartButton openDrawer={openDrawer} />
    </>
  );
};

export default Product;
