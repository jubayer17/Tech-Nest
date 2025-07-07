"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Page = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([""]);
  const [existingSubs, setExistingSubs] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get("/api/category/list");
        if (res.data.success) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setSelectedCategory(res.data.categories[0].name);
          }
        } else toast.error("Failed to load categories");
      } catch (err) {
        toast.error("Error loading categories");
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const selected = categories.find((c) => c.name === selectedCategory);
    setExistingSubs(selected?.subcategories || []);
  }, [selectedCategory, categories]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return toast.error("Category name required");

    setCategoryLoading(true);
    try {
      const res = await axios.post("/api/category/create", {
        name: categoryName.trim(),
      });
      if (res.data.success) {
        toast.success(`Category "${res.data.category.name}" created`);
        setCategoryName("");
        setCategories((prev) => [...prev, res.data.category]);
        setSelectedCategory(res.data.category.name);
      } else toast.error(res.data.message || "Failed to create category");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating category");
    }
    setCategoryLoading(false);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();

    const trimmedSubs = subCategories.map((s) => s.trim()).filter(Boolean);

    const existingLower = existingSubs.map((s) => s.toLowerCase());

    const newSubs = trimmedSubs.filter(
      (sub) => !existingLower.includes(sub.toLowerCase())
    );

    const uniqueNewSubs = [...new Set(newSubs)];

    if (!selectedCategory) return toast.error("Select a category");
    if (uniqueNewSubs.length === 0)
      return toast.error("No new valid subcategories");

    setSubLoading(true);
    try {
      await Promise.all(
        uniqueNewSubs.map((sub) =>
          axios.put("/api/category/add-subcategory", {
            category: selectedCategory,
            subcategory: sub,
          })
        )
      );
      toast.success("Subcategories added");
      setSubCategories([""]);
      const updated = await axios.get("/api/category/list");
      if (updated.data.success) {
        setCategories(updated.data.categories);
        const refreshed = updated.data.categories.find(
          (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        setExistingSubs(refreshed?.subcategories || []);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Error adding subcategories"
      );
    }
    setSubLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-10 p-4 bg-white rounded shadow">
      {/* Add Category */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleCategorySubmit}>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-orange-500"
            disabled={categoryLoading}
          />
          <button
            type="submit"
            className={`w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition ${
              categoryLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={categoryLoading}
          >
            {categoryLoading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </section>

      {/* Add Subcategory */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Add Subcategories</h2>
        <form onSubmit={handleSubSubmit}>
          <label className="block mb-2 font-medium">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            disabled={categories.length === 0}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {subCategories.map((val, idx) => (
            <div key={idx} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={`Subcategory ${idx + 1}`}
                value={val}
                onChange={(e) => {
                  const copy = [...subCategories];
                  copy[idx] = e.target.value;
                  setSubCategories(copy);
                }}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
                disabled={subLoading}
              />
              {subCategories.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSubCategories((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-red-600 font-bold px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSubCategories((prev) => [...prev, ""])}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            + Add another subcategory
          </button>

          <button
            type="submit"
            className={`w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition ${
              subLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={subLoading}
          >
            {subLoading ? "Adding..." : "Add Subcategories"}
          </button>
        </form>
      </section>

      {/* Show existing subcategories */}
      {existingSubs.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-2">
            Existing Subcategories in "{selectedCategory}"
          </h2>
          <ul className="list-disc pl-6 text-sm text-gray-700">
            {existingSubs.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Page;
