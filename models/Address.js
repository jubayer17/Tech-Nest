import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    age: { type: Number, required: false }, // add age field too if needed
    additionalNotes: { type: String, required: false }, // Added here
  },
  { timestamps: true }
);

const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;
