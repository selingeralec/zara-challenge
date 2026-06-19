const BASE_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const headers = {
  "x-api-key": API_KEY,
};

export const getPhones = async (search = "") => {
  const url = search
    ? `${BASE_URL}/products?search=${search}`
    : `${BASE_URL}/products`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch phones");
  return response.json();
};

export const getPhoneById = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, { headers });
  if (!response.ok) throw new Error("Failed to fetch phone");
  return response.json();
};
