import React, { Suspense } from "react";
import OrderPlaced from "./OrderPlaced";

export default function OrderPlacedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderPlaced />
    </Suspense>
  );
}
