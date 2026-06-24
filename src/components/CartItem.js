import { useCart } from "../context/CartContext";

export default function CartItem({ cartItem }) {
  const { removeFromCart } = useCart();
  const { cartItemId, image, name, color, storage, price } = cartItem;

  const handleRemoveFromCart = () => {
    removeFromCart(cartItemId);
  };

  return (
    <div className="cart-item">
      <div className="cart-item__image-wrapper">
        <img
          className="cart-item__image"
          src={image}
          alt={`${name} in ${color}`}
        />
      </div>

      <div className="cart-item__info">
        <h2 className="cart-item__name">{name}</h2>
        <p className="cart-item__variant">
          {storage} | {color}
        </p>
        <p className="cart-item__price">{price} EUR</p>

        <button
          type="button"
          className="cart-item__remove"
          onClick={handleRemoveFromCart}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
