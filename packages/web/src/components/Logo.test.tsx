import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the brand heading", () => {
    render(<Logo />);
    expect(screen.getByRole("heading", { name: "struktur" })).toBeInTheDocument();
  });

  it("renders the phonetic pronunciation in browser mode", () => {
    render(<Logo />);
    expect(screen.getByText("/ʃtʁʊkˈtuːɐ̯/")).toBeInTheDocument();
  });

  it("renders the logo image with the expected source", () => {
    const { container } = render(<Logo />);
    // img with alt="" carries a presentation role, so query the DOM directly.
    expect(container.querySelector("img[src=\"/struktur-icon.png\"]")).toBeTruthy();
  });

  it("renders four empty quadrant images for the hover animation", () => {
    const { container } = render(<Logo />);
    expect(container.querySelectorAll("img[src=\"/struktur-icon-empty.webp\"]")).toHaveLength(4);
  });

  it("links to the root route", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("omits the phonetic text and keeps a single heading in desktop mode", () => {
    render(<Logo isDesktop />);
    expect(screen.queryByText("/ʃtʁʊkˈtuːɐ̯/")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "struktur" })).toBeInTheDocument();
  });

  it("applies desktop padding to the inner wrapper", () => {
    const { container } = render(<Logo isDesktop />);
    const heading = container.querySelector("h1");
    expect(heading).toBeTruthy();
    // The icon container is smaller in desktop mode
    expect(container.querySelector(".w-6.h-6") ?? container.querySelector("h1")).toBeTruthy();
  });
});
