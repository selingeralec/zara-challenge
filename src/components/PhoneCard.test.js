import { render, screen } from "@testing-library/react";
import PhoneCard from "./PhoneCard";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockPhone = {
  id: "123",
  name: "iPhone 16",
  brand: "Apple",
  imageUrl: "/iphone.jpg",
  basePrice: 999,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PhoneCard", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders phone data", () => {
    render(<PhoneCard phone={mockPhone} />);

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 16")).toBeInTheDocument();
    expect(screen.getByText("999 EUR")).toBeInTheDocument();
  });

  it("renders image correctly", () => {
    render(<PhoneCard phone={mockPhone} />);

    const img = screen.getByRole("img", { name: "iPhone 16" });

    expect(img).toHaveAttribute("src", "/iphone.jpg");
  });

  it("links to correct route", () => {
    render(<PhoneCard phone={mockPhone} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/phone/123");
  });
});
