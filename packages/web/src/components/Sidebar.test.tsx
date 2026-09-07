import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Sidebar } from "./Sidebar";
import { ApiKeyProvider } from "./auth/ApiKeyProvider";
import { initializeSecureStorage } from "@/lib/secure-storage";
import type { SchemaMode } from "./ExtractPage";

const defaults = {
  files: [] as File[],
  schemaMode: "fields" as SchemaMode,
  schemaJson: "",
  fields: "",
  model: "",
  strategy: "agent",
  chunkSize: 120000,
  parsingOptions: { images: false, screenshots: true, parser: "" },
  chunkingOptions: {
    maxImages: 5 as number | null,
    textRatio: 4,
    imageTokens: 1000,
    filterEmbedded: true,
    filterScreenshot: true,
  },
  status: "idle" as const,
  isChunkingLoading: false,
  hasKeyForModel: () => false,
  onFilesChange: vi.fn(),
  onSchemaModeChange: vi.fn(),
  onSchemaJsonChange: vi.fn(),
  onFieldsChange: vi.fn(),
  onModelChange: vi.fn(),
  onStrategyChange: vi.fn(),
  onChunkSizeChange: vi.fn(),
  onParsingOptionsChange: vi.fn(),
  onChunkingOptionsChange: vi.fn(),
};

function mockFetch() {
  const fn = vi.fn((url: RequestInfo | URL) => {
    const urlStr = String(url);
    if (urlStr === "/api/models") {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
    if (urlStr === "/api/config") {
      return Promise.resolve(
        new Response(
          JSON.stringify({ defaultModel: null, aliases: {}, availableProviders: [], useGlobalProviders: false, allProviders: [] }),
          { status: 200 },
        ),
      );
    }
    if (urlStr.startsWith("/examples/schemas/")) {
      return Promise.resolve(
        new Response(JSON.stringify({ type: "object", properties: { company: { type: "string" } } }), { status: 200 }),
      );
    }
    return Promise.reject(new Error(`Unhandled fetch: ${urlStr}`));
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

async function renderSidebar(overrides: Partial<typeof defaults> = {}) {
  // ModelSelector reads useApiKeys(), so a provider is required.
  await initializeSecureStorage("password123");
  const result = render(
    <ApiKeyProvider>
      <Sidebar {...defaults} {...overrides} />
    </ApiKeyProvider>,
  );
  // Let the ModelSelector's async fetch settle inside act() to avoid warnings.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return result;
}

describe("Sidebar", () => {
  it("renders the Files, Schema, and Settings sections", async () => {
    await renderSidebar();
    // Headings are CSS-uppercased; DOM text is title-case.
    expect(screen.getByText(/^files$/i)).toBeInTheDocument();
    expect(screen.getByText(/^schema$/i)).toBeInTheDocument();
    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
  });

  it("renders the upload zone and an Examples selector", async () => {
    await renderSidebar();
    expect(screen.getByText(/Drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Examples/ })).toBeInTheDocument();
  });

  it("reflects the number of selected files", async () => {
    await renderSidebar({
      files: [
        new File(["a"], "a.txt", { type: "text/plain" }),
        new File(["b"], "b.md", { type: "text/markdown" }),
      ],
    });
    expect(screen.getByText(/2 files selected/)).toBeInTheDocument();
  });

  it("loads an example schema and switches to JSON mode", async () => {
    mockFetch();
    const onSchemaJsonChange = vi.fn();
    const onSchemaModeChange = vi.fn();
    await renderSidebar({ onSchemaJsonChange, onSchemaModeChange });

    fireEvent.click(screen.getByRole("button", { name: /Examples/ }));
    // Popover content appears; click the Invoice example.
    const invoice = await screen.findByRole("button", { name: /Invoice/ });
    fireEvent.click(invoice);

    await waitFor(() =>
      expect(onSchemaJsonChange).toHaveBeenCalledWith(
        expect.stringContaining('"company"'),
      ),
    );
    expect(onSchemaModeChange).toHaveBeenCalledWith("json");
  });
});
