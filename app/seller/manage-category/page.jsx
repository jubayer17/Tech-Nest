"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Footer from "@/components/seller/Footer";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [renameInputs, setRenameInputs] = useState({});
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");

  const categoriesPerPage = 15;
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirst, indexOfLast);

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

  const handlePageSubmit = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage("");
    } else {
      toast.error(`Enter valid page number between 1 and ${totalPages}`);
    }
  };

  return (
    <div className="w-full mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-6">Manage Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-600">No categories found.</p>
      ) : (
        <>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {currentCategories.map(({ _id, name }) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-6 gap-2">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-400"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  if (totalPages <= 4 || page <= 3 || page === totalPages) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded border text-sm ${
                          currentPage === page
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-white text-gray-700 border-gray-400"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === 4) {
                    return (
                      <span key="dots" className="px-3 py-1.5 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-400"
                  }`}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder={`1 - ${totalPages}`}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  className="px-3 py-1 border rounded w-24 text-sm"
                />
                <button
                  onClick={handlePageSubmit}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default ManageCategory;
