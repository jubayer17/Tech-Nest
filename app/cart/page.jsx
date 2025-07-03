import React, { Suspense } from "react";
import Cart from "./Cart";

const CartPage = () => {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <Cart />
    </Suspense>
  );
};

export default CartPage;
