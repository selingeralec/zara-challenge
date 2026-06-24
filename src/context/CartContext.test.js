import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Keep useLocalStorage real but mock out the actual localStorage so we get
// a clean store per test without any real browser storage side-effects.
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => {
    store[key] = value;
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CartContext", () => {
  beforeEach(() => localStorageMock.clear());

  // ── useCart guard ──────────────────────────────────────────────────────────

  describe("useCart", () => {
    it("throws when used outside a CartProvider", () => {
      // Suppress the expected console.error from React's error boundary
      jest.spyOn(console, "error").mockImplementation(() => {});
      expect(() => renderHook(() => useCart())).toThrow(
        "useCart must be used within a CartProvider",
      );
      jest.restoreAllMocks();
    });

    it("does not throw when used inside a CartProvider", () => {
      expect(() => renderHook(() => useCart(), { wrapper })).not.toThrow();
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts with an empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
    });

    it("restores cart items from localStorage on mount", () => {
      const stored = [makeItem()];
      localStorageMock.setItem("cart", JSON.stringify(stored));
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.cartItems).toEqual(stored);
      expect(result.current.cartCount).toBe(1);
    });
  });

  // ── addToCart ──────────────────────────────────────────────────────────────

  describe("addToCart", () => {
    it("adds an item to the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem()));
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].cartItemId).toBe("123-Black-128GB");
    });

    it("increments cartCount when an item is added", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem()));
      expect(result.current.cartCount).toBe(1);
    });

    it("appends items without removing existing ones", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-1" })));
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-2" })));
      expect(result.current.cartItems).toHaveLength(2);
      expect(result.current.cartItems[0].cartItemId).toBe("item-1");
      expect(result.current.cartItems[1].cartItemId).toBe("item-2");
    });

    it("persists the new item to localStorage", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const item = makeItem();
      act(() => result.current.addToCart(item));
      const stored = JSON.parse(localStorageMock.getItem("cart"));
      expect(stored).toEqual([item]);
    });
  });

  // ── removeFromCart ─────────────────────────────────────────────────────────

  describe("removeFromCart", () => {
    it("removes the item with the matching cartItemId", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-1" })));
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-2" })));
      act(() => result.current.removeFromCart("item-1"));
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].cartItemId).toBe("item-2");
    });

    it("decrements cartCount when an item is removed", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem()));
      act(() => result.current.removeFromCart("123-Black-128GB"));
      expect(result.current.cartCount).toBe(0);
    });

    it("does not affect other items when removing one", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      const item1 = makeItem({ cartItemId: "item-1" });
      const item2 = makeItem({ cartItemId: "item-2" });
      const item3 = makeItem({ cartItemId: "item-3" });
      act(() => {
        result.current.addToCart(item1);
        result.current.addToCart(item2);
        result.current.addToCart(item3);
      });
      act(() => result.current.removeFromCart("item-2"));
      expect(result.current.cartItems).toEqual([item1, item3]);
    });

    it("does nothing when the cartItemId does not exist", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem()));
      act(() => result.current.removeFromCart("non-existent-id"));
      expect(result.current.cartItems).toHaveLength(1);
    });

    it("persists the removal to localStorage", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-1" })));
      act(() => result.current.addToCart(makeItem({ cartItemId: "item-2" })));
      act(() => result.current.removeFromCart("item-1"));
      const stored = JSON.parse(localStorageMock.getItem("cart"));
      expect(stored).toHaveLength(1);
      expect(stored[0].cartItemId).toBe("item-2");
    });
  });

  // ── cartCount ──────────────────────────────────────────────────────────────

  describe("cartCount", () => {
    it("reflects the current number of items in the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.cartCount).toBe(0);
      act(() => result.current.addToCart(makeItem({ cartItemId: "a" })));
      expect(result.current.cartCount).toBe(1);
      act(() => result.current.addToCart(makeItem({ cartItemId: "b" })));
      expect(result.current.cartCount).toBe(2);
      act(() => result.current.removeFromCart("a"));
      expect(result.current.cartCount).toBe(1);
    });
  });
});
