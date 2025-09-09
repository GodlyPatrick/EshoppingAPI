import User from "../models/userSchema.js";
import Product from "../models/productSchema.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";

// ------------------------- USER MANAGEMENT -------------------------

// CASE 1: VIEW ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select("-password");
    if (!user) {
      return res.status(404).json({ message: "No users found! ⚠" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// CASE 2: VIEW A USER BY ID
export const getUserById =async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await User.findById(userid).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found! ⚠" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// CASE 3: BAN/UNBAN A USER
export const updateBanStatus = async (req, res) => {
  const { userid } = req.params;
  const { username, email, action } = req.body; // action can be either ban or unban
  if (!username || !email || !action) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields ⚠️" });
  }

  try {
    const targetUser = await User.findOne({ _id: userid, username, email });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found!⚠️" });
    }
    if (targetUser.role === "admin" || targetUser.role === "superAdmin") {
      return res
        .status(403)
        .json({ message: "you are not authorized to ban other admins " });
    }
    if (action === "ban") {
      if (targetUser.isBanned === true) {
        return res
          .status(400)
          .json({ message: "Oops! User is already banned!🚫" });
      }
      targetUser.isBanned = "true";
    } else if (action === "unban") {
      if (targetUser.isBanned === false) {
        return res.status(400).json({ message: "Oops! User is not banned!⚠️" });
      }
      targetUser.isBanned = "false";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action! Use 'ban' or 'unban' ⚠️" });
    }

    await targetUser.save();
    res.status(200).json({
      message: `${targetUser.username} has been ${action}ned successfully ✅`,
      targetUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: error.message,
    });
  }
};

// CASE 4: UPGRADE A USER TO SELLER
export const handleSellerRequest = async (req, res) => {
  const { userid } = req.params;
  const { action } = req.body; // action can be either "approve" or "reject"

  try {
    const user = await User.findById(userid).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found! ⚠️" });
    }
    if (user.sellerStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "No pending request for this user ⏳" });
    }

    if (action === "approve") {
      user.role = "seller";
      user.sellerStatus = "approved";
    } else if (action === "reject") {
      user.sellerStatus = "rejected";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject' ⚠️" });
    }

    await user.save();

    res.status(200).json({
      message: `Seller request has been ${user.sellerStatus} ✅`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Oops Something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

// CASE 5: PROMOTE/DEMOTE A USER

export const updateUserRole = async (req, res) => {
  const userid = req.params.id;
  const { username, email, action } = req.body; // action can be either "promote" or "demote"
  const { role } = req.user;
  if (role !== "superAdmin") {
    return res.status(403).json({
      message: "Sorry, you are not authorized to perform this action! 🚫",
    });
  }

  try {
    const targetUser = await User.findOne({ _id: userid, username, email });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found! ⚠️" });
    }

    // Block modifying another SuperAdming
    if (targetUser.role === "superAdmin") {
      return res
        .status(403)
        .json({ message: "Sorry, you cannot modify another SuperAdmin! 🚫" });
    }
    if (targetUser.sellerStatus === "pending") {
      return res
        .status(400)
        .json({ message: "User has a pending seller request! ⏳" });
    } 

    if (action === "promote") {
      if (targetUser.role === "admin") {
        return res
          .status(400)
          .json({ message: "Oops! User is already an admin!⚠️" });
      }
      if (targetUser.role === "seller") {
        return res
          .status(400)
          .json({ message: "Oops! You cannot promote a seller to admin!⚠️" });
      }
      if (targetUser.isBanned === true) {
        return res
          .status(400)
          .json({ message: "Oops! You cannot promote a banned user!🚫" });
      }
      targetUser.role = "admin";
    } else if (action === "demote") {
      if (targetUser.role !== "admin" || targetUser.role === "seller") {
        return res.status(400).json({
          message:
            "you cannot demote a user who has not been upgrarded to admin yet! ⚠️",
        });
      }
      if (targetUser.isBanned === true) {
        return res
          .status(400)
          .json({ message: "This user is already banned! 🚫" });
      }
      targetUser.role = "user";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action! Use 'promote' or 'demote' ⚠️" });
    }

    await targetUser.save();

    res.status(200).json({
      message: `${targetUser.username} has been ${action}d to ${targetUser.role} successfully ✅`,
      targetUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Oops! Something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

// CASE 6: DELETE A USER AND ALL THEIR ASSOCIATED DATA (PRODUCTS, CART, ORDERS)
export const deleteUserAndData = async (req, res) => {
  const { userid } = req.params;
    try {
    const targetUser = await User.findById(userid);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found!⚠️" });
    }
    if (targetUser.role === "superAdmin") {
      return res
        .status(403)
        .json({ message: "you are not authorized to delete a superAdmin!⚠️" });
    }
    // Delete all products created by the user
    await Product.deleteMany({ userId: userid });
    // Delete the user's cart
    await Cart.findOneAndDelete({ userId: userid });
    // Delete all orders placed by the user
    await Order.deleteMany({ userId: userid });
    // Finally, delete the user account
    await User.findByIdAndDelete(userid);
    res.status(200).json({
      message: `User ${targetUser.username} and all associated data have been deleted successfully ✅`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: error.message,
    });
  }
};

// ------------------------- PRODUCT MANAGEMENT -------------------------
export const updateProduct = async (req, res) => {
  const { productid } = req.params;
  const { name, price, size, color, description, stock, category } = req.body;
  try {
    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found! ⚠" });
    }
    // Update only the fields that are provided in the request body using nullish coalescing operator
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.size = size ?? product.size;
    product.color = color ?? product.color;
    product.description = description ?? product.description;
    product.stock = stock ?? product.stock;
    product.category = category ?? product.category;
    // Save the updated product
    await product.save();
    res
      .status(200)
      .json({ message: "Product updated successfully! ✅", product });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { productid } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found! ⚠" });
    }
    res.status(200).json({ message: "Product deleted successfully! ✅" });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it🛠️",
      error: error.message,
    });
  }
};

// ------------------------- ORDER MANAGEMENT -------------------------
// CASE 1: VIEW ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found! ⚠" });
    }
    res.status(200).json({ message: "Orders found ✅", orders });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  const { orderid } = req.params;
  try {
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    res.status(200).json({ message: "Order found ✅", order });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};
// CASE 2: UPDATE ORDER STATUS (e.g., PENDING, SHIPPED, DELIVERED, CANCELED)

export const updateOrderStatus = async (req, res) => {
  const { orderid } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  if (!orderStatus && !paymentStatus) {
    return res.status(400).json({ message: "Please provide status to update" });
  }

  try {
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).json({ message: "Order not found! ⚠" });
    }
    if (
      order.orderStatus === "cancelled" ||
      order.paymentStatus === "refunded"
    ) {
      return res
        .status(401)
        .json({ message: "cancelled orders cannot be reopened!" });
    }
    if (
      orderStatus !== "pending" &&
      orderStatus !== "shipped" &&
      orderStatus !== "delivered" &&
      orderStatus !== "cancelled"
    ) {
      return res.status(400).json({
        message:
          "Invalid: order status can either be 'pending', 'shipped', 'delivered', 'cancelled'",
      });
    }
    if (
      paymentStatus !== "pending" &&
      paymentStatus !== "paid" &&
      paymentStatus !== "refunded" &&
      paymentStatus !== "failed"
    ) {
      return res.status(400).json({
        message:
          "Invalid: payment status can either be 'pending','paid', 'refunded' or 'failed'",
      });
    }
    // Update only the provided fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = Date.now();
    await order.save();
    res.status(200).json({ message: "Order updated successfully! ✅", order });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

// CASE 3: DELETE AN ORDER
export const deleteOrder = async (req, res) => {
  const { orderid } = req.params;

  try {
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(404).json({ message: "Order not found! ⚠" });
    }
    await Order.findByIdAndDelete(orderid);
    res.status(200).json({ message: "Order deleted successfully! ✅" });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

// // CASE 2: UNBAN A USER
// export const unbanUser = async (req, res) => {
//   const { userid } = req.params;
//   try {
//     const targetUser = await User.findById(userid);
//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found!⚠️" });
//     }
//     targetUser.isBanned = false;
//     await targetUser.save();
//     res.status(200).json({
//       message: `${targetUser.username} has been unbanned successfully ✅`,
//       targetUser,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "oops! something broke, don't worry, we're working on it🛠️",
//       error: error.message,
//     });
//   }
// };
