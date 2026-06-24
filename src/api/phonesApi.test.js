import { getPhones, getPhoneById } from "./phonesApi";

const BASE_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFetchSuccess = (data) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

const mockFetchFailure = () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("phonesApi", () => {
  afterEach(() => jest.clearAllMocks());

  // ── getPhones ──────────────────────────────────────────────────────────────

  describe("getPhones", () => {
    it("fetches from the correct URL with no search query, limit, and offset", async () => {
      mockFetchSuccess([]);
      await getPhones("", 20, 0);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/products?limit=20&offset=0`,
        expect.objectContaining({
          headers: expect.objectContaining({ "x-api-key": API_KEY }),
        }),
      );
    });

    it("fetches from the correct URL with a search query, limit, and offset", async () => {
      mockFetchSuccess([]);
      await getPhones("iphone", 20, 0);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/products?search=iphone&limit=20&offset=0`,
        expect.objectContaining({
          headers: expect.objectContaining({ "x-api-key": API_KEY }),
        }),
      );
    });

    it("uses no search param when called with an empty string", async () => {
      mockFetchSuccess([]);
      await getPhones("", 20, 0);
      const calledUrl = fetch.mock.calls[0][0];
      expect(calledUrl).not.toContain("search=");
      expect(calledUrl).toContain("limit=20");
      expect(calledUrl).toContain("offset=0");
    });

    it("sends the API key header", async () => {
      mockFetchSuccess([]);
      await getPhones();
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ "x-api-key": API_KEY }),
        }),
      );
    });

    it("returns the parsed JSON response", async () => {
      const phones = [{ id: "1", name: "iPhone 16" }];
      mockFetchSuccess(phones);
      const result = await getPhones();
      expect(result).toEqual(phones);
    });

    it("throws an error when the response is not ok", async () => {
      mockFetchFailure();
      await expect(getPhones()).rejects.toThrow("Failed to fetch phones");
    });
  });

  // ── getPhoneById ───────────────────────────────────────────────────────────

  describe("getPhoneById", () => {
    it("fetches from the correct URL with the given id", async () => {
      mockFetchSuccess({});
      await getPhoneById("123");
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/products/123`,
        expect.objectContaining({
          headers: expect.objectContaining({ "x-api-key": API_KEY }),
        }),
      );
    });

    it("sends the API key header", async () => {
      mockFetchSuccess({});
      await getPhoneById("123");
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ "x-api-key": API_KEY }),
        }),
      );
    });

    it("returns the parsed JSON response", async () => {
      const phone = { id: "123", name: "iPhone 16" };
      mockFetchSuccess(phone);
      const result = await getPhoneById("123");
      expect(result).toEqual(phone);
    });

    it("throws an error when the response is not ok", async () => {
      mockFetchFailure();
      await expect(getPhoneById("123")).rejects.toThrow(
        "Failed to fetch phone",
      );
    });
  });
});
