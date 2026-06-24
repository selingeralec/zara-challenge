import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPhoneById } from "../api/phonesApi";
import PhoneCard from "../components/PhoneCard";
import { useCart } from "../context/CartContext";

export default function PhoneDetailPage() {
  const { id: phoneId } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);

  const displayedImage = (selectedColor ?? phone?.colorOptions[0])?.imageUrl;

  const [previousImage, setPreviousImage] = useState(null);
  const prevImageRef = useRef(displayedImage);

  const scrollRef = useRef(null);
  const [scrollThumb, setScrollThumb] = useState({ width: 0, left: 0 });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.clientWidth / el.scrollWidth;
    const thumbWidth = el.clientWidth * ratio;
    const thumbLeft = (el.scrollLeft / el.scrollWidth) * el.clientWidth;
    setScrollThumb({ width: thumbWidth, left: thumbLeft });
  }, []);

  // initialize on mount once content is rendered
  useEffect(() => {
    handleScroll();
  }, [phone, handleScroll]);

  useEffect(() => {
    if (prevImageRef.current !== displayedImage) {
      setPreviousImage(prevImageRef.current);
      prevImageRef.current = displayedImage;
    }
  }, [displayedImage]);

  useEffect(() => {
    const fetchPhoneById = async () => {
      try {
        setLoading(true);
        const data = await getPhoneById(phoneId);
        setPhone(data);
        setSelectedColor(data?.colorOptions[0]);
        setSelectedStorage(null);
        setPreviousImage(null);
        //clear prev image ref when switching phones
        prevImageRef.current = null;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneById();
  }, [phoneId]);

  const { addToCart, cartItems } = useCart();

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

    navigate("/cart");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!phone) return null;

  const displayedPrice = selectedStorage
    ? selectedStorage.price
    : "From " + phone.basePrice;
  const canAddToCart = selectedColor && selectedStorage;

  return (
    <div className="phone-detail">
      <Link
        to="/"
        className="phone-detail__back-link"
        aria-label="Go to home page"
      >
        <span aria-hidden="true" className="phone-detail__chevron">
          ‹
        </span>
        Back
      </Link>
      <section className="phone-detail__header">
        <div className="phone-detail__media">
          <div className="phone-detail__image-stack">
            {previousImage && (
              <img
                key={previousImage}
                className="phone-detail__image phone-detail__image--base"
                src={previousImage}
                alt={`${phone.name} previous color`}
              />
            )}
            <img
              key={displayedImage}
              className="phone-detail__image phone-detail__image--top"
              src={displayedImage}
              alt={`${phone.name} in ${(selectedColor ?? phone.colorOptions[0]).name}`}
              onAnimationEnd={() => setPreviousImage(null)}
            />
          </div>
        </div>

        <div className="phone-detail__info">
          <div className="phone-detail__info-upper">
            <h1 className="phone-detail__title">{phone.name}</h1>
            <p className="phone-detail__price">{displayedPrice} EUR</p>
          </div>
          <div className="phone-detail__info-lower">
            <fieldset className="phone-detail__section">
              <legend className="phone-detail__section-label">
                Storage ¿How much space do you need?
              </legend>
              <div className="phone-detail__storage-options">
                {phone.storageOptions.map((storage) => (
                  <button
                    key={storage.capacity}
                    type="button"
                    className="phone-detail__storage-option"
                    aria-pressed={
                      selectedStorage?.capacity === storage.capacity
                    }
                    onClick={() => setSelectedStorage(storage)}
                  >
                    {storage.capacity}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="phone-detail__section">
              <legend className="phone-detail__section-label">
                Color. Pick your favorite.
              </legend>
              <div className="phone-detail__color-options">
                {phone.colorOptions.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className="phone-detail__color-option"
                    aria-pressed={selectedColor?.name === color.name}
                    aria-label={color.name}
                    style={{ backgroundColor: color.hexCode }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="phone-detail__color-name">{selectedColor.name}</p>
              )}
            </fieldset>

            <button
              type="button"
              className="phone-detail__add-button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
            >
              Añadir
            </button>
          </div>
        </div>
      </section>
      <section>
        <h2 className="phone-detail__section-heading">Specifications</h2>
        <dl className="phone-detail__specs">
          <div className="phone-detail__specs-row">
            <dt>Brand</dt>
            <dd>{phone.brand}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Name</dt>
            <dd>{phone.name}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Description</dt>
            <dd>{phone.description}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Screen</dt>
            <dd>{phone.specs.screen}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Resolution</dt>
            <dd>{phone.specs.resolution}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Processor</dt>
            <dd>{phone.specs.processor}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Main camera</dt>
            <dd>{phone.specs.mainCamera}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Selfie camera</dt>
            <dd>{phone.specs.selfieCamera}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Battery</dt>
            <dd>{phone.specs.battery}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>OS</dt>
            <dd>{phone.specs.os}</dd>
          </div>
          <div className="phone-detail__specs-row">
            <dt>Screen refresh rate</dt>
            <dd>{phone.specs.screenRefreshRate}</dd>
          </div>
        </dl>
      </section>

      <section className="phone-detail__similar-section">
        <h2 className="phone-detail__section-heading">Similar Items</h2>
        <div
          className="phone-detail__similar-scroll"
          role="region"
          aria-label="Similar items"
          tabIndex={0}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {phone.similarProducts.map((similarPhone, i) => (
            <div className="phone-card__similar-item" key={i}>
              <PhoneCard phone={similarPhone} />
            </div>
          ))}
        </div>
        <div className="phone-detail__scrollbar">
          <div
            className="phone-detail__scrollbar-thumb"
            style={{ width: scrollThumb.width, left: scrollThumb.left }}
          />
        </div>
      </section>
    </div>
  );
}
