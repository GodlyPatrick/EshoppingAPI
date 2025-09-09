// index.js (Main entry point of the application)
import express from "express";

// Routers
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import roleRouter from "./routes/roleRoutes.js";
import paymentRouter from "./routes/PaymentRoutes.js";

import connectDB from "./dbConnect/mongoDbConfig.js";

// Middleware
import cookieparser from "cookie-parser";
import morgan from "morgan";

// connection to environment variables
import dotenv from "dotenv";
dotenv.config();

// Database connection
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(morgan("dev"));

// Serve static files for uploaded content
app.use("/uploads", express.static("uploads"));

// Use Routers
app.use("/api/", userRouter);
app.use("/api/", authRouter);
app.use("/api/", productRouter);
app.use("/api/", cartRouter);
app.use("/api/", orderRouter);
app.use("/api/", roleRouter);
app.use("/api/", paymentRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
