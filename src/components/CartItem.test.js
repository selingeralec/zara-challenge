import { render, screen, fireEvent } from "@testing-library/react";
import CartItem from "./CartItem";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRemoveFromCart = jest.fn();
jest.mock("../context/CartContext", () => ({
  useCart: () => ({ removeFromCart: mockRemoveFromCart }),
}));

const mockCartItem = {
  cartItemId: "123-Black-128GB",
  phoneId: "123",
  name: "iPhone 16",
  brand: "Apple",
  image: "/iphone-black.jpg",
  color: "Black",
  storage: "128GB",
  price: 999,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderCartItem = (overrides = {}) =>
  render(<CartItem cartItem={{ ...mockCartItem, ...overrides }} />);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CartItem", () => {
  afterEach(() => jest.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the phone name", () => {
      renderCartItem();
      expect(
        screen.getByRole("heading", { name: "iPhone 16" }),
      ).toBeInTheDocument();
    });

    it("renders the image with a descriptive alt text", () => {
      renderCartItem();
      expect(screen.getByAltText("iPhone 16 in Black")).toHaveAttribute(
        "src",
        "/iphone-black.jpg",
      );
    });

    it("renders the storage and colour variant", () => {
      renderCartItem();
      expect(screen.getByText(/128GB \| Black/)).toBeInTheDocument();
    });

    it("renders the price", () => {
      renderCartItem();
      expect(screen.getByText("999 EUR")).toBeInTheDocument();
    });

    it("renders the remove button", () => {
      renderCartItem();
      expect(
        screen.getByRole("button", { name: /Eliminar/i }),
      ).toBeInTheDocument();
    });

    it("reflects different item data correctly", () => {
      renderCartItem({
        name: "Galaxy S24",
        color: "White",
        storage: "256GB",
        price: 1099,
        image: "/galaxy-white.jpg",
      });
      expect(
        screen.getByRole("heading", { name: "Galaxy S24" }),
      ).toBeInTheDocument();
      expect(screen.getByAltText("Galaxy S24 in White")).toHaveAttribute(
        "src",
        "/galaxy-white.jpg",
      );
      expect(screen.getByText(/256GB \| White/)).toBeInTheDocument();
      expect(screen.getByText("1099 EUR")).toBeInTheDocument();
    });
  });

  // ── Remove ─────────────────────────────────────────────────────────────────

  describe("remove button", () => {
    it("calls removeFromCart with the correct cartItemId when clicked", () => {
      renderCartItem();
      fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
      expect(mockRemoveFromCart).toHaveBeenCalledTimes(1);
      expect(mockRemoveFromCart).toHaveBeenCalledWith("123-Black-128GB");
    });

    it("does not call removeFromCart on render", () => {
      renderCartItem();
      expect(mockRemoveFromCart).not.toHaveBeenCalled();
    });
  });
});
