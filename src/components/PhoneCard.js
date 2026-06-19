import { Link } from "react-router";

export default function PhoneCard({ phone }) {
  return (
    <article>
      <Link to={`/phone/${phone.id}`}>
        <img alt={phone.name} src={phone.imageUrl} />
        <p>{phone.brand}</p>
        <h2>{phone.name}</h2>
        <p>${phone.basePrice}</p>
      </Link>
    </article>
  );
}
