"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderReceipt = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Receipt #${order._id}`,
          text: `Order summary for order #${order._id}, total paid $${order.amount}`,
          url: window.location.href,
        });
      } catch {
        alert("Sharing cancelled or not supported");
      }
    } else {
      alert("Sharing not supported on this browser");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Order Receipt", 14, 22);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 32);
    doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 14, 40);
    doc.text(`Status: ${order.status}`, 14, 48);
    doc.text(`Payment Type: ${order.paymentType}`, 14, 56);
    doc.text(`Paid: ${order.isPaid ? "Yes" : "No"}`, 14, 64);

    doc.text("Customer Details:", 14, 75);
    doc.text(`Name: ${order.address.fullName}`, 14, 83);
    doc.text(`Phone: ${order.address.phoneNumber}`, 14, 91);
    doc.text(
      `Address: ${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
      14,
      99,
      { maxWidth: 180 }
    );
    doc.text(`Email: ${order.address.email}`, 14, 107);

    const tableColumn = ["Product", "Quantity", "Price"];
    const tableRows = [];

    order.items.forEach(({ product, quantity }) => {
      const price = product.offerPrice || product.price;
      tableRows.push([product.name, quantity.toString(), `$${price}`]);
    });

    autoTable(doc, {
      startY: 115,
      head: [tableColumn],
      body: tableRows,
    });

    doc.text(`Total Paid: $${order.amount}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save(`OrderReceipt_${order._id}.pdf`);
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt, #receipt * {
              visibility: visible;
            }
            #receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              padding: 20px;
            }
          }
        `}
      </style>

      <div
        id="receipt"
        ref={receiptRef}
        className="max-w-3xl mx-auto p-6 bg-white shadow rounded"
      >
        <h1 className="text-3xl font-bold mb-4">Order Receipt</h1>
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.date).toLocaleString()}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment Type:</strong> {order.paymentType}
        </p>
        <p>
          <strong>Paid:</strong> {order.isPaid ? "Yes" : "No"}
        </p>

        <h2 className="mt-6 text-xl font-semibold">Customer Details</h2>
        <p>
          <strong>Name:</strong> {order.address.fullName}
        </p>
        <p>
          <strong>Phone:</strong> {order.address.phoneNumber}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {`${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`}
        </p>
        <p>
          <strong>Email:</strong> {order.address.email}
        </p>

        <h2 className="mt-6 text-xl font-semibold">Ordered Products</h2>
        <ul className="divide-y divide-gray-300">
          {order.items.map(({ product, quantity }) => {
            const price = product.offerPrice || product.price;
            return (
              <li
                key={product._id}
                className="py-2 flex items-center space-x-4"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p>
                    Quantity: {quantity} × ${price.toFixed(2)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 font-bold text-lg">Total Paid: ${order.amount}</p>

        <div className="mt-8 space-x-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Print
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderReceipt;
