import Router from "express";
const authRouter = Router();
import { loginUser, logoutUser } from "../controllers/authController.js";
import authenticate from "../middleware/authenticationmiddleware.js";


authRouter
.post("/login", loginUser)
.post("/logout", authenticate, logoutUser);
export default authRouter;