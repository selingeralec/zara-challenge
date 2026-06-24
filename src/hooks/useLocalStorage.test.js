import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

// ─── Mocks ────────────────────────────────────────────────────────────────────

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useLocalStorage", () => {
  let setItemSpy;
  let getItemSpy;

  beforeEach(() => {
    localStorageMock.clear();
    setItemSpy = jest.spyOn(localStorageMock, "setItem");
    getItemSpy = jest.spyOn(localStorageMock, "getItem");
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  // ── Initialisation ─────────────────────────────────────────────────────────

  describe("initialisation", () => {
    it("returns the initial value when localStorage is empty", () => {
      const { result } = renderHook(() => useLocalStorage("key", "default"));
      expect(result.current[0]).toBe("default");
    });

    it("returns the stored value when localStorage already has a value for the key", () => {
      localStorageMock.setItem("key", JSON.stringify("stored"));
      const { result } = renderHook(() => useLocalStorage("key", "default"));
      expect(result.current[0]).toBe("stored");
    });

    it("works with non-string initial values (objects, arrays, numbers)", () => {
      const { result: obj } = renderHook(() =>
        useLocalStorage("obj", { a: 1 }),
      );
      expect(obj.current[0]).toEqual({ a: 1 });

      const { result: arr } = renderHook(() =>
        useLocalStorage("arr", [1, 2, 3]),
      );
      expect(arr.current[0]).toEqual([1, 2, 3]);

      const { result: num } = renderHook(() => useLocalStorage("num", 42));
      expect(num.current[0]).toBe(42);
    });

    it("falls back to the initial value when the stored JSON is corrupt", () => {
      getItemSpy.mockReturnValueOnce("not-valid-json{{{");
      const { result } = renderHook(() => useLocalStorage("key", "fallback"));
      expect(result.current[0]).toBe("fallback");
    });
  });

  // ── Persistence ────────────────────────────────────────────────────────────

  describe("persistence", () => {
    it("writes the initial value to localStorage on mount", () => {
      renderHook(() => useLocalStorage("key", "hello"));
      expect(setItemSpy).toHaveBeenCalledWith("key", JSON.stringify("hello"));
    });

    it("writes the updated value to localStorage when setValue is called", () => {
      const { result } = renderHook(() => useLocalStorage("key", "initial"));
      act(() => result.current[1]("updated"));
      expect(setItemSpy).toHaveBeenLastCalledWith(
        "key",
        JSON.stringify("updated"),
      );
    });

    it("serialises objects correctly when writing", () => {
      const { result } = renderHook(() => useLocalStorage("key", {}));
      act(() => result.current[1]({ name: "Claude", version: 3 }));
      expect(setItemSpy).toHaveBeenLastCalledWith(
        "key",
        JSON.stringify({ name: "Claude", version: 3 }),
      );
    });
  });

  // ── setValue behaviour ─────────────────────────────────────────────────────

  describe("setValue", () => {
    it("updates the returned value when setValue is called", () => {
      const { result } = renderHook(() => useLocalStorage("key", "initial"));
      act(() => result.current[1]("updated"));
      expect(result.current[0]).toBe("updated");
    });

    it("supports functional updates like the native useState setter", () => {
      const { result } = renderHook(() => useLocalStorage("count", 0));
      act(() => result.current[1]((prev) => prev + 1));
      expect(result.current[0]).toBe(1);
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("logs an error and does not throw when setItem fails", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setItemSpy.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });

      const { result } = renderHook(() => useLocalStorage("key", "value"));
      expect(() => {
        act(() => result.current[1]("new value"));
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save to localStorage",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
