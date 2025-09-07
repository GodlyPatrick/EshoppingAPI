// // middleware/authorize.js
// import User from "../models/userSchema.js";
// import Product from "../models/productSchema.js";
// import Cart from "../models/cartSchema.js";
// import Order from "../models/orderSchema.js";

// // ------------------------- USER -------------------------

// export const authorizeUserAction = async (req, res, next) => {
//   try {
//     const { role }  = req.user;
//     const loggedInUserId = req.user._id;
//     const { userid } = req.params;

//     // SuperAdmin → unrestricted access: manage anything and anyone
//     if (role === "superAdmin") {
//       next();
//     }

//     // Admin → limited access: manage users, but not other admins/superAdmins
//     if (role === "admin") {
//               const targetUser = await User.findById(userid);
//         if (!targetUser) {
//           return res.status(404).json({ message: "User not found!" });
//         }
//         if (targetUser.role === "admin" || targetUser.role === "superAdmin") {
//           return res.status(403).json({ message: "Admins cannot manage other admins or superAdmins ⚠" });
//         }
//       next();
//     }

//     // Normal user/seller → limited access: can only manage themselves
//     if (role === "user" || role === "seller") {
//       if (userid !== loggedInUserId) {
//         return res.status(403).json({ message: "You can only manage your own account ⚠" });
//       }
//       next();
//     }

//     return res.status(403).json({ message: "Unauthorized ⚠" });
//   } catch (error) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error 🚨" });
//   }
// };

// // ------------------------- PRODUCT -------------------------

// export const authorizeProductAction = async (req, res, next) => {
//   try {
//     const { role } = req.user;
//     const loggedInUserId = req.user._id
//     const { productId } = req.params;

//     if (role === "superAdmin") next();

//     if (role === "admin") next(); // admin can manage any product too

//     if (role === "seller") {
//       const product = await Product.findById(productId);
//       if (!product) return res.status(404).json({ message: "Product not found!" });

//       if (product.userId.toString() !== loggedInUserId) {
//         return res.status(403).json({ message: "You can only manage your own products ⚠" });
//       }
//       next();
//     }

//     return res.status(403).json({ message: "Unauthorized ⚠" });
//   } catch (error) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error 🚨" });
//   }
// };

// // ------------------------- CART -------------------------

// export const authorizeCartAction = async (req, res, next) => {
//   try {
//     const { role } = req.user;
//     const loggedInUserId = req.user._id;
//     const { cartId } = req.params;

//     if (role === "superAdmin") return next();
//     if (role === "admin") return next(); // admin can manage any cart

//     const cart = await Cart.findById(cartId);
//     if (!cart) return res.status(404).json({ message: "Cart not found!" });

//     if (cart.userId.toString() !== loggedInUserId) {
//       return res.status(403).json({ message: "You can only manage your own cart ⚠" });
//     }

//     return next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error 🚨" });
//   }
// };

// // ------------------------- ORDER -------------------------

// export const authorizeOrderAction = async (req, res, next) => {
//   try {
//     const { role } = req.user;
//     const loggedInUserId = req.user._id;
//     const { orderId } = req.params;

//     if (role === "superAdmin") return next();
//     if (role === "admin") return next(); // admin can manage any order

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found!" });

//     if (order.userId.toString() !== loggedInUserId) {
//       return res.status(403).json({ message: "You can only manage your own orders ⚠" });
//     }

//     return next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error 🚨" });
//   }
// };
