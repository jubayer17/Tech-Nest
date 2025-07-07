import React, { Suspense } from "react";
import ContactPage from "./ContactPage";

export default function about() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactPage />
    </Suspense>
  );
}
