"use client";

import React, { useState } from "react";

const ProductDetailsTabs = ({
  specs = {},
  description = "",
  questions = [],
  reviews = [],
}) => {
  const [activeTab, setActiveTab] = useState("specs");
  const [newQuestion, setNewQuestion] = useState("");
  const [newReview, setNewReview] = useState("");
  const [allQuestions, setAllQuestions] = useState(questions);
  const [allReviews, setAllReviews] = useState(reviews);

  const handleQuestionSubmit = () => {
    if (newQuestion.trim()) {
      setAllQuestions([...allQuestions, newQuestion]);
      setNewQuestion("");
    }
  };

  const handleReviewSubmit = () => {
    if (newReview.trim()) {
      setAllReviews([...allReviews, newReview]);
      setNewReview("");
    }
  };

  const tabs = [
    { key: "specs", label: "Specifications" },
    { key: "description", label: "Description" },
    { key: "questions", label: "Questions" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div className="w-full mt-12">
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

      <div className="mt-6 p-6 border rounded-xl border-gray-200 bg-white shadow-sm w-full">
        {activeTab === "specs" && (
          <div className="flex flex-col gap-6">
            {Object.entries(specs).map(([mainKey, subSpecs], i) => (
              <div
                key={i}
                className="border rounded-lg p-4 bg-gray-50 space-y-2"
              >
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
                  <div className="text-gray-500 italic">
                    No sub-specs found.
                  </div>
                )}
              </div>
            ))}
            {Object.keys(specs).length === 0 && (
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
            <div className="flex gap-2 mt-4">
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
          <div className="space-y-4">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {allReviews.length > 0 ? (
                allReviews.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <p className="text-gray-400">No reviews yet.</p>
              )}
            </ul>
            <div className="flex gap-2 mt-4">
              <input
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write a review..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsTabs;
