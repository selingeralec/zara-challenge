import React from "react";
import { useCart } from "../context/CartContext";

export default function CartItem({ cartItem }) {
  const { removeFromCart } = useCart();
  const { cartItemId, image, name, color, storage, price } = cartItem;
  const handleRemoveFromCart = () => {
    removeFromCart(cartItemId);
  };

  return (
    <div>
      <img src={image} alt={`${name} in ${color}`} />
      <h2>{name}</h2>
      <div>
        <p>{storage}</p>
        <p>{color}</p>
      </div>
      <p>{price} EUR</p>

      <button type="button" onClick={handleRemoveFromCart}>
        Eliminar
      </button>
    </div>
  );
}
