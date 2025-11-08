import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ---------------- MongoDB Schemas ----------------
const cartSchema = new mongoose.Schema({
  userId: String, // NEW: user-based carts
  productId: Number,
  qty: Number,
});

const orderSchema = new mongoose.Schema({
  userId: String, // NEW: user-based orders
  items: [
    {
      productId: Number,
      title: String,
      price: Number,
      image: String,
      qty: Number,
      subtotal: Number,
    },
  ],
  totalPrice: Number,
  timestamp: String,
});

const Cart = mongoose.model("Cart", cartSchema);
const Order = mongoose.model("Order", orderSchema);

// ---------------- Product Routes ----------------
app.get("/api/products", async (req, res) => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// ---------------- Cart Routes ----------------

// Get user's cart
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.find({ userId });
  res.json(cart);
});

// Add to cart
app.post("/api/cart", async (req, res) => {
  const { userId, productId, qty } = req.body;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  let existing = await Cart.findOne({ userId, productId });

  if (existing) {
    existing.qty += qty;
    await existing.save();
  } else {
    await Cart.create({ userId, productId, qty });
  }

  const updatedCart = await Cart.find({ userId });
  res.json({ message: "Item added to cart", cart: updatedCart });
});

// Update quantity
app.put("/api/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const { qty } = req.body;

  const updated = await Cart.findOneAndUpdate(
    { userId, productId },
    { qty },
    { new: true }
  );

  if (updated) res.json({ message: "Quantity updated", updated });
  else res.status(404).json({ message: "Item not found" });
});

// Remove from cart
app.delete("/api/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  await Cart.deleteOne({ userId, productId });
  const updatedCart = await Cart.find({ userId });
  res.json({ message: "Item removed", cart: updatedCart });
});

// ---------------- Checkout Route ----------------
app.post("/api/checkout/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.find({ userId });
    if (cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Fetch detailed info for all cart items
    const detailedItems = await Promise.all(
      cart.map(async (item) => {
        const prodRes = await fetch(`https://fakestoreapi.com/products/${item.productId}`);
        const product = await prodRes.json();
        return {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          qty: item.qty,
          subtotal: product.price * item.qty,
        };
      })
    );

    const totalPrice = detailedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const timestamp = new Date().toISOString();

    const newOrder = new Order({ userId, items: detailedItems, totalPrice, timestamp });
    await newOrder.save();

    await Cart.deleteMany({ userId }); // clear user's cart

    res.status(200).json({ message: "Checkout successful", order: newOrder });
  } catch (error) {
    console.error("Checkout failed:", error);
    res.status(500).json({ message: "Checkout failed" });
  }
});

// ---------------- Orders ----------------
app.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;
  const orders = await Order.find({ userId }).sort({ _id: -1 });
  res.json(orders);
});

app.get("/api/order/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// ---------------- Server Start ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
