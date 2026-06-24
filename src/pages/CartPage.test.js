import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseCart = jest.fn();
jest.mock("../context/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../components/CartItem", () => ({
  __esModule: true,
  default: ({ cartItem }) => (
    <li data-testid="cart-item" data-cart-item-id={cartItem.cartItemId}>
      {cartItem.name}
    </li>
  ),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const makeItem = (overrides = {}) => ({
  cartItemId: "123-Black-128GB",
  phoneId: "123",
  name: "iPhone 16",
  brand: "Apple",
  image: "/iphone-black.jpg",
  color: "Black",
  storage: "128GB",
  price: 999,
  ...overrides,
});

const emptyCart = { cartItems: [], cartCount: 0 };

const cartWithItems = {
  cartItems: [
    makeItem({ cartItemId: "123-Black-128GB", name: "iPhone 16", price: 999 }),
    makeItem({
      cartItemId: "456-White-256GB",
      name: "Galaxy S24",
      price: 1099,
    }),
  ],
  cartCount: 2,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderCartPage = () =>
  render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CartPage", () => {
  afterEach(() => jest.clearAllMocks());

  // ── Heading ────────────────────────────────────────────────────────────────

  describe("heading", () => {
    it("shows the cart count in the heading when the cart is empty", () => {
      mockUseCart.mockReturnValue(emptyCart);
      renderCartPage();
      expect(
        screen.getByRole("heading", { name: /Cart\(0\)/i }),
      ).toBeInTheDocument();
    });

    it("shows the correct cart count in the heading", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      expect(
        screen.getByRole("heading", { name: /Cart\(2\)/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Cart items ─────────────────────────────────────────────────────────────

  describe("cart items", () => {
    it("renders nothing in the list when the cart is empty", () => {
      mockUseCart.mockReturnValue(emptyCart);
      renderCartPage();
      expect(screen.queryAllByTestId("cart-item")).toHaveLength(0);
    });

    it("renders a CartItem for each item in the cart", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      expect(screen.getAllByTestId("cart-item")).toHaveLength(2);
    });

    it("passes the correct cartItem prop to each CartItem", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      const items = screen.getAllByTestId("cart-item");
      expect(items[0]).toHaveAttribute("data-cart-item-id", "123-Black-128GB");
      expect(items[1]).toHaveAttribute("data-cart-item-id", "456-White-256GB");
    });

    it("renders item names via CartItem", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      expect(screen.getByText("iPhone 16")).toBeInTheDocument();
      expect(screen.getByText("Galaxy S24")).toBeInTheDocument();
    });
  });

  // ── Summary / checkout block ───────────────────────────────────────────────

  describe("cart summary", () => {
    it("does not show the checkout block when the cart is empty", () => {
      mockUseCart.mockReturnValue(emptyCart);
      renderCartPage();
      expect(screen.queryByText(/Total/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Pay/i }),
      ).not.toBeInTheDocument();
    });

    it("shows the checkout block when the cart has items", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      expect(screen.getByText(/Total/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Pay/i })).toBeInTheDocument();
    });

    it("displays the correct total price for multiple items", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      // 999 + 1099 = 2098
      expect(screen.getByText("2098 EUR")).toBeInTheDocument();
    });

    it("displays the correct total for a single item", () => {
      mockUseCart.mockReturnValue({
        cartItems: [makeItem({ price: 999 })],
        cartCount: 1,
      });
      renderCartPage();
      expect(screen.getByText("999 EUR")).toBeInTheDocument();
    });

    it("formats the total to two decimal places", () => {
      mockUseCart.mockReturnValue({
        cartItems: [
          makeItem({ price: 999.1 }),
          makeItem({ cartItemId: "x", price: 0.2 }),
        ],
        cartCount: 2,
      });
      renderCartPage();
      expect(screen.getByText("999.30 EUR")).toBeInTheDocument();
    });
  });

  // ── Continue shopping link ─────────────────────────────────────────────────

  describe("continue shopping link", () => {
    it("renders the link pointing to the home page", () => {
      mockUseCart.mockReturnValue(emptyCart);
      renderCartPage();
      expect(screen.getByText(/Continue shopping/i)).toHaveAttribute(
        "href",
        "/",
      );
    });

    it("is always visible regardless of cart state", () => {
      mockUseCart.mockReturnValue(cartWithItems);
      renderCartPage();
      expect(screen.getByText(/Continue shopping/i)).toBeInTheDocument();
    });
  });
});
