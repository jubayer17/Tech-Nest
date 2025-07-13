"use client";

import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import ProductDetailsTabs from "@/components/ProductDetailsTabs";
import CartDrawer from "@/components/CartDrawer";
import CartButton from "@/components/CartButton";

import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";

const Product = () => {
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      const sorted = data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setProductReviews(sorted);

      const sum = sorted.reduce((acc, r) => acc + r.stars, 0);
      const avg = sorted.length ? Math.round((sum / sorted.length) * 2) / 2 : 0;
      setAvgRating(avg);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    const product = products.find((p) => p._id === id);
    if (product) {
      setProductData(product);
      setQuantity(1);
      setMainImage(null);
      fetchReviews(product._id);
      window.scrollTo(0, 0);
    }
  }, [id, products]);

  if (!productData) return <Loading />;

  const inStock = productData.stock || 0;

  const increaseQty = () => setQuantity((q) => (q < inStock ? q + 1 : q));
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : q));

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

      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage || productData.image?.[0] || assets.placeholder}
                alt={productData.name}
                className="w-full h-auto object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.image?.map((img, i) => (
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

          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>

            <div className="flex items-center gap-2 text-orange-500">
              {Array.from({ length: 5 }).map((_, index) => {
                const full = index + 1 <= Math.floor(avgRating);
                const half =
                  !full && avgRating >= index + 0.5 && avgRating < index + 1;
                return full ? (
                  <MdStar key={index} className="w-5 h-5" />
                ) : half ? (
                  <MdStarHalf key={index} className="w-5 h-5" />
                ) : (
                  <MdStarBorder key={index} className="w-5 h-5" />
                );
              })}
              <p className="text-sm text-gray-600 ml-1">({avgRating})</p>
            </div>

            <p className="text-gray-600 mt-3">{productData.description}</p>

            <p className="text-3xl font-medium mt-6">
              ${productData.offerPrice}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                ${productData.price}
              </span>
            </p>

            <hr className="bg-gray-600 my-6" />

            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">
                      {productData.specs?.General?.Brand || "Generic"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">
                      {productData.specs?.General?.Color || "Multi"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">{productData.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {inStock > 0 && (
              <div className="flex items-center mt-10 gap-4">
                <div className="flex items-center border border-orange-500 rounded overflow-hidden">
                  <button
                    onClick={decreaseQty}
                    disabled={quantity <= 1}
                    className={`px-4 py-2 text-xl font-bold ${
                      quantity <= 1
                        ? "text-orange-300 cursor-not-allowed"
                        : "text-orange-600 hover:bg-orange-100"
                    } transition select-none`}
                  >
                    -
                  </button>
                  <div className="px-6 py-2 border-x border-orange-500 text-lg font-semibold text-gray-700 select-none">
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQty}
                    disabled={quantity >= inStock}
                    className={`px-4 py-2 text-xl font-bold ${
                      quantity >= inStock
                        ? "text-orange-300 cursor-not-allowed"
                        : "text-orange-600 hover:bg-orange-100"
                    } transition select-none`}
                  >
                    +
                  </button>
                </div>
                {inStock <= 5 && (
                  <span className="text-sm text-red-600">Only {inStock} left</span>
                )}
              </div>
            )}

            {inStock === 0 && (
              <p className="text-red-600 font-medium text-sm mt-8">
                Out of stock — this product is currently unavailable
              </p>
            )}

            <div className="flex items-center mt-4 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={inStock === 0}
                className={`w-full py-3.5 ${
                  inStock === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-800/80 hover:bg-gray-200"
                } transition`}
              >
                {inStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={inStock === 0}
                className={`w-full py-3.5 ${
                  inStock === 0
                    ? "bg-orange-200 text-white cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                } transition`}
              >
                {inStock === 0 ? "Out of Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>

        <ProductDetailsTabs
          productId={productData._id}
          specs={productData.specs}
          description={productData.description}
          questions={[]}
          reviews={productReviews}
        />

        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products.slice(0, 5).map((p, idx) => (
              <ProductCard key={idx} product={p} />
            ))}
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
