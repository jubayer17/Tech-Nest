import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

const clerk = new Clerk({
  apiKey: process.env.CLERK_SECRET_KEY, // use your Clerk secret key here
});

const authSeller = (handler) => {
  return async (req, context) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const user = await clerk.users.getUser(userId);

      if (user?.publicMetadata?.role !== "seller") {
        return NextResponse.json(
          { success: false, message: "Forbidden: Not a seller" },
          { status: 403 }
        );
      }

      return handler(req, context, { userId });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  };
};

export default authSeller;
