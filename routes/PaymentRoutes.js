import { Router } from "express";
import { createCheckoutSession } from "../controllers/PaymentController.js";
import authenticate from "../middleware/authenticationmiddleware.js";


const paymentRouter = Router();

// ✅ Create checkout session for a user
paymentRouter
.post("/checkout", authenticate, createCheckoutSession)


// ✅ Success route (Stripe will redirect here)
.get("/success", (req, res) => {
  return res.status(200).json({
    message: "✅ Payment successful! Your order is being processed.",
  });
})

// ❌ Cancel route (if user cancels payment midway)
.get("/cancel", (req, res) => {
  return res.status(200).json({
    message: "⚠️ Payment cancelled. You can retry anytime.",
  });
})

// ❌ Failed route (in case payment fails after attempt)
.get("/failed", (req, res) => {
  return res.status(400).json({
    message: "❌ Payment failed. Please try again or use another method.",
  });
});

export default paymentRouter;
