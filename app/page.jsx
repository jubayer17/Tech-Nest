import React, { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
};

export default Page;
