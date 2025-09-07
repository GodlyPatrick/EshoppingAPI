import mongoose from "mongoose";
mongoose.Schema.Types.String.set("trim", true); // Trims all strings globally in cartSchema
const cartItems = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  totalItemPrice: { type: Number, required: true },
});
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [cartItems],
  totalCartPrice: { type: Number, required: true, default: 0 },
});
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
