import stripe from "../config/stripeConfig.js";
import Order from "../models/orderSchema.js";

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "Order ID is required" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const line_items = order.items.map(item => ({
      price_data: {
        currency: "NGN",
        product_data: { name: `Product ${item.productId}` },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));
    const YOUR_DOMAIN = process.env.CLIENT_URL || 'http://localhost:5000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Stripe session creation failed", error: error.message });
  }
};

// Stripe Webhook  
export const stripeWebhook = async (req, res) => {  
  const sig = req.headers["stripe-signature"];  
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;  

  let event;  

  try {  
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);  
    console.log("✅ Stripe Event Received:", event.type);  
  } catch (err) {  
    console.error("❌ Webhook signature verification failed:", err.message);  
    return res.status(400).send(`Webhook error: ${err.message}`);  
  }  

  // ✅ Handle successful payment  
  if (event.type === "checkout.session.completed") {  
    const session = event.data.object;  
    const { orderId } = session.metadata;  
    console.log("💳 Payment Completed for Order:", orderId);  

    try {  
      const order = await Order.findById(orderId);  
      if (order) {  
        order.paymentStatus = "paid";  
        order.orderStatus = "processing";  
        await order.save();  
        console.log("📦 Order updated to PAID & PROCESSING:", order._id);  
      }  
    } catch (error) {  
      console.error("⚠️ Error updating order after payment:", error.message);  
    }  
  }  

  // ❌ Handle failed payment  
  if (event.type === "payment_intent.payment_failed") {  
    const intent = event.data.object;  
    const { orderId } = intent.metadata;  
    console.log("❌ Payment Failed for Order:", orderId);  

    try {  
      const order = await Order.findById(orderId);  
      if (order) {  
        order.paymentStatus = "failed";  
        order.orderStatus = "pending";  
        await order.save();  
        console.log("📌 Order updated to FAILED & PENDING:", order._id);  
      }  
    } catch (error) {  
      console.error("⚠️ Error updating order after failed payment:", error.message);  
    }  
  }  

  // 🔄 Handle refunded payment  
  if (event.type === "charge.refunded") {  
    const charge = event.data.object;  
    const { orderId } = charge.metadata;  
    console.log("🔄 Refund Issued for Order:", orderId);  

    try {  
      const order = await Order.findById(orderId);  
      if (order) {  
        order.paymentStatus = "refunded";  
        order.orderStatus = "cancelled";  
        await order.save();  
        console.log("🛑 Order updated to REFUNDED & CANCELLED:", order._id);  
      }  
    } catch (error) {  
      console.error("⚠️ Error updating order after refund:", error.message);  
    }  
  }  

  res.json({ received: true });  
};