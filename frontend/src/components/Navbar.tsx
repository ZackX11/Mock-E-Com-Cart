import "./Navbar.css";
import { Link } from "react-router-dom";
import { ShoppingCart, LogIn, Home, ReceiptText, Search } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      {/*Brand / Logo */}
      <h1 className="navbar-title">Mock E-Commerce</h1>

      {/*Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search products..." className="search-input" />
        <button className="search-btn">
          <Search size={18} /> 
        </button>
      </div>

      {/*Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/">
            <Home size={18} className="icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="/cart">
            <ShoppingCart size={18} className="icon" /> Cart
          </Link>
        </li>
        <li>
          <Link to="/checkout">
            <ReceiptText size={18} className="icon" /> Checkout
          </Link>
        </li>
        <li>
          <Link to="/login">
            <LogIn size={18} className="icon" /> Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
