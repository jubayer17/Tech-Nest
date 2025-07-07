import { addressDummyData, assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline"; // ✅ New icon
import Image from "next/image";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
  } = useAppContext();
  const [isPlaceOrderClicked, setIsPlaceOrderClicked] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // ✅ new state

  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true); // ✅ start loading

    try {
      if (!selectedAddress) {
        toast.error("Please enter a address first");
        return setIsPlacingOrder(false);
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
      if (cartItemsArray.length === 0) {
        toast.error("Cart is empty");
        return setIsPlacingOrder(false);
      }

      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push(`/order-receipt/${data.orderId}`); // ✅ Redirect to OrderReciptDetail page
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPlacingOrder(false); // ✅ stop loading
    }
  };

  const createOrderStripe = async () => {
    try {
      if (!selectedAddress) {
        toast.error("Please enter a address first");
        return setIsPlacingOrder(false);
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
      if (cartItemsArray.length === 0) {
        toast.error("Cart is empty");
        return setIsPlacingOrder(false);
      }

      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/stripe",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-gray-100 p-6 rounded-lg shadow">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-400/30 my-5" />

      <div className="space-y-6">
        {/* Address Dropdown */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative text-sm border rounded">
            <button
              className="peer w-full text-left px-4 py-2 bg-white text-gray-700 focus:outline-none rounded"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-60 overflow-y-auto rounded">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 text-center hover:bg-gray-100 cursor-pointer text-orange-600 font-medium"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Promo Code */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="w-full p-2.5 border rounded outline-none text-gray-600"
            />
            <button className="bg-orange-600 text-white px-9 py-2 rounded hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-400/30 my-5" />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {getCartAmount() + Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
        </div>
      </div>

      {/* Order Button(s) */}
      {!isPlaceOrderClicked ? (
        <button
          onClick={() => setIsPlaceOrderClicked(true)}
          className="w-full bg-orange-600 text-white py-3 rounded mt-6 hover:bg-orange-700 transition"
        >
          Place Order
        </button>
      ) : (
        <div className="flex gap-4 mt-6">
          <button
            onClick={createOrder}
            className={`w-1/2 text-white py-3 rounded flex justify-center items-center transition ${
              isPlacingOrder
                ? "bg-orange-400 opacity-70 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? "Placing..." : "Cash On Delivery"}
          </button>
          <button
            onClick={createOrderStripe}
            className="w-1/2 bg-white border border-gray-300 hover:border-gray-400 py-3 rounded flex justify-center items-center transition"
          >
            <Image
              className="w-12 h-6 object-contain"
              src={assets.stripe_logo}
              alt="Stripe"
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
