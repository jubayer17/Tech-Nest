"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const CartDrawer = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    cartItems,
    products,
    updateCartQuantity,
    removeFromCart,
    getCartAmount,
    clearCart,
  } = useAppContext();

  const cartProducts = Object.entries(cartItems)
    .map(([id, qty]) => {
      const product = products.find((p) => p._id === id);
      return product ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[400px] max-w-full z-50 flex flex-col transition-transform duration-300 bg-white shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-orange-500 text-white">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <div className="flex items-center gap-3">
          {cartProducts.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-2xl hover:text-orange-200"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {cartProducts.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">Your cart is empty.</p>
        ) : (
          cartProducts.map((product) => {
            const qty = product.quantity;
            const isMaxQty = qty >= product.stock;
            const total = (product.offerPrice * qty).toFixed(2);

            return (
              <div
                key={product._id}
                className="flex gap-4 p-4 border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 break-words leading-snug">
                    {product.name}
                  </h3>

                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-orange-600 font-medium">
                      ${product.offerPrice}
                    </span>
                    <span className="font-semibold text-gray-800">
                      Total: ${total}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center rounded overflow-hidden border">
                      <button
                        onClick={() => qty > 1 && updateCartQuantity(product._id, qty - 1)}
                        className="w-8 h-8 text-red-600 font-bold bg-red-100 hover:bg-red-200 transition"
                      >
                        –
                      </button>
                      <span className="px-4 text-sm font-medium">{qty}</span>
                      <button
                        onClick={() => !isMaxQty && updateCartQuantity(product._id, qty + 1)}
                        disabled={isMaxQty}
                        className={`w-8 h-8 font-bold transition ${
                          isMaxQty
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="ml-auto text-red-500 hover:text-red-700 text-lg"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-4 bg-orange-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold text-orange-600">
            ${getCartAmount()}
          </span>
        </div>
        <button
          onClick={() => {
            onClose();
            router.push("/cart");
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-medium transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDrawer;
