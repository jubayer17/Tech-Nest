"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/order/all");
      setOrders(res.data.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await axios.patch(`/api/order/mark-paid/${id}`);
      toast.success("Marked as Paid");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const viewOrderDetails = async (id) => {
    try {
      const res = await axios.get(`/api/order/fetch-all-orders/${id}`);
      setSelectedOrder(res.data.order);
    } catch (err) {
      toast.error("Failed to fetch order details");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Manage Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full border text-sm md:text-base border-collapse border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().map((order) => (
                 <tr key={order._id} className="text-center border">
                  <td className="p-2 border">{order._id.slice(-6)}</td>
                  <td className="p-2 border">{order.user?.name || "N/A"}</td>
                  <td className="p-2 border">${order.amount}</td>
                  <td className="p-2 border">
                    {order.isPaid ? (
                      <span className="text-green-600">Paid</span>
                    ) : (
                      <button
                        onClick={() => markAsPaid(order._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">{order.status}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-none shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-2 right-2 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Order Details</h3>
            <p>
              <strong>Order ID:</strong> {selectedOrder._id}
            </p>
            <p>
              <strong>User:</strong> {selectedOrder.user?.name}
            </p>
            <p>
              <strong>Payment:</strong>{" "}
              {selectedOrder.isPaid ? "Paid" : "Unpaid"}
            </p>
            <p>
              <strong>Amount:</strong> ${selectedOrder.amount}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Payment Type:</strong> {selectedOrder.paymentType}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedOrder.date).toLocaleString()}
            </p>

            <div className="mt-4">
              <h4 className="font-semibold">Items:</h4>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="text-sm ml-2">
                  • {item.product?.name || "Deleted Product"} — Qty:{" "}
                  {item.quantity}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Address:</h4>
              <p className="text-sm ml-2">
                {selectedOrder.address?.fullName}, {selectedOrder.address?.area},{" "}
                {selectedOrder.address?.city}, {selectedOrder.address?.state} —{" "}
                {selectedOrder.address?.pincode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
