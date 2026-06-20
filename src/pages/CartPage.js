import React from "react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { Link } from "react-router";

export default function CartPage() {
  const { cartCount, cartItems } = useCart();
  const cartTotal = cartItems.reduce((acc, cv) => acc + cv.price, 0);

  return (
    <div>
      <h2>Cart({cartCount})</h2>
      <br />
      <ul>
        {cartItems.map((item) => (
          <CartItem cartItem={item} key={item.cartItemId} />
        ))}
      </ul>

      <div>
        <Link to="/" aria-label="Go to home page">
          Continue shopping
        </Link>
        <p>Total: {cartTotal} EUR</p>
        <button type="button">Pay</button>
      </div>
    </div>
  );
}
