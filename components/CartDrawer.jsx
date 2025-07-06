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
      className={`fixed top-0 right-0 h-full w-[400px] max-w-full shadow-2xl transition-transform z-50 flex flex-col border-l border-gray-300 bg-white ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } duration-300`}
      style={{ fontSize: "0.875rem" }}
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-gray-50">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
          Your Cart
          {cartProducts.length > 0 && (
            <button
              onClick={clearCart}
              aria-label="Empty cart"
              title="Empty cart"
              className="text-red-600 hover:text-red-800 transition flex items-center justify-center w-7 h-7 rounded-full bg-red-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18M9 6v12m6-12v12M5 6l1 14h12l1-14"
                />
              </svg>
            </button>
          )}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close cart"
          className="text-3xl text-gray-500 hover:text-red-600 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {cartProducts.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            Your cart is empty.
          </p>
        ) : (
          cartProducts.map((product) => {
            const qty = product.quantity;
            const isMaxQty = qty >= product.stock;
            const increaseQty = () => {
              if (!isMaxQty) updateCartQuantity(product._id, qty + 1);
            };
            const decreaseQty = () => {
              if (qty > 1) updateCartQuantity(product._id, qty - 1);
            };
            const total = (product.offerPrice * qty).toFixed(2);

            return (
              <div
                key={product._id}
                className="flex gap-5 items-center border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <h3
                    className="text-gray-900 font-semibold truncate"
                    title={product.name}
                    style={{ fontSize: "0.9rem" }}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-1 gap-4 flex-nowrap min-w-0">
                    <p className="text-green-600 font-semibold whitespace-nowrap">
                      ${product.offerPrice}
                    </p>

                    <p
                      className="font-semibold text-gray-900 whitespace-nowrap"
                      style={{ minWidth: 0 }}
                    >
                      Total: ${total}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-4 flex-nowrap">
                    <div className="flex items-center border rounded-full overflow-hidden w-max select-none">
                      <button
                        onClick={decreaseQty}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        value={qty}
                        min={1}
                        max={product.stock}
                        onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val) || val < 1) val = 1;
                          if (val > product.stock) val = product.stock;
                          updateCartQuantity(product._id, val);
                        }}
                        className="w-12 text-center font-semibold text-gray-900 border-none focus:outline-none"
                      />

                      <button
                        onClick={increaseQty}
                        disabled={isMaxQty}
                        className={`w-8 h-8 flex items-center justify-center font-bold transition ${
                          isMaxQty
                            ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                        }`}
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product._id)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition shrink-0"
                      title="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t px-6 py-5 bg-gray-50">
        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-medium text-gray-900">Total:</span>
          <span className="text-xl font-extrabold text-green-700 truncate max-w-[150px] text-right">
            ${getCartAmount()}
          </span>
        </div>
        <button
          onClick={() => {
            onClose();
            router.push("/cart");
          }}
          className="w-full py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition duration-300"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDrawer;
