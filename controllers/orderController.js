import Order from "../models/orderSchema.js";
import Cart from "../models/cartSchema.js";


// Create Order from Cart
export const createOrder = async (req, res) => {
  const user = req.user; // user must be logged in
  const { street, city, country, paymentMethod } = req.body;
  if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" });
  }
  if (!street || !city || !country) {
    return res
      .status(403)
      .json({ message: "pls provide all the required information" });
  }

  try {
    // check if user has a cart
    const cart = await Cart.findOne({ userId: user._id });
    console.log(cart);
    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        message: "Your cart is empty, add products before checkout! ⚠",
      });
    } else {
      // get cart items and convert to order items
      const item = cart.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        totalItemPrice: p.totalItemPrice,
      }));
      const orderTotal = item.reduce((sum, i) => sum + i.totalItemPrice, 0);
      // create the order using the order items
      const order = new Order({
        userId: user._id,
        items: item,
        totalOrderAmount: orderTotal,
        shippingAddress: { street, city, country },
        paymentMethod: paymentMethod || "cod",
        paymentStatus: "pending",
        orderStatus: "pending",
      });
      // clear the cart and save the order
      cart.products = [];
      cart.totalCartPrice = 0;
      await cart.save();
      await order.save();
      res
        .status(201)
        .json({ message: "Order created successfully! ✅", order });
    }
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" });
  }
  try {
    const myOrders = await Order.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (!myOrders || myOrders.length === 0) {
      return res.status(404).json({ message: "You have no orders yet! ⚠" });
    }
    res.status(200).json({ orders: myOrders });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const cancelMyOrder = async (req, res) => {
  const user = req.user;
  const { orderid } = req.params;
  try {
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).json({ message: "Order not found! ⚠" });
    }
    const loggedInUser = user._id.toString() === order.userId.toString();
    if (!(loggedInUser || req.user.role !=="admin" || req.user.role !=="superAdmin")) {
      return res
        .status(403)
        .json({ message: "You can only cancel your order! ⚠" });
    }
    if (order.orderStatus === "cancelled") {
      return res
        .status(400)
        .json({ message: "You've already cancelled this order! ⚠" });
    }
    if (
      order.orderStatus === "delivered" ||
      order.orderStatus === "shipped" ||
      order.paymentStatus === "paid"
    ) {
      return res
        .status(400)
        .json({ message: "sorry, you can't cancel an order at this stage! ⚠" });
    }
    order.orderStatus = "cancelled";
    order.paymentStatus = "refunded";
    order.updatedAt = Date.now();
    await order.save();
    res
      .status(200)
      .json({ message: "Order cancelled successfully! ✅", order });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};
