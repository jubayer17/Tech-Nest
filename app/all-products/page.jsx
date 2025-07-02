import React, { Suspense } from "react";
import ClientAllProducts from "./ClientAllProducts";

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ClientAllProducts />
    </Suspense>
  );
}
