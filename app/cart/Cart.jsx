"use client";

import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import OrderSummary from "@/components/OrderSummary";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 7;

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    clearCart,
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");

  // Build array of cart products with quantity
  const cartArray = Object.entries(cartItems)
    .map(([id, qty]) => {
      const product = products.find((p) => p._id === id);
      return product && qty > 0 ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean);

  const totalPages = Math.ceil(cartArray.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = cartArray.slice(start, start + ITEMS_PER_PAGE);

  const handlePageSubmit = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage("");
    } else {
      toast.error(`Enter valid page number between 1 and ${totalPages}`);
    }
  };

  const handleClear = () => {
    if (!cartArray.length) return toast.error("Cart is already empty");
    if (confirm("Clear all items from your cart?")) {
      clearCart();
      setCurrentPage(1);
      toast.success("Cart cleared");
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col md:flex-row gap-8 px-4 md:px-12 lg:px-24 pt-14 mb-20 max-w-[1600px] mx-auto">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-700">
                Your <span className="text-orange-600 font-medium">Cart</span>
              </h1>
              <p className="text-gray-600">{getCartCount()} item(s)</p>
            </div>
            <button
              onClick={handleClear}
              disabled={!cartArray.length}
              className={`px-4 py-2 rounded-md text-sm transition ${
                cartArray.length
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Clear Cart
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700">Product</th>
                  <th className="text-left px-4 py-3 text-gray-700 hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-gray-700">Qty</th>
                  <th className="text-left px-4 py-3 text-gray-700">Subtotal</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500 italic">
                      Your cart is empty.
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((p) => {
                    const { _id, name, image, offerPrice, quantity, stock } = p;
                    return (
                      <tr key={_id} className="border-t">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={image[0]}
                              alt={name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                          <p className="text-gray-800 break-words">{name}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                          ${offerPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(_id, quantity - 1)}
                              disabled={quantity <= 1}
                              className={`px-2 py-1 rounded ${
                                quantity > 1
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              –
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={stock}
                              value={quantity}
                              onChange={(e) => {
                                let v = parseInt(e.target.value, 10) || 1;
                                if (v > stock) {
                                  toast.error(`Only ${stock} in stock`);
                                  v = stock;
                                }
                                updateCartQuantity(_id, v);
                              }}
                              className="w-12 text-center border rounded text-sm"
                            />
                            <button
                              onClick={() => addToCart(_id)}
                              disabled={quantity >= stock}
                              className={`px-2 py-1 rounded ${
                                quantity < stock
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          ${(offerPrice * quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateCartQuantity(_id, 0)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-6 gap-2">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  if (totalPages <= 4 || page <= 3 || page === totalPages) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded border text-sm ${
                          page === currentPage
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === 4) {
                    return <span key="dots">…</span>;
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder={`1–${totalPages}`}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  className="w-16 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={handlePageSubmit}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm"
                >
                  Go
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/all-products")}
            className="mt-6 text-orange-600 text-sm hover:underline flex items-center gap-1"
          >
            Continue Shopping <span>→</span>
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 sticky top-24">
          <OrderSummary />
        </div>
      </div>
    </>
  );
};

export default Cart;
