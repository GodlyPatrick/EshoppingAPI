import { Router } from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/PaymentController.js";
import authenticate from "../middleware/authenticationmiddleware.js";
import express from "express";

const router = Router();

// ✅ Create checkout session for a user
router.post("/payment/checkout", authenticate, createCheckoutSession);

// ✅ Stripe webhook endpoint (must remain raw for signature verification)
router.post("/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// ✅ Success route (Stripe will redirect here)
router.get("/payment/success", (req, res) => {
  return res.status(200).json({
    message: "✅ Payment successful! Your order is being processed.",
  });
});

// ❌ Cancel route (if user cancels payment midway)
router.get("/payment/cancel", (req, res) => {
  return res.status(200).json({
    message: "⚠️ Payment cancelled. You can retry anytime.",
  });
});

// ❌ Failed route (in case payment fails after attempt)
router.get("/payment/failed", (req, res) => {
  return res.status(400).json({
    message: "❌ Payment failed. Please try again or use another method.",
  });
});

export default router;
