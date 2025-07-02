import { Inngest } from "inngest";
import connectdb from "./db";
import User from "@/models/User";
import { use } from "react";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "quick-cart" });

// Create user
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-client" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name} ${last_name}`,
        imgUrl: image_url,
      };

      await connectdb();
      await User.create(userData);
    } catch (error) {
      console.error("User creation error:", error);
    }
  }
);

// Update user
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name} ${last_name}`,
        imgUrl: image_url,
      };

      await connectdb();
      await User.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
      console.error("User update error:", error);
    }
  }
);

// Delete user
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await connectdb();
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("User deletion error:", error);
    }
  }
);

//inngest function to create the user order's in the database
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  {
    event: "order/created",
  },
  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      };
    });
    await connectdb();
    await Order.insertMany(orders);
    return { success: true, processed: orders.length };
  }
);
