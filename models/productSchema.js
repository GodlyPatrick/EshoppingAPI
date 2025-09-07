import mongoose from "mongoose";

//mongoose.Schema.Types.String.set("trim", true); // Trims all strings globally in productSchema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0.0 },
    size: { type: String },
    color: { type: String },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: [{ type: String, trim: true, lowercase: true }], // an array of strings, e.g., ["electronics", "fashion"]
    images: [{ type: String }], // array to hold multiple image URLs
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
const Product = mongoose.model("Product", productSchema);
export default Product;
