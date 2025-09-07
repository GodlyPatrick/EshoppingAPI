import Cart from "../models/cartSchema.js";
import Product from "../models/productSchema.js";

export const addToCart = async (req, res) => {
  const { productid } = req.params;
  const user = req.user; // user must be logged in
  if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" });
  }

  try {
    // 1. Check if the product exists
    const product = await Product.findById(productid);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or out of stock! ⚠" });
    }

    // 2. Check if user has a cart
    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      // create a cart for the user
      cart = new Cart({
        userId: user._id,
        products: [
          {
            productId: product._id,
            quantity: 1,
            price: product.price,
            totalItemPrice: product.price * 1,
          },
        ],
        totalCartPrice: product.price,
      });
    } else {
      // if cart exists, check if product is already in cart
      const existingItem = cart.products.find(
        (item) => item.productId.toString() === productid,
      );

      if (existingItem) {
        existingItem.quantity += 1;

        existingItem.totalItemPrice =
          existingItem.price * existingItem.quantity;
      } else {
        // push the product to the cart
        cart.products.push({
          productId: product._id,
          quantity: 1,
          price: product.price,
          totalItemPrice: product.price * 1,
        });
      }

      // update the total cart price
      cart.totalCartPrice = cart.products.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0,
      );
    }
    //  Save the cart to the cart collection
    await cart.save();
    res.status(201).json({
      message: "Product added to cart successfully 🛒 ✅",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const getMyCart = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" });
  }
  try {
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.products.length === 0) {
      return res.status(404).json({ message: "No products in cart yet! ⚠" });
    } else {
      return res.status(200).json({ message: "Cart found ✅", cart });
    }
  } catch (error) {
    res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const updateCartItems = async (req, res) => {
  const user = req.user;
  const { productid } = req.params;
  const { action } = req.body; //type can be 'increment' or 'decrement'

  if (!user) {
    return res.status(401).json({ message: "You are not logged in ⚠" });
  }
  if (!productid || !action) {
    return res.status(400).json({
      message:
        "Please provide product ID and type of operation (increment or decrement) ⚠",
    });
  }

  try {
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ message: "Nothing in cart yet! ⚠" });
    }

    const item = cart.products.find(
      (item) => item.productId.toString() === productid,
    );

    if (!item) {
      return res
        .status(404)
        .json({ message: "Product not found in your cart ⚠" });
    }

    if (action === "increment") {
      item.quantity += 1;
    } else if (action === "decrement") {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        return res.status(400).json({
          message: "You cannot reduce below 1. Remove the item instead. ⚠",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid operation type ⚠" });
    }

    // ✅ recalc item + cart totals
    item.totalItemPrice = item.quantity * item.price;
    cart.totalCartPrice = cart.products.reduce(
      (sum, item) => sum + item.totalItemPrice,
      0,
    );

    await cart.save();

    res.status(200).json({
      message: `Cart updated successfully ✅ (${action})`,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: "something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const deleteCartItem = async (req, res) => {
  const user = req.user;
  const { productid } = req.params;
  if (!user) {
    return res.status(401).json({ message: "You are not logged in! ⚠" });
  }
  try {
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ message: "Nothing in cart yet! ⚠" });
    }
    const deleteditem = cart.products.find(
      (item) => item.productId.toString() === productid,
    );
    console.log("Product ID param:", productid);
    if (deleteditem) {
      cart.products = cart.products.filter(
        (item) => item.productId.toString() !== productid,
      );
      cart.totalCartPrice = cart.products.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0,
      );
      await cart.save();
      return res
        .status(200)
        .json({ message: "Item removed from cart ✅", cart });
    } else {
      return res
        .status(404)
        .json({ message: "Item not found in your cart! ⚠" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "You are not logged in! ⚠" });
  }
  try {
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ message: "Nothing in cart yet! ⚠" });
    }
    cart.products = [];
    cart.totalCartPrice = 0;
    await cart.save();
    return res
      .status(200)
      .json({ message: "Cart cleared successfully ✅", cart });
  } catch (error) {
    return res.status(500).json({
      message: "oops! something broke, don't worry, we're working on it 🛠️",
      error: error.message,
    });
  }
};
