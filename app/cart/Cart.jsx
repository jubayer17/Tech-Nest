"use client";
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
  } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">
              {getCartCount()} Items
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find((p) => p._id === itemId);
                  const qty = cartItems[itemId];

                  if (!product || qty <= 0) return null;

                  return (
                    <tr key={itemId}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            <Image
                              src={product.image[0]}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="object-cover mix-blend-multiply"
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        ${product.offerPrice}
                      </td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          {/* Decrease */}
                          <button
                            onClick={() => {
                              const newQty = qty - 1;
                              if (newQty >= 1) {
                                updateCartQuantity(product._id, newQty);
                              }
                            }}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              width={16}
                              height={16}
                              className={`w-4 h-4 ${
                                qty <= 1 ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            />
                          </button>

                          {/* Input */}
                          <input
                            type="number"
                            min={1}
                            max={product.stock}
                            value={qty}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              if (isNaN(val) || val < 1) {
                                val = 1;
                              } else if (val > product.stock) {
                                val = product.stock;
                                toast.error(`Only ${product.stock} in stock`);
                              }
                              updateCartQuantity(product._id, val);
                            }}
                            className="w-10 border text-center appearance-none"
                          />

                          {/* Increase */}
                          <button
                            onClick={() => {
                              if (qty < product.stock) {
                                addToCart(product._id);
                              } else {
                                toast.error("Out of stock");
                              }
                            }}
                            disabled={qty >= product.stock}
                            aria-label="Increase quantity"
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              width={16}
                              height={16}
                              className={`w-4 h-4 ${
                                qty >= product.stock
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        ${(product.offerPrice * qty).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="group flex items-center mt-6 gap-2 text-orange-600"
          >
            <Image
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
              width={24}
              height={24}
              className="group-hover:-translate-x-1 transition"
            />
            Continue Shopping
          </button>
        </div>

        {/* Order Summary Panel */}
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
