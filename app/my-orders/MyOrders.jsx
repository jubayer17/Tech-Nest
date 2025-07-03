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

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setOrders(data.orders.reverse());
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

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
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order) => (
                <div
                  key={order._id || order.date} // fallback key if no _id
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
