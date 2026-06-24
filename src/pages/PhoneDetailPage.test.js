import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import PhoneDetailPage from "./PhoneDetailPage";
import { CartProvider } from "../context/CartContext";
import { getPhoneById } from "../api/phonesApi";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/phonesApi", () => ({
  getPhoneById: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockAddToCart = jest.fn();
jest.mock("../context/CartContext", () => {
  const actual = jest.requireActual("../context/CartContext");
  return {
    ...actual,
    useCart: () => ({
      addToCart: mockAddToCart,
      cartItems: [],
      removeFromCart: jest.fn(),
      cartCount: 0,
    }),
  };
});

const mockPhone = {
  id: "123",
  name: "iPhone 16",
  brand: "Apple",
  basePrice: 999,
  description: "The latest iPhone with advanced features.",
  colorOptions: [
    { name: "Black", hexCode: "#000000", imageUrl: "/iphone-black.jpg" },
    { name: "White", hexCode: "#FFFFFF", imageUrl: "/iphone-white.jpg" },
  ],
  storageOptions: [
    { capacity: "128GB", price: 999 },
    { capacity: "256GB", price: 1099 },
  ],
  specs: {
    screen: "6.1 inches",
    resolution: "2556 x 1179",
    processor: "A18 Pro",
    mainCamera: "48MP",
    selfieCamera: "12MP",
    battery: "3274 mAh",
    os: "iOS 18",
    screenRefreshRate: "120Hz",
  },
  similarProducts: [
    {
      id: "456",
      name: "Galaxy S24 Ultra",
      brand: "Samsung",
      basePrice: 1329,
      imageUrl: "/galaxy24.jpg",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderWithProviders = (ui, { initialEntries = ["/phone/123"] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CartProvider>
        <Routes>
          <Route path="/phone/:id" element={ui} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
};

// Wait for the page to finish loading
const waitForPhone = () => screen.findByRole("heading", { name: /iPhone 16/i });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PhoneDetailPage", () => {
  beforeEach(() => {
    getPhoneById.mockResolvedValue(mockPhone);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Loading & error states ─────────────────────────────────────────────────

  describe("loading and error states", () => {
    it("shows a loading indicator while fetching", () => {
      // Never resolve so the loading state persists
      getPhoneById.mockReturnValue(new Promise(() => {}));
      renderWithProviders(<PhoneDetailPage />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("renders an error message when the API call fails", async () => {
      getPhoneById.mockRejectedValue(new Error("Failed to fetch"));
      renderWithProviders(<PhoneDetailPage />);
      expect(
        await screen.findByText(/Error: Failed to fetch/i),
      ).toBeInTheDocument();
    });

    it("calls getPhoneById with the id from the URL", async () => {
      renderWithProviders(<PhoneDetailPage />, {
        initialEntries: ["/phone/123"],
      });
      await waitForPhone();
      expect(getPhoneById).toHaveBeenCalledWith("123");
    });
  });

  // ── Header / main info ─────────────────────────────────────────────────────

  describe("phone info header", () => {
    it("renders the phone name, brand, and base price in the info panel", async () => {
      renderWithProviders(<PhoneDetailPage />);
      const heading = await waitForPhone();
      const infoSection = heading.closest(".phone-detail__info");

      expect(
        within(infoSection).getByText(/From 999 EUR/i),
      ).toBeInTheDocument();
    });

    it("renders the back link pointing to the home page", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(screen.getByText(/back/i)).toHaveAttribute("href", "/");
    });
  });

  // ── Phone image ────────────────────────────────────────────────────────────

  describe("phone image", () => {
    it("renders the image for the default (first) colour", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      const img = screen.getByAltText(/iPhone 16 in Black/i);
      expect(img).toHaveAttribute("src", "/iphone-black.jpg");
    });

    it("updates the image src when a different colour is selected", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByLabelText("White"));
      expect(screen.getByAltText(/iPhone 16 in White/i)).toHaveAttribute(
        "src",
        "/iphone-white.jpg",
      );
    });

    it("shows the previous image during the colour-transition animation", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      // Switch away from default colour — previous image should appear
      fireEvent.click(screen.getByLabelText("White"));
      expect(screen.getByAltText(/iPhone 16 previous color/i)).toHaveAttribute(
        "src",
        "/iphone-black.jpg",
      );
    });

    it("removes the previous image after the animation ends", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByLabelText("White"));
      const topImg = screen.getByAltText(/iPhone 16 in White/i);
      fireEvent.animationEnd(topImg);
      expect(
        screen.queryByAltText(/iPhone 16 previous color/i),
      ).not.toBeInTheDocument();
    });
  });

  // ── Colour selection ───────────────────────────────────────────────────────

  describe("colour selection", () => {
    it("renders a button for every colour option", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(screen.getByLabelText("Black")).toBeInTheDocument();
      expect(screen.getByLabelText("White")).toBeInTheDocument();
    });

    it("marks the first colour as selected by default", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(screen.getByLabelText("Black")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText("White")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("updates aria-pressed when a different colour is chosen", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByLabelText("White"));
      expect(screen.getByLabelText("White")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText("Black")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("displays the selected colour name below the swatches", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByLabelText("White"));
      expect(
        screen.getByText("White", { selector: ".phone-detail__color-name" }),
      ).toBeInTheDocument();
    });
  });

  // ── Storage selection ──────────────────────────────────────────────────────

  describe("storage selection", () => {
    it("renders a button for every storage option", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(screen.getByText("128GB")).toBeInTheDocument();
      expect(screen.getByText("256GB")).toBeInTheDocument();
    });

    it("shows the base price when no storage is selected", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(screen.getByText(/From 999 EUR/i)).toBeInTheDocument();
    });

    it("updates the displayed price when a storage option is selected", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByText("256GB"));
      expect(screen.getByText("1099 EUR")).toBeInTheDocument();
    });

    it("switches price correctly when changing between storage options", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByText("256GB"));
      fireEvent.click(screen.getByText("128GB"));
      expect(screen.getByText("999 EUR")).toBeInTheDocument();
    });

    it("marks the selected storage option with aria-pressed=true", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByText("128GB"));
      expect(screen.getByText("128GB")).toHaveAttribute("aria-pressed", "true");
    });
  });

  // ── Add to cart button ─────────────────────────────────────────────────────

  describe("add to cart button", () => {
    it("is disabled when no storage has been selected", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      // Colour is pre-selected, but storage is not
      expect(screen.getByText("Añadir")).toBeDisabled();
    });

    it("becomes enabled once a storage option is selected", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByText("128GB"));
      expect(screen.getByText("Añadir")).not.toBeDisabled();
    });

    it("calls addToCart with the correct payload when clicked", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByLabelText("White"));
      fireEvent.click(screen.getByText("256GB"));
      fireEvent.click(screen.getByText("Añadir"));

      expect(mockAddToCart).toHaveBeenCalledTimes(1);
      expect(mockAddToCart).toHaveBeenCalledWith({
        cartItemId: "123-White-256GB",
        phoneId: "123",
        name: "iPhone 16",
        brand: "Apple",
        image: "/iphone-white.jpg",
        color: "White",
        storage: "256GB",
        price: 1099,
      });
    });

    it("does not call addToCart when the button is disabled", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      fireEvent.click(screen.getByText("Añadir"));
      expect(mockAddToCart).not.toHaveBeenCalled();
    });
  });

  // ── Specifications ─────────────────────────────────────────────────────────

  it("renders all spec rows with the correct values", async () => {
    renderWithProviders(<PhoneDetailPage />);
    await waitForPhone();

    const specsList = document.querySelector(".phone-detail__specs");

    const specs = [
      ["Brand", "Apple"],
      ["Name", "iPhone 16"],
      ["Description", "The latest iPhone with advanced features."],
      ["Screen", "6.1 inches"],
      ["Resolution", "2556 x 1179"],
      ["Processor", "A18 Pro"],
      ["Main camera", "48MP"],
      ["Selfie camera", "12MP"],
      ["Battery", "3274 mAh"],
      ["OS", "iOS 18"],
      ["Screen refresh rate", "120Hz"],
    ];

    for (const [label, value] of specs) {
      expect(within(specsList).getByText(label)).toBeInTheDocument();
      expect(within(specsList).getByText(value)).toBeInTheDocument();
    }
  });

  // ── Similar products ───────────────────────────────────────────────────────

  describe("similar products", () => {
    it("renders similar product cards", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();

      const similarRegion = screen.getByRole("region", {
        name: /similar items/i,
      });
      expect(
        within(similarRegion).getByText("Galaxy S24 Ultra"),
      ).toBeInTheDocument();
    });

    it("renders the Similar Items section heading", async () => {
      renderWithProviders(<PhoneDetailPage />);
      await waitForPhone();
      expect(
        screen.getByRole("heading", { name: /similar items/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Route params ───────────────────────────────────────────────────────────

  describe("routing", () => {
    it("re-fetches phone data when the route id changes", async () => {
      let navigate;

      const NavCapture = () => {
        navigate = useNavigate();
        return null;
      };

      render(
        <MemoryRouter initialEntries={["/phone/123"]}>
          <CartProvider>
            <NavCapture />
            <Routes>
              <Route path="/phone/:id" element={<PhoneDetailPage />} />
            </Routes>
          </CartProvider>
        </MemoryRouter>,
      );

      await waitForPhone();
      expect(getPhoneById).toHaveBeenCalledWith("123");

      getPhoneById.mockResolvedValue({
        ...mockPhone,
        id: "456",
        name: "Galaxy S24 Ultra",
      });

      act(() => navigate("/phone/456"));

      await screen.findByRole("heading", {
        name: /Galaxy S24 Ultra/i,
        level: 1,
      });
      expect(getPhoneById).toHaveBeenCalledWith("456");
    });
  });
});
