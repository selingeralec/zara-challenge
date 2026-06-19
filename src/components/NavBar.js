import { Link } from "react-router";
import { useCart } from "../context/CartContext";

export default function NavBar() {
  const { cartCount } = useCart();

  return (
    <header>
      <nav>
        <Link to="/" aria-label="Go to home page">
          Home
        </Link>
        <Link
          to="/cart"
          aria-label={`View cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
        >
          Cart ({cartCount})
        </Link>
      </nav>
    </header>
  );
}
