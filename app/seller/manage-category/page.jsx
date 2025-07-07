"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [renameInputs, setRenameInputs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category/list");
      if (res.data.success) {
        setCategories(res.data.categories);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (err) {
      toast.error("Error fetching categories");
    }
  };

  const handleRenameCategory = async (oldName) => {
    const newName = renameInputs[oldName]?.trim();
    if (!newName) return toast.error("Enter new name");
    if (oldName === newName) return toast.error("New name is same as old");

    const exists = categories.find(
      (c) => c.name.toLowerCase() === newName.toLowerCase()
    );
    if (exists) return toast.error("Category already exists");

    setLoading(true);
    try {
      // Create new
      const res = await axios.post("/api/category/create", { name: newName });
      if (!res.data.success) throw new Error("Failed to create new category");

      // Delete old
      const del = await axios.delete("/api/category/delete", {
        data: { name: oldName },
      });
      if (!del.data.success) throw new Error("Failed to delete old category");

      toast.success("Category renamed successfully");
      setRenameInputs((prev) => ({ ...prev, [oldName]: "" }));
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Rename operation failed");
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (name) => {
    const confirm = window.confirm(`Delete category "${name}"?`);
    if (!confirm) return;

    setLoading(true);
    try {
      const res = await axios.delete("/api/category/delete", {
        data: { name },
      });
      if (res.data.success) {
        toast.success("Category deleted");
        setCategories((prev) => prev.filter((c) => c.name !== name));
      } else {
        toast.error("Failed to delete category");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error deleting category");
    }
    setLoading(false);
  };

  return (
    <div className="w-full mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-6">Manage Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-600">No categories found.</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {categories.map(({ _id, name }) => (
            <div
              key={_id}
              className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border border-gray-200 p-3 rounded w-full"
            >
              <span className="flex-1 font-medium text-gray-800">{name}</span>
              <input
                type="text"
                placeholder="Rename"
                value={renameInputs[name] || ""}
                onChange={(e) =>
                  setRenameInputs((prev) => ({
                    ...prev,
                    [name]: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-3 py-1 w-full md:w-52"
              />
              <button
                onClick={() => handleRenameCategory(name)}
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Rename
              </button>
              <button
                onClick={() => handleDeleteCategory(name)}
                disabled={loading}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default ManageCategory;
