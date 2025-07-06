import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return v < this.price;
        },
        message: "Offer price must be less than the actual price",
      },
    },
    image: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Earphone",
        "Headphone",
        "Watch",
        "Smartphone",
        "Laptop",
        "Camera",
        "Mouse",
        "Tablet",
        "Keyboard",
        "Monitor",
        "Processor",
        "Accessories",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    forceOutOfStock: {
      type: Boolean,
      default: false,
    },
    reservedStock: {
      type: Number,
      default: null, // null means no stock is reserved (visible stock)
    },
    specs: {
      type: Map,
      of: {
        type: Map,
        of: String,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
