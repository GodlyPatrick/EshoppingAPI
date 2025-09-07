import Router from "express";
const cartRouter = Router();
import {
  addToCart,
   getMyCart,
   updateCartItems,
  deleteCartItem,
  clearCart,
} from "../controllers/cartController.js";
import authenticate from "../middleware/authenticationmiddleware.js";
import { checkBanStatus } from "../middleware/accountVerificationMiddleware.js";
cartRouter
  .post("/addToCart/:productid", authenticate, checkBanStatus, addToCart)
  .get("/cartItems", authenticate, checkBanStatus,  getMyCart)
  .put("/updateCart/:productid", authenticate, checkBanStatus, updateCartItems)
  .delete("/deleteCartItem/:productid", authenticate, checkBanStatus, deleteCartItem)
  .delete("/clearCart/", authenticate, checkBanStatus, clearCart);

  export default cartRouter;
