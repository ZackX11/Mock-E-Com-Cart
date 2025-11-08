import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary Demo Login Logic
    if (email === "demo@vibe.com" && password === "123456") {
      localStorage.setItem("userId", "demoUser123");
      alert("Login Successful!");
      navigate("/");
    } else {
      setError("Invalid email or password. Try demo@vibe.com / 123456");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome</h2>
        <p className="login-subtitle">Sign in to continue shopping at <strong>Mock E-Commerce</strong></p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>

          <p className="signup-text">
            Don’t have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
