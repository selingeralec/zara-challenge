import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PhoneListPage from "./PhoneListPage";
import { getPhones } from "../api/phonesApi";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/phonesApi", () => ({
  getPhones: jest.fn(),
}));

jest.mock("../components/PhoneCard", () => ({
  __esModule: true,
  default: ({ phone }) => <div data-testid="phone-card">{phone.name}</div>,
}));

jest.useFakeTimers();

const makePhone = (id, name) => ({
  id: String(id),
  name,
  brand: "Apple",
  basePrice: 999,
  imageUrl: `/img/${id}.jpg`,
});

// 25 phones for testing API responses
const allPhones = Array.from({ length: 25 }, (_, i) =>
  makePhone(i + 1, `Phone ${i + 1}`),
);

const searchResults = [makePhone(1, "iPhone 16"), makePhone(2, "iPhone 15")];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <PhoneListPage />
    </MemoryRouter>,
  );

const flushDebounce = () => act(() => jest.runAllTimers());

const waitForContent = () =>
  waitFor(() =>
    expect(document.querySelector(".phone-grid--loading")).toBeNull(),
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PhoneListPage", () => {
  beforeEach(() => {
    getPhones.mockResolvedValue(allPhones);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows 12 skeleton items while fetching", () => {
      renderPage();
      expect(
        document.querySelectorAll(".phone-grid__item--skeleton"),
      ).toHaveLength(12);
    });

    it("removes skeletons once data loads", async () => {
      renderPage();
      await flushDebounce();
      await waitForContent();
      expect(
        document.querySelector(".phone-grid--loading"),
      ).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  describe("error state", () => {
    it("renders an error message when the API call fails", async () => {
      getPhones.mockRejectedValue(new Error("Network error"));
      renderPage();
      await flushDebounce();
      expect(
        await screen.findByText(/Error: Network error/i),
      ).toBeInTheDocument();
    });
  });

  // ── Unfiltered phone list ──────────────────────────────────────────────────

  describe("unfiltered list", () => {
    it("calls getPhones with default params on initial mount", async () => {
      renderPage();
      await flushDebounce();
      expect(getPhones).toHaveBeenCalledWith("", 20, 0);
    });

    it("renders phone names via PhoneCard from the API response", async () => {
      renderPage();
      await flushDebounce();
      await waitForContent();
      expect(screen.getByText("Phone 1")).toBeInTheDocument();
      expect(screen.getByText("Phone 25")).toBeInTheDocument();
    });
  });

  // ── Search input ───────────────────────────────────────────────────────────

  describe("search input", () => {
    it("renders the search input", () => {
      renderPage();
      expect(
        screen.getByPlaceholderText(/search for a smartphone/i),
      ).toBeInTheDocument();
    });

    it("does not show the clear button when the search is empty", () => {
      renderPage();
      expect(
        screen.queryByRole("button", { name: /clear search/i }),
      ).not.toBeInTheDocument();
    });

    it("shows the clear button once the user types", () => {
      renderPage();
      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "iphone" },
        },
      );
      expect(
        screen.getByRole("button", { name: /clear search/i }),
      ).toBeInTheDocument();
    });

    it("clears the input when the clear button is clicked", async () => {
      renderPage();
      const input = screen.getByPlaceholderText(/search for a smartphone/i);
      fireEvent.change(input, { target: { value: "iphone" } });
      fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
      expect(input).toHaveValue("");
    });

    it("hides the clear button after clearing", () => {
      renderPage();
      const input = screen.getByPlaceholderText(/search for a smartphone/i);
      fireEvent.change(input, { target: { value: "iphone" } });
      fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
      expect(
        screen.queryByRole("button", { name: /clear search/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Debounced search ───────────────────────────────────────────────────────

  describe("debounced search", () => {
    it("does not call getPhones immediately when the user types", () => {
      renderPage();
      getPhones.mockClear();
      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "iphone" },
        },
      );
      expect(getPhones).not.toHaveBeenCalled();
    });

    it("calls getPhones with the search value after 300ms", async () => {
      getPhones.mockResolvedValue(searchResults);
      renderPage();
      getPhones.mockClear();

      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "iphone" },
        },
      );

      await flushDebounce();
      expect(getPhones).toHaveBeenCalledWith("iphone", 20, 0);
    });

    it("only fires once for rapid successive keystrokes (debounce)", async () => {
      getPhones.mockResolvedValue(searchResults);
      renderPage();
      getPhones.mockClear();

      const input = screen.getByPlaceholderText(/search for a smartphone/i);
      fireEvent.change(input, { target: { value: "i" } });
      fireEvent.change(input, { target: { value: "ip" } });
      fireEvent.change(input, { target: { value: "iph" } });
      fireEvent.change(input, { target: { value: "ipho" } });
      fireEvent.change(input, { target: { value: "iphone" } });

      await flushDebounce();
      expect(getPhones).toHaveBeenCalledTimes(1);
      expect(getPhones).toHaveBeenCalledWith("iphone", 20, 0);
    });

    it("shows all results returned by the API for a search query", async () => {
      const manyResults = Array.from({ length: 25 }, (_, i) =>
        makePhone(i + 1, `Result ${i + 1}`),
      );
      getPhones.mockResolvedValue(manyResults);
      renderPage();

      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "result" },
        },
      );

      await flushDebounce();
      await waitForContent();
      // The API returns 25 results, so all should be rendered
      expect(screen.getAllByTestId("phone-card")).toHaveLength(25);
    });

    it("updates the results count after a search", async () => {
      getPhones.mockResolvedValue(searchResults);
      renderPage();

      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "iphone" },
        },
      );

      await flushDebounce();
      await waitForContent();
      // The API returns 2 results
      expect(screen.getByText("2 results")).toBeInTheDocument();
    });

    it("shows 0 results when the API returns an empty array", async () => {
      getPhones.mockResolvedValue([]);
      renderPage();

      fireEvent.change(
        screen.getByPlaceholderText(/search for a smartphone/i),
        {
          target: { value: "zzz" },
        },
      );

      await flushDebounce();
      await waitForContent();
      expect(screen.getByText("0 results")).toBeInTheDocument();
      expect(screen.queryByTestId("phone-card")).not.toBeInTheDocument();
    });

    it("re-fetches with empty string when search is cleared", async () => {
      getPhones.mockResolvedValue(searchResults);
      renderPage();
      getPhones.mockClear();

      const input = screen.getByPlaceholderText(/search for a smartphone/i);
      fireEvent.change(input, { target: { value: "iphone" } });
      await flushDebounce();

      getPhones.mockResolvedValue(allPhones);
      fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
      await flushDebounce();

      expect(getPhones).toHaveBeenLastCalledWith("", 20, 0);
    });
  });
});
