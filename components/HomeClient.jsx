"use client";
import React, { useState } from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartButton from "@/components/CartButton"; // ← import it

const HomeClient = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <Navbar />
      <CartDrawer isOpen={drawerOpen} onClose={closeDrawer} />

      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />

        {/* Pass openDrawer to children so they can add-to-cart without opening */}
        <HomeProducts openDrawer={openDrawer} />
        <FeaturedProduct openDrawer={openDrawer} />

        <Banner />
        <NewsLetter />
      </div>

      <Footer />
      {/* Floating Cart Button */}
      <CartButton openDrawer={openDrawer} />
    </>
  );
};

export default HomeClient;
