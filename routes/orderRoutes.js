import Router from "express";
const orderRouter = Router();
import {
    createOrder,
    getMyOrders,
    cancelMyOrder
} from "../controllers/orderController.js";
import authenticate from "../middleware/authenticationmiddleware.js";

orderRouter
    .post("/createOrder", authenticate, createOrder)
    .get("/myOrders", authenticate, getMyOrders)
    .put("/cancelMyOrder/:orderid", authenticate, cancelMyOrder);

export default orderRouter;
