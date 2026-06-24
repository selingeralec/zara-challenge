import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function NavBar() {
  const { cartCount } = useCart();
  const location = useLocation();
  const [isCartHovered, setIsCartHovered] = useState(false);

  return (
    <header className="navbar">
      <nav className="navbar__nav" role="navigation">
        <Link to="/" className="navbar__logo-link" aria-label="Go to home page">
          <img
            className="navbar__logo"
            src="/zara-challenge-logo.svg"
            alt="Company logo"
          />
        </Link>

        {location.pathname !== "/cart" && (
          <Link
            to="/cart"
            className="navbar__cart-link"
            aria-label={`View cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
            onFocus={() => setIsCartHovered(true)}
            onBlur={() => setIsCartHovered(false)}
            onClick={() => setIsCartHovered(false)}
          >
            <img
              className="navbar__cart-icon"
              src={isCartHovered ? "/cart-hovered.svg" : "/cart.svg"}
              alt=""
            />
            <span className="navbar__cart-count">{cartCount}</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
