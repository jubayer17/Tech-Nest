"use client";

import Navbar from "@/components/Navbar";
import { FaUsers, FaRocket, FaHandshake } from "react-icons/fa";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 text-gray-800">
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-700">
          About <span className="text-orange-500">TECH NEST</span>
        </h1>

        <section className="mb-10">
          <p className="text-lg mb-4 text-justify">
            <strong>Tech Nest</strong> is your modern solution for
            e-commerce—bringing you the latest electronics, tech gadgets, and
            accessories at unbeatable prices. Our goal is simple: make online
            shopping fast, smooth, and fun.
          </p>
          <p className="text-lg text-justify">
            We believe in a frictionless customer journey—from discovering
            quality products to a quick, secure checkout and on-time delivery.
            With trusted brands and 24/7 support, Tech Nest is built to exceed
            your expectations.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg shadow-inner mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            Meet the Founder
          </h2>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-700">Jubayer Ahmed</p>
            <p className="text-sm text-gray-700 mt-1">Founder & Full Stack Engineer</p>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              With a deep passion for modern web technologies and user-focused design,
              Jubayer founded <strong>Tech Nest</strong> to redefine online shopping — blending speed,
              reliability, and elegant UI into a seamless customer experience.
            </p>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-indigo-100 rounded-lg p-6 shadow hover:shadow-lg transition">
            <FaRocket className="text-3xl text-indigo-600 mb-2" />
            <h3 className="text-xl font-semibold mb-1">Fast & Reliable</h3>
            <p className="text-sm text-gray-700">
              Our platform ensures speed, from browsing to checkout and
              delivery.
            </p>
          </div>

          <div className="bg-orange-100 rounded-lg p-6 shadow hover:shadow-lg transition">
            <FaUsers className="text-3xl text-orange-600 mb-2" />
            <h3 className="text-xl font-semibold mb-1">User-Centric</h3>
            <p className="text-sm text-gray-700">
              Designed with users in mind — clean, modern, and easy to navigate.
            </p>
          </div>

          <div className="bg-green-100 rounded-lg p-6 shadow hover:shadow-lg transition">
            <FaHandshake className="text-3xl text-green-600 mb-2" />
            <h3 className="text-xl font-semibold mb-1">Trust & Support</h3>
            <p className="text-sm text-gray-700">
              We care about your experience. Chat support and secure payment
              always included.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
