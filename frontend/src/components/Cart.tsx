import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

interface CartItem {
  productId: number;
  qty: number;
  title?: string;
  price?: number;
  image?: string;
}

function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Replace with actual logged-in user later (Firebase/Auth)
  const userId = "demoUser123";

  // Fetch user's cart from backend
  const fetchCart = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (!res.ok) {
        console.error("Failed to fetch cart");
        return;
      }

      const data = await res.json();

      // Fetch full product details for each cart item
      const detailedCart = await Promise.all(
        data.map(async (item: CartItem) => {
          const productRes = await fetch(`http://localhost:5000/api/products/${item.productId}`);
          const product = await productRes.json();
          return { ...item, ...product };
        })
      );

      setCart(detailedCart);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove item from user's cart
  const handleRemove = async (productId: number) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${userId}/${productId}`, {
        method: "DELETE",
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update item quantity
  const handleUpdateQty = async (productId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await fetch(`http://localhost:5000/api/cart/${userId}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty }),
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Checkout for this user
  const handleCheckout = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/checkout/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Checkout failed: " + (data.message || "Unknown error"));
        return;
      }

      const order = data.order;
      setCart([]); // clear frontend cart

      // Redirect to order receipt page
      navigate(`/checkout/${order._id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Check console for details.");
    }
  };

  if (loading) return <h3>Loading your cart...</h3>;

  // If cart is empty — show a friendly message and redirect option
  if (cart.length === 0)
    return (
      <div className="empty-cart">
        <img
          src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
          alt="Empty Cart"
          className="empty-cart-img"
        />
        <h2>Your cart is empty</h2>
        <p>Let's fill it with amazing products!</p>
        <button className="shop-now-btn" onClick={() => navigate("/")}>
          Shop Now
        </button>
      </div>
    );

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div className="cart-card" key={item.productId}>
            <img src={item.image} alt={item.title} className="cart-image" />
            <div className="cart-info">
              <h4>{item.title}</h4>
              <p>Price: ${item.price?.toFixed(2)}</p>

              <div className="qty-controls">
                <button onClick={() => handleUpdateQty(item.productId, item.qty - 1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => handleUpdateQty(item.productId, item.qty + 1)}>+</button>
              </div>

              <button className="remove-btn" onClick={() => handleRemove(item.productId)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
        <button className="checkout-btn" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
