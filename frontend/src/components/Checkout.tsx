import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const { receipt } = location.state || {};
  const { orderId } = useParams<{ orderId?: string }>();

  const [order, setOrder] = useState<any | null>(receipt || null);
  const [ordersList, setOrdersList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Temporary user 
  const userId = "demoUser123";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch a specific order by ID
        if (orderId) {
          const res = await fetch(`http://localhost:5000/api/order/${orderId}`);
          if (!res.ok) {
            console.error("Order not found");
            setOrder(null);
          } else {
            const data = await res.json();
            setOrder(data);
          }
          setLoading(false);
          return;
        }

        // Fetch all orders for this user
        if (!receipt) {
          const res = await fetch(`http://localhost:5000/api/orders/${userId}`);
          const data = await res.json();
          setOrdersList(data);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrdersList([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId, receipt]);

  if (loading) return <h3 style={{ textAlign: "center", marginTop: 40 }}>Loading...</h3>;

  // pecific order receipt view
  if (order) {
    return (
      <div className="checkout-page">
        <div className="checkout-box">
          <h2>Order Receipt — #{order._id?.slice(-6) || "N/A"}</h2>
          <p><strong>Order Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
          <p><strong>Total Items:</strong> {order.items?.length ?? 0}</p>
          <p><strong>Total Price:</strong> ${order.totalPrice?.toFixed(2) ?? "0.00"}</p>
          <hr />
          <h3>Items Purchased</h3>

          <ul className="receipt-items">
            {order.items?.length ? (
              order.items.map((it: any, idx: number) => (
                <li key={idx}>
                  <img
                    src={it.image || `https://fakestoreapi.com/img/placeholder.png`}
                    alt={it.title || `Product ${it.productId}`}
                  />
                  <div>
                    <p><strong>{it.title ?? `Product ${it.productId}`}</strong></p>
                    <p>Quantity: {it.qty}</p>
                    <p>Price: ${it.price?.toFixed(2) ?? "—"}</p>
                  </div>
                </li>
              ))
            ) : (
              <p>No items found in this order.</p>
            )}
          </ul>

          <div className="thank-you">
            Thank you for shopping with <strong>Mock E-Commerce</strong>!
          </div>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Link to="/">
              <button className="checkout-btn" style={{ width: 200 }}>Back to Home</button>
            </Link>
            <Link to="/checkout" style={{ marginLeft: 12 }}>
              <button className="checkout-btn small">Orders</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Orders list view
  if (ordersList && ordersList.length === 0) {
    return <h2 style={{ textAlign: "center", marginTop: 50 }}>No orders placed yet</h2>;
  }

  if (ordersList) {
    return (
      <div style={{ padding: 30 }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Your Orders</h2>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gap: 12,
          }}
        >
          {ordersList.map((o) => (
            <div
              key={o._id}
              style={{
                padding: 16,
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Order #{o._id.slice(-6)}</div>
                <div style={{ color: "#666" }}>
                  {new Date(o.timestamp).toLocaleString()}
                </div>
                <div style={{ color: "#333", marginTop: 6 }}>
                  Items: {o.items.length} — Total: ${o.totalPrice?.toFixed(2) ?? "0.00"}
                </div>
              </div>
              <div>
                <Link to={`/checkout/${o._id}`}>
                  <button className="checkout-btn">View Receipt</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default Checkout;
