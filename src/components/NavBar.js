import { Link, useLocation } from "react-router";
import { useCart } from "../context/CartContext";

export default function NavBar() {
  const { cartCount } = useCart();
  let location = useLocation();

  return (
    <header>
      <nav>
        <Link to="/" aria-label="Go to home page">
          Home
        </Link>
        {location.pathname !== "/cart" && (
          <Link
            to="/cart"
            aria-label={`View cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
          >
            Cart ({cartCount})
          </Link>
        )}
      </nav>
    </header>
  );
}
