"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const ProductDetailsTabs = ({
  productId,
  specs = {},
  description = "",
  questions = [],
  reviews = [],
}) => {
  const [activeTab, setActiveTab] = useState("specs");

  const [newQuestion, setNewQuestion] = useState("");
  const [allQuestions, setAllQuestions] = useState(questions);

  const [newReviewText, setNewReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [allReviews, setAllReviews] = useState(reviews || []);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");

  const fetchLatestReviews = async () => {
    if (!productId) return;
    setLoadingReviews(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const updated = await res.json();

      if (!Array.isArray(updated)) {
        setError("Invalid reviews data received.");
        setAllReviews([]);
      } else {
        const sorted = updated.sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        setAllReviews(sorted);
      }
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
      setError("Failed to load reviews. Please try again later.");
      setAllReviews([]);
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    fetchLatestReviews();
  }, [productId]);

  const handleQuestionSubmit = () => {
    if (newQuestion.trim()) {
      setAllQuestions([...allQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleReviewSubmit = async () => {
    if (selectedRating === 0) return alert("Please select a rating");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          stars: selectedRating,
          reviewText: newReviewText.trim(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setNewReviewText("");
        setSelectedRating(0);
        fetchLatestReviews(); // Refresh reviews after adding
      } else {
        alert(result.message || "Failed to add review");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      alert("Something went wrong");
    }
  };

  const tabs = [
    { key: "specs", label: "Specifications" },
    { key: "description", label: "Description" },
    { key: "questions", label: "Questions" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div className="w-full mt-16">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-300 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 border-b-2 transition duration-200 ${
              activeTab === tab.key
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-orange-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6 p-6 border border-gray-200 rounded-xl bg-white shadow-sm w-full min-h-[300px]">
        {activeTab === "specs" && (
          <div className="flex flex-col gap-6">
            {Object.entries(specs).length > 0 ? (
              Object.entries(specs).map(([mainKey, subSpecs], i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50 space-y-2">
                  <h3 className="text-gray-800 font-semibold mb-1">{mainKey}</h3>
                  {typeof subSpecs === "object" ? (
                    Object.entries(subSpecs).map(([subKey, subValue], j) => (
                      <div
                        key={j}
                        className="flex justify-between text-sm text-gray-700 px-2"
                      >
                        <span className="font-medium">{subKey}</span>
                        <span className="text-gray-600">{subValue}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No sub-specs found.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No specifications provided.</p>
            )}
          </div>
        )}

        {activeTab === "description" && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {activeTab === "questions" && (
          <div className="space-y-4">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {allQuestions.length > 0 ? (
                allQuestions.map((q, i) => <li key={i}>{q}</li>)
              ) : (
                <p className="text-gray-400">No questions yet.</p>
              )}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleQuestionSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {loadingReviews && <p className="text-gray-500">Loading reviews...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {!loadingReviews && !error && (
                <>
                  {allReviews.length > 0 ? (
                    allReviews.map((r, i) => (
                      <div
                        key={r._id || i}
                        className="border p-4 rounded-lg bg-gray-50 space-y-1"
                      >
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <Image
                              key={val}
                              src={
                                val <= r.stars ? assets.star_icon : assets.star_dull_icon
                              }
                              alt="star"
                              className="w-4 h-4"
                            />
                          ))}
                        </div>
                        {r.reviewText && (
                          <p className="text-sm text-gray-700 mt-1">{r.reviewText}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No reviews yet.</p>
                  )}
                </>
              )}
            </div>

            {/* Review form */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Leave a review</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Image
                    key={val}
                    src={val <= selectedRating ? assets.star_icon : assets.star_dull_icon}
                    alt="rate"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => setSelectedRating(val)}
                  />
                ))}
              </div>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Write your review (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleReviewSubmit}
                className="mt-3 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
