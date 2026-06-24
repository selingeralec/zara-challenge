import React from "react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cartCount, cartItems } = useCart();
  const cartTotal = cartItems.reduce((acc, cv) => acc + cv.price, 0);

  return (
    <div className="cart-page">
      <h2>Cart({cartCount})</h2>

      <div className="cart-page__items">
        <ul>
          {cartItems.map((item) => (
            <CartItem cartItem={item} key={item.cartItemId} />
          ))}
        </ul>
      </div>

      <div className="cart-summary">
        <Link
          to="/"
          className="cart-summary__continue"
          aria-label="Go to home page"
        >
          Continue shopping
        </Link>

        {cartCount > 0 && (
          <div className="cart-summary__checkout">
            <p className="cart-summary__total">
              Total{" "}
              <span className="cart-summary__total-amount">
                {cartTotal % 1 === 0
                  ? `${cartTotal} EUR`
                  : `${cartTotal.toFixed(2)} EUR`}{" "}
              </span>
            </p>
            <button type="button" className="cart-summary__pay">
              Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
