import React, { Suspense } from "react";
import AboutPage from "./AboutPage";

export default function about() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPage />
    </Suspense>
  );
}
