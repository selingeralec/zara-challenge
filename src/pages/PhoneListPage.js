import { useState, useEffect } from "react";
import { getPhones } from "../api/phonesApi";
import PhoneCard from "../components/PhoneCard";

export default function PhoneListPage() {
  const [phones, setPhones] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        setLoading(true);

        const data = await getPhones(searchValue, 20, 0);

        setPhones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPhones, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="phone-list-page">
      <div className="phone-list-page__search-wrapper">
        <div className="phone-list-page__search-inner">
          <input
            className="phone-list-page__search"
            type="text"
            placeholder="Search for a smartphone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              className="phone-list-page__search-clear"
              onClick={() => setSearchValue("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <p className="phone-list-page__results-count">
          {phones.length} results
        </p>
      </div>

      <div className="phone-list-page__content">
        {loading ? (
          <ul className="phone-grid phone-grid--loading">
            {Array.from({ length: 12 }).map((_, i) => (
              <li
                key={i}
                className="phone-grid__item phone-grid__item--skeleton"
              />
            ))}
          </ul>
        ) : (
          <ul className="phone-grid">
            {phones.map((phone, index) => (
              <li key={index} className="phone-grid__item">
                <PhoneCard phone={phone} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
