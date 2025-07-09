"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";

const CartButton = ({ openDrawer }) => {
  const { getCartCount } = useAppContext();
  const [animate, setAnimate] = useState(false);
  const prevTotal = useRef(0);

  const totalQuantity = getCartCount();

  useEffect(() => {
    if (totalQuantity > prevTotal.current) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timeout);
    }
    prevTotal.current = totalQuantity;
  }, [totalQuantity]);

  return (
    <div
      onClick={openDrawer}
      className={`
        fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full
        shadow-lg cursor-pointer transition-transform duration-200
        ${animate ? "animate-alarm-vibrate" : ""}
      `}
    >
      <FaShoppingCart size={22} />
      {totalQuantity > 0 && (
        <span
          className="
            absolute -top-1 -right-1 bg-red-500 text-white text-[11px]
            w-5 h-5 rounded-full flex items-center justify-center
          "
        >
          {totalQuantity}
        </span>
      )}
    </div>
  );
};

export default CartButton;
