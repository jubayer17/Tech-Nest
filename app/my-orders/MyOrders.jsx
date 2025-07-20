"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination States Added
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const ordersPerPage = 10;
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setOrders(
          data.orders.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        // latest first
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // ✅ Handle manual page jump
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
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>

          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">No orders found.</p>
          ) : (
            <>
              <div className="max-w-5xl border-t border-gray-300 text-sm">
                {currentOrders.map((order) => (
                  <div
                    key={order._id || order.date}
                    className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                  >
                    <div className="flex-1 flex gap-5 max-w-80">
                      <Image
                        src={assets.box_icon}
                        alt="box_icon"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                      <p className="flex flex-col gap-3">
                        <span className="font-medium text-base">
                          {order.items
                            ?.map(
                              (item) =>
                                `${item.product?.name || "Unknown"} x ${
                                  item.quantity
                                }`
                            )
                            .join(", ") || "No items"}
                        </span>
                        <span>Items: {order.items?.length || 0}</span>
                      </p>
                    </div>

                    <div>
                      <p>
                        <span className="font-medium">
                          {order.address?.fullName || "N/A"}
                        </span>
                        <br />
                        <span>{order.address?.area || ""}</span>
                        <br />
                        <span>
                          {order.address?.city || ""},{" "}
                          {order.address?.state || ""}
                        </span>
                        <br />
                        <span>{order.address?.phoneNumber || ""}</span>
                      </p>
                    </div>

                    <p className="font-medium my-auto">
                      {currency}
                      {order.amount}
                    </p>

                    <div className="min-w-[180px]">
                      <p className="flex flex-col gap-1 text-sm">
                        <span className="flex">
                          <span className="w-20 font-medium">Method:</span>
                          <span>
                            {order.paymentType === "Stripe" ? "Stripe" : "COD"}
                          </span>
                        </span>
                        <span className="flex">
                          <span className="w-20 font-medium">Date:</span>
                          <span>
                            {order.date
                              ? new Date(order.date).toLocaleDateString("en-GB")
                              : "N/A"}
                          </span>
                        </span>
                        <span className="flex">
                          <span className="w-20 font-medium">Payment:</span>
                          <span>
                            {order.paymentType === "Stripe"
                              ? "Completed"
                              : "Pending"}
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Pagination Section Start */}
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
                          <span
                            key="dots"
                            className="px-3 py-1.5 text-gray-500"
                          >
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
              {/* ✅ Pagination Section End */}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
