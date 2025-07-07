"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";

const OrderReciptDetail = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/order/${orderId}`);
      if (data.success) setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) return <div className="p-6">Loading receipt...</div>;
  if (!order) return <div className="p-6 text-red-600">Order not found</div>;

  const { userId, items, amount, paymentType, isPaid, date, address } = order;

  return (
    <>
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 left-4 text-blue-600 hover:underline z-50"
      >
        ← Back To Home
      </button>
      <div className="max-w-2xl mx-auto bg-white p-8 my-10 rounded-lg shadow border text-gray-700 print:max-w-full print:shadow-none print:border-none print:p-0">
        <h2 className="text-2xl font-semibold text-center mb-6">
          🧾 Order Receipt
        </h2>
        <div className="mb-4">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(date).toLocaleString()}
          </p>
          <p>
            <strong>Payment Method:</strong> {paymentType}
          </p>
          <p>
            <strong>Payment Status:</strong> {isPaid ? "Paid" : "Unpaid"}
          </p>
        </div>

        <hr className="my-4" />

        <div className="mb-4">
          <h3 className="font-semibold mb-1">Shipping Info:</h3>
          <p>{address.fullName}</p>
          <p>
            {address.area}, {address.city}, {address.state} - {address.pincode}
          </p>
          <p>Phone: {address.phoneNumber}</p>
          <p>Email: {address.email}</p>
        </div>

        <hr className="my-4" />

        <div>
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b pb-1">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>
                  ${(item.product.offerPrice || item.product.price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-semibold">
          <p>Total Paid:</p>
          <p>${amount.toFixed(2)}</p>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded print:hidden"
        >
          🖨️ Print Receipt
        </button>
      </div>
    </>
  );
};

export default OrderReciptDetail;
