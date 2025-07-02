"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch product list
  const fetchProductData = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch user info & cart
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoadingUser(true);
    try {
      setIsSeller(user.publicMetadata?.role === "seller");

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        console.error("Failed to fetch user data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingUser(false);
    }
  }, [user, getToken]);

  // Add item to cart
  const addToCart = useCallback(
    async (itemId) => {
      const updated = { ...cartItems };
      updated[itemId] = (updated[itemId] || 0) + 1;
      setCartItems(updated);
      toast.success("Added to cart");

      if (user) {
        try {
          const token = await getToken();
          await axios.post(
            "/api/cart/update",
            { cartData: updated },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // no extra toast here
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
    [cartItems, user, getToken]
  );

  // Update or remove item in cart
  const updateCartQuantity = useCallback(
    async (itemId, quantity) => {
      const updated = { ...cartItems };
      if (quantity <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = quantity;
      }
      setCartItems(updated);

      if (user) {
        try {
          const token = await getToken();
          await axios.post(
            "/api/cart/update",
            { cartData: updated },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (quantity <= 0) toast.success("Item has been removed");
          else {
            toast.success("Cart updated sucessfully");
          }
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
    [cartItems, user, getToken]
  );

  const removeFromCart = useCallback(
    (itemId) => updateCartQuantity(itemId, 0),
    [updateCartQuantity]
  );

  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce(
      (total, qty) => total + (qty > 0 ? qty : 0),
      0
    );
  }, [cartItems]);

  const getCartAmount = useCallback(() => {
    let total = 0;
    if (!products?.length) return 0;

    for (const id in cartItems) {
      const item = products.find((p) => p._id === id);
      if (item && cartItems[id] > 0) {
        total += item.offerPrice * cartItems[id];
      }
    }
    return Number(total.toFixed(2));
  }, [cartItems, products]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setUserData(null);
      setCartItems({});
      setIsSeller(false);
    }
  }, [user, fetchUserData]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    loadingProducts,
    loadingUser,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
