"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-hot-toast";

const SellerProductStockManager = () => {
  const { getToken, user } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");

  const productsPerPage = 15;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, value) => {
    if (!id) return;
    const newStock = parseInt(value, 10);
    if (isNaN(newStock) || newStock < 0) return;

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/seller/update-stock",
        { productId: id, newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Stock updated");
        fetchSellerProduct();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/seller/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Product deleted");
        fetchSellerProduct();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const toggleStockVisibility = async (productId) => {
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/seller/toggle-stock-visibility",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setProducts((prev) =>
          prev.map((p) => (p._id === data.product._id ? data.product : p))
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handlePageSubmit = () => {
    const page = parseInt(inputPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage("");
    } else {
      toast.error(`Enter valid page number between 1 and ${totalPages}`);
    }
  };

  useEffect(() => {
    if (user) fetchSellerProduct();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">Manage Product Stock</h2>
        <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed w-full">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-2/3 md:w-2/5 px-4 py-3 truncate">Product</th>
                <th className="px-4 py-3 max-sm:hidden">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3" colSpan={2}>
                  Stock & Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {currentProducts.map((product) =>
                !product?._id ? null : (
                  <tr key={product._id} className="border-t border-gray-500/20">
                    <td className="px-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.image[0]}
                          alt={product.name}
                          width={64}
                          height={64}
                        />
                      </div>
                      <span className="truncate w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                    <td className="px-4 py-3">${product.offerPrice}</td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex flex-col gap-1 min-w-[280px]">
                        <span
                          className={`text-sm font-medium ${
                            product.forceOutOfStock || product.stock === 0
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {product.forceOutOfStock
                            ? "Out of Stock"
                            : `Current Stock: ${product.stock}`}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="number"
                            placeholder="New stock"
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                            value={stockInputs[product._id] || ""}
                            onChange={(e) =>
                              setStockInputs({
                                ...stockInputs,
                                [product._id]: e.target.value,
                              })
                            }
                          />
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                            onClick={() =>
                              updateStock(product._id, stockInputs[product._id])
                            }
                          >
                            Update
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
                            onClick={() => deleteProduct(product._id)}
                          >
                            Delete
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded text-sm ${
                              product.forceOutOfStock
                                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                                : "bg-gray-500 hover:bg-gray-600 text-white"
                            }`}
                            onClick={() => toggleStockVisibility(product._id)}
                          >
                            {product.forceOutOfStock ? "Show Stock" : "Hide Stock"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerProductStockManager;
