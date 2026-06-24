const BASE_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const headers = {
  "x-api-key": API_KEY,
};

export const getPhones = async (search = "", limit, offset) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("limit", limit);
  params.append("offset", offset);
  const response = await fetch(`${BASE_URL}/products?${params.toString()}`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to fetch phones");
  const data = await response.json();
  return data;
};

export const getPhoneById = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, { headers });
  if (!response.ok) throw new Error("Failed to fetch phone");
  return response.json();
};
