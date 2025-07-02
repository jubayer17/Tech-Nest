import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imgUrl: { type: String, required: true },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false }
);

// Model name should match the first argument in mongoose.model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
