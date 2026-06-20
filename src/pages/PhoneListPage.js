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
        const data = await getPhones(searchValue);
        setPhones(searchValue ? data : data.slice(0, 20));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPhones, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="phone-list-page">
      <input
        type="text"
        placeholder="Search by name or brand..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <p>{phones.length} results found</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="phone-grid">
          {phones.map((phone) => (
            <li key={phone.id} className="phone-grid__item">
              <PhoneCard phone={phone} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
