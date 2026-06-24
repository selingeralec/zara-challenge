import { Link } from "react-router-dom";

export default function PhoneCard({ phone }) {
  return (
    <article className="phone-card">
      <Link className="phone-card__link" to={`/phone/${phone.id}`}>
        <img
          className="phone-card__image"
          alt={phone.name}
          src={phone.imageUrl}
        />
        <div className="phone-card__info">
          <p className="phone-card__brand">{phone.brand}</p>
          <div className="phone-card__details">
            <h2 className="phone-card__name">{phone.name}</h2>
            <p className="phone-card__price">{phone.basePrice} EUR</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
