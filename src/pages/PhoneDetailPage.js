import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getPhoneById } from "../api/phonesApi";
import PhoneCard from "../components/PhoneCard";
import { useCart } from "../context/CartContext";

export default function PhoneDetailPage() {
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);

  const { id: phoneId } = useParams();

  useEffect(() => {
    const fetchPhoneById = async () => {
      try {
        setLoading(true);
        const data = await getPhoneById(phoneId);
        setPhone(data);
        setSelectedColor(null);
        setSelectedStorage(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneById();
  }, [phoneId]);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      cartItemId: `${phone.id}-${selectedColor.name}-${selectedStorage.capacity}`,
      phoneId: phone.id,
      name: phone.name,
      brand: phone.brand,
      image: selectedColor.imageUrl,
      color: selectedColor.name,
      storage: selectedStorage.capacity,
      price: selectedStorage.price,
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!phone) return null;

  const displayedImage = (selectedColor ?? phone.colorOptions[0]).imageUrl;
  const displayedPrice = selectedStorage
    ? selectedStorage.price
    : phone.basePrice;
  const canAddToCart = selectedColor && selectedStorage;

  return (
    <div>
      <img
        src={displayedImage}
        alt={`${phone.name} in ${(selectedColor ?? phone.colorOptions[0]).name}`}
      />

      <h1>{phone.name}</h1>
      <p>{phone.brand}</p>
      <p>${displayedPrice}</p>

      <fieldset>
        <legend>Storage ¿HOW MUCH SPACE DO YOU NEED?</legend>
        {phone.storageOptions.map((storage) => (
          <button
            key={storage.capacity}
            type="button"
            aria-pressed={selectedStorage?.capacity === storage.capacity}
            onClick={() => setSelectedStorage(storage)}
          >
            {storage.capacity}
          </button>
        ))}
      </fieldset>

      <fieldset>
        <legend>Color. Pick your favorite.</legend>
        {phone.colorOptions.map((color) => (
          <button
            key={color.name}
            type="button"
            aria-pressed={selectedColor?.name === color.name}
            aria-label={color.name}
            style={{ backgroundColor: color.hexCode }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </fieldset>

      <button type="button" disabled={!canAddToCart} onClick={handleAddToCart}>
        Add to cart
      </button>

      <section>
        <h2>Specifications</h2>
        <dl>
          <dt>Brand</dt>
          <dd>{phone.brand}</dd>
          <dt>Name</dt>
          <dd>{phone.name}</dd>
          <dt>Description</dt>
          <dd>{phone.description}</dd>
          <dt>Screen</dt>
          <dd>{phone.specs.screen}</dd>
          <dt>Resolution</dt>
          <dd>{phone.specs.resolution}</dd>
          <dt>Processor</dt>
          <dd>{phone.specs.processor}</dd>
          <dt>Main camera</dt>
          <dd>{phone.specs.mainCamera}</dd>
          <dt>Selfie camera</dt>
          <dd>{phone.specs.selfieCamera}</dd>
          <dt>Battery</dt>
          <dd>{phone.specs.battery}</dd>
          <dt>OS</dt>
          <dd>{phone.specs.os}</dd>
          <dt>Screen refresh rate</dt>
          <dd>{phone.specs.screenRefreshRate}</dd>
        </dl>
      </section>

      <section>
        <h2>Similar Items</h2>
        {phone.similarProducts.map((similarPhone) => (
          <PhoneCard key={similarPhone.id} phone={similarPhone} />
        ))}
      </section>
    </div>
  );
}
