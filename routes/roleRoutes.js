import Router from "express";
const roleRouter = Router();


//Global Middlewares

import { isAdmin, isSuperAdmin, isSeller } from "../middleware/rolemiddleware.js";
import authenticate from "../middleware/authenticationmiddleware.js";
import { checkBanStatus, blockIncompleteProfiles } from "../middleware/accountVerificationMiddleware.js";

//Authorization Controllers:

// (1) SELLER ROUTES
import {
  getMyProduct,
  createProduct,
  updateMyProduct,
  deleteMyProduct,
  uploadProductImages, 
  deleteProductImage
  } from "../controllers/productController.js";
  import { updateSellerProfile } from "../controllers/userController.js";
import upload from "../middleware/uploadmiddleware.js";

roleRouter
  .get("/seller/Myproduct", authenticate, checkBanStatus, isSeller, getMyProduct)
  .post("/seller/newProduct", authenticate, checkBanStatus, blockIncompleteProfiles, isSeller, createProduct)
  .put("/seller/updateProduct/:id", authenticate, checkBanStatus, blockIncompleteProfiles, isSeller, updateMyProduct)
  .put("/seller/updateMyProfile/:id", authenticate, checkBanStatus,  isSeller, updateSellerProfile)
  .delete("/seller/deleteMyProduct/:id", authenticate, checkBanStatus, blockIncompleteProfiles, isSeller, deleteMyProduct) 
  .post("/uploadImages/:id", upload.array("images", 5), checkBanStatus, blockIncompleteProfiles, isSeller, uploadProductImages)
  .delete("/deleteProductImg/:id", checkBanStatus, blockIncompleteProfiles, isSeller, deleteProductImage);



// ADMIN / SUPERADMIN ROUTES


import { 
  getAllUsers,
  updateBanStatus, 
  updateUserRole,
  handleSellerRequest,
  deleteUserAndData,
  updateProduct, 
  deleteProduct, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder
 } from "../controllers/AdminController.js";
 

//ADMIN ROUTES
roleRouter
.get("/admin/getAllUsers", authenticate, checkBanStatus, isAdmin, getAllUsers)
.get("/admin/getAllOrders", authenticate, checkBanStatus, isAdmin, getAllOrders)
.get("/admin/getOrderById/:orderid", authenticate, checkBanStatus, isAdmin, getOrderById )
.put("/admin/updateOrder/:orderid", authenticate, checkBanStatus, isAdmin, updateOrderStatus)
.delete("/admin/deleteOrder/:orderid", authenticate, checkBanStatus, isAdmin, deleteOrder)
.put("/admin/updateProduct/:id", authenticate, checkBanStatus, isAdmin, updateProduct)
.delete("/admin/deleteProduct/:productid", authenticate, checkBanStatus, isAdmin, deleteProduct)
.put("/admin/updateBanStat/:userid", authenticate, checkBanStatus, isAdmin, updateBanStatus)


//SUPERADMIN ROUTES
 .put("/superAdmin/updateUserRole/:userid", authenticate, isSuperAdmin, updateUserRole)
 .delete("/superAdmin/deleteUser/:userid", authenticate, isSuperAdmin, deleteUserAndData)
 .put("/superAdmin/handleSellerReq/:userid", authenticate, isSuperAdmin, handleSellerRequest);

export default roleRouter;
 