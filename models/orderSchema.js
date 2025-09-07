import mongoose from "mongoose";
//mongoose.Schema.Types.String.set("trim", true); // Trims all strings globally in orderSchema
// order item sub-schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },          // price at the time of order
  totalItemPrice: { type: Number, required: true }, // quantity * price
});

// order schema
const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    totalOrderAmount: { type: Number, required: true, default: 0 },

    shippingAddress: {
      street: { type: String, required: true },
      city:   { type: String, required: true },
      country:{ type: String, required: true },
    },

    
    paymentMethod: { 
      type: String, 
      enum: ["card", "bank", "cod"], 
      default: "cod" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed", "refunded"], 
      default: "pending" 
    },
    orderStatus: { 
      type: String, 
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;