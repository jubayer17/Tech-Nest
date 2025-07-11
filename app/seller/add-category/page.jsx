"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Footer from "@/components/seller/Footer";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([""]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category/list");
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setSelectedCategory(res.data.categories[0].name);
        }
      }
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return toast.error("Category name required");

    setCategoryLoading(true);
    try {
      const res = await axios.post("/api/category/create", {
        name: categoryName.trim(),
      });

      if (res.data.success) {
        toast.success("Category created");
        setCategoryName("");
        fetchCategories();
        setSelectedCategory(res.data.category.name);
      } else {
        toast.error(res.data.message || "Error creating category");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error creating category");
    }
    setCategoryLoading(false);
  };

  const handleAddSubcategories = async (e) => {
    e.preventDefault();

    const trimmed = subCategories.map((s) => s.trim()).filter(Boolean);
    const unique = [...new Set(trimmed)];

    if (!selectedCategory) return toast.error("Select a category");
    if (unique.length === 0) return toast.error("Enter at least one subcategory");

    setSubLoading(true);
    try {
      await Promise.all(
        unique.map((sub) =>
          axios.put("/api/category/add-subcategory", {
            category: selectedCategory,
            subcategory: sub,
          })
        )
      );
      toast.success("Subcategories added");
      setSubCategories([""]);
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding subcategories");
    }
    setSubLoading(false);
  };

  return (
    <div className="w-full px-4 md:px-8 mt-10">
      <div className="grid md:grid-cols-2 gap-8 w-full bg-white p-6 rounded shadow">
        {/* Add Category */}
        <section className="w-full">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory}>
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

        {/* Add Subcategories */}
        <section className="w-full">
          <h2 className="text-xl font-semibold mb-4">Add Subcategories</h2>
          <form onSubmit={handleAddSubcategories}>
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
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  disabled={subLoading}
                />
                {subCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSubCategories((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
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
        
      </div>
      <Footer/>

    </div>
  );
};

export default AddCategory;
