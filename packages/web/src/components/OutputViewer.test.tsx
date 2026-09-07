import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { OutputViewer } from "./OutputViewer";

describe("OutputViewer", () => {
  it("renders an empty state when there is no data", () => {
    render(<OutputViewer data={undefined} />);
    expect(screen.getByText("No output data yet")).toBeInTheDocument();
  });

  it("renders token usage and action buttons when data is present", () => {
    render(
      <OutputViewer
        data={{ company: "Acme Corp", amount: 1250 }}
        usage={{ inputTokens: 100, outputTokens: 50 }}
      />,
    );
    expect(screen.getByText(/Input:/)).toBeInTheDocument();
    expect(screen.getByText(/Output:/)).toBeInTheDocument();
    expect(screen.getByText(/100 tokens/)).toBeInTheDocument();
    expect(screen.getByText(/50 tokens/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Form View" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "JSON" })).toBeInTheDocument();
  });

  it("renders the data as JSON in the JSON view", async () => {
    render(
      <OutputViewer
        data={{ company: "Acme Corp", amount: 1250 }}
        usage={{ inputTokens: 100, outputTokens: 50 }}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "JSON" }));

    expect(screen.getByText("company")).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
  });

  it("copies the JSON to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // jsdom lacks navigator.clipboard
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<OutputViewer data={{ company: "Acme Corp" }} usage={{ inputTokens: 1, outputTokens: 1 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith('{\n  "company": "Acme Corp"\n}');
  });
});
