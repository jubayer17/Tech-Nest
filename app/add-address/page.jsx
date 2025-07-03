import React, { Suspense } from "react";
import AddAddress from "./AddAddress";

export default function AddAddressPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddAddress />
    </Suspense>
  );
}
