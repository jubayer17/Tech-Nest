"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "ahmedjubayer52@gmail.com",
          subject: `📩 Contact Message from ${form.name}`,
          html: `
            <div>
              <h2>New Contact Submission</h2>
              <p><strong>Name:</strong> ${form.name}</p>
              <p><strong>Email:</strong> ${form.email}</p>
              <p><strong>Message:</strong></p>
              <p>${form.message}</p>
            </div>
          `,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        alert("❌ Failed to send message. Try again later.");
      }
    } catch (error) {
      alert("❌ Server error occurred.");
      console.error("Send mail error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6 text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">
          Contact <span className="text-orange-500">With Us</span>
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Your Message
              </label>
              <textarea
                name="message"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 h-32"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 px-6 rounded-md font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
