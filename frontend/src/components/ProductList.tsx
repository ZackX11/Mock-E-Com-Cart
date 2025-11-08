import { useEffect, useState } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Temporary demo user 
  const userId = "demoUser123";

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error("❌ Error fetching products:", err));
  }, []);

  // Add item to cart
  const handleAddToCart = async (id: number) => {
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: id, qty: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to add item: " + (data.message || "Unknown error"));
        return;
      }

      alert("Item added to cart!");
      console.log("Cart response:", data);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong while adding to cart!");
    }
  };

  if (loading) return <h3>Loading products...</h3>;

  // Group products by category
  const groupedProducts = products.reduce((acc: Record<string, Product[]>, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="product-page">
      <h2 className="product-page-title">Top Deals</h2>

      {Object.keys(groupedProducts).map((category) => (
        <div key={category} className="product-group">
          <h3 className="group-title">{category.toUpperCase()}</h3>
          <div className="product-container">
            {groupedProducts[category].map((p) => (
              <div key={p.id} className="product-card">
                <img src={p.image} alt={p.title} className="product-img" />
                <h4>{p.title}</h4>
                <p className="product-price">${p.price.toFixed(2)}</p>
                <button
                  className="add-cart-btn"
                  onClick={() => handleAddToCart(p.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
