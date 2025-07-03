import React, { Suspense } from "react";
import MyOrders from "./MyOrders";

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <MyOrders />
    </Suspense>
  );
}
