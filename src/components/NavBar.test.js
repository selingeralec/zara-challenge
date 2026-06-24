import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseCart = jest.fn();
jest.mock("../context/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderNavBar = (initialPath = "/") =>
  render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <NavBar />
    </MemoryRouter>,
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("NavBar", () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({ cartCount: 0 });
  });

  afterEach(() => jest.clearAllMocks());

  // ── Logo ───────────────────────────────────────────────────────────────────

  describe("logo", () => {
    it("renders the logo image", () => {
      renderNavBar();
      expect(screen.getByAltText("Company logo")).toBeInTheDocument();
    });

    it("logo link points to the home page", () => {
      renderNavBar();
      expect(screen.getByLabelText("Go to home page")).toHaveAttribute(
        "href",
        "/",
      );
    });
  });

  // ── Cart link ──────────────────────────────────────────────────────────────

  describe("cart link", () => {
    it("renders the cart link when not on the cart page", () => {
      renderNavBar("/");
      expect(
        screen.getByRole("link", { name: /view cart/i }),
      ).toBeInTheDocument();
    });

    it("does not render the cart link on the cart page", () => {
      renderNavBar("/cart");
      expect(
        screen.queryByRole("link", { name: /view cart/i }),
      ).not.toBeInTheDocument();
    });

    it("cart link points to /cart", () => {
      renderNavBar("/");
      expect(screen.getByRole("link", { name: /view cart/i })).toHaveAttribute(
        "href",
        "/cart",
      );
    });
  });

  // ── Cart count ─────────────────────────────────────────────────────────────

  describe("cart count", () => {
    it("displays the cart count", () => {
      mockUseCart.mockReturnValue({ cartCount: 3 });
      renderNavBar();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("uses singular aria-label when cart has 1 item", () => {
      mockUseCart.mockReturnValue({ cartCount: 1 });
      renderNavBar();
      expect(screen.getByLabelText("View cart, 1 item")).toBeInTheDocument();
    });

    it("uses plural aria-label when cart has 0 items", () => {
      mockUseCart.mockReturnValue({ cartCount: 0 });
      renderNavBar();
      expect(screen.getByLabelText("View cart, 0 items")).toBeInTheDocument();
    });

    it("uses plural aria-label when cart has multiple items", () => {
      mockUseCart.mockReturnValue({ cartCount: 5 });
      renderNavBar();
      expect(screen.getByLabelText("View cart, 5 items")).toBeInTheDocument();
    });
  });
});
