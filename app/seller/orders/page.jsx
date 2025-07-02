"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, getToken, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setOrders(data.orders.sort((a, b) => b.date - a.date));

        setLoading(false);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <h2 className="text-lg font-medium">Orders</h2>
          <div className="max-w-4xl rounded-md">
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
                >
                  {/* Product Info */}
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      width={64}
                      height={64}
                      className="object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium">
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

                  {/* Address Info */}
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

                  {/* Amount */}
                  <p className="font-medium my-auto">
                    {currency}
                    {order.amount}
                  </p>

                  {/* Method, Date, Payment */}
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
              ))
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;
