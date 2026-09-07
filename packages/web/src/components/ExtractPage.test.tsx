import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiKeyProvider } from "./auth/ApiKeyProvider";
import { ExtractPage } from "./ExtractPage";
import { initializeSecureStorage } from "@/lib/secure-storage";

const CONFIG = {
  defaultModel: null,
  aliases: {},
  availableProviders: [],
  useGlobalProviders: false,
  allProviders: ["openai", "anthropic", "google", "opencode", "openrouter"],
};

const TEXT_ARTIFACT = {
  id: "artifact-1",
  type: "text",
  contents: [{ text: "Acme Corp invoiced John Doe $1250" }],
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function sseResponse(events: Array<Record<string, unknown>>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

function mockFetch({
  config = CONFIG,
  artifacts = TEXT_ARTIFACT,
  streamEvents,
}: {
  config?: unknown;
  artifacts?: unknown;
  streamEvents?: Array<Record<string, unknown>>;
} = {}) {
  const fn = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = String(url);
    const method = init?.method ?? "GET";

    if (urlStr === "/api/config" && method === "GET") {
      return Promise.resolve(jsonResponse(config));
    }
    if (urlStr === "/api/models" && method === "GET") {
      return Promise.resolve(jsonResponse([]));
    }
    if (urlStr === "/api/parse" && method === "POST") {
      return Promise.resolve(jsonResponse({ artifacts: [artifacts] }));
    }
    if (urlStr === "/api/extract/stream" && method === "POST") {
      return Promise.resolve(
        sseResponse(
          streamEvents ?? [
            { type: "step", data: { step: 1, total: 2, label: "Parsing files" } },
            { type: "step", data: { step: 2, total: 2, label: "Extracting data" } },
            {
              type: "complete",
              data: {
                result: {
                  data: { company: "Acme Corp" },
                  usage: { inputTokens: 10, outputTokens: 5 },
                },
                artifacts: [artifacts],
              },
            },
          ],
        ),
      );
    }
    return Promise.reject(new Error(`Unhandled fetch: ${urlStr}`));
  });

  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

async function renderPage() {
  // Unlocked secure storage so ExtractPage behaves as a returning user.
  await initializeSecureStorage("password123");
  const result = render(
    <ApiKeyProvider>
      <ExtractPage />
    </ApiKeyProvider>,
  );
  await flush();
  return result;
}

const settle = () => new Promise((r) => setTimeout(r, 0));

// Flushes pending microtasks/async setState inside act() to silence warnings.
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

// Simulates a file drop into the hidden <input type="file"> by forcing the
// read-only `files` property before dispatching a change event.
function upload(container: HTMLElement, name: string, content: string, type = "text/plain") {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  const file = new File([content], name, { type });
  Object.defineProperty(input!, "files", {
    configurable: true,
    value: [file],
  });
  fireEvent.change(input!);
}

describe("ExtractPage — initial rendering", () => {
  it("renders the header with brand and navigation", async () => {
    mockFetch();
    await renderPage();

    expect(screen.getByRole("heading", { name: "struktur" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "API Keys" })).toBeInTheDocument();
  });

  it("renders the FILES, SCHEMA, SETTINGS, OUTPUT sections", async () => {
    mockFetch();
    await renderPage();

    // Section headings are CSS-uppercased; the DOM text is title-case.
    expect(screen.getByText(/^files$/i)).toBeInTheDocument();
    expect(screen.getByText(/^schema$/i)).toBeInTheDocument();
    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
    expect(screen.getByText(/^output$/i)).toBeInTheDocument();
  });

  it("renders the schema mode selector and field definitions input", async () => {
    mockFetch();
    await renderPage();

    expect(screen.getByRole("radio", { name: "Fields shorthand" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "JSON Schema" })).not.toBeChecked();
    expect(
      screen.getByPlaceholderText("name:string, age:number, tags:array{string}"),
    ).toBeInTheDocument();
  });

  it("renders the Output tabs including the agent tab (default strategy)", async () => {
    mockFetch();
    await renderPage();

    expect(screen.getByRole("tab", { name: "Result" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Agent" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Timeline" })).toBeInTheDocument();
  });

  it("disables Parse and Extract until files are added", async () => {
    mockFetch();
    await renderPage();
    await settle(); // let config/aliases fetches resolve

    expect(screen.getByRole("button", { name: /Parse|Reparse/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Extract" })).toBeDisabled();
  });

  it("shows the Local Keys indicator when no global providers are configured", async () => {
    mockFetch();
    await renderPage();
    await settle();

    expect(screen.getByText("Local Keys")).toBeInTheDocument();
  });
});

describe("ExtractPage — parse workflow", () => {
  it("parses an uploaded file and reveals the artifacts", async () => {
    const fetchMock = mockFetch();
    const { container } = await renderPage();

    // Simulate a file drop into the upload zone.
    upload(container, "invoice.txt", "Acme Corp invoiced John Doe $1250");

    // The parse response populates the artifacts section.
    await waitFor(() => expect(screen.getByText(/^artifacts$/i)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/parse", expect.anything());
  });
});

describe("ExtractPage — extract workflow", () => {
  it("runs the full extraction and renders the result", async () => {
    const fetchMock = mockFetch();
    const { container } = await renderPage();

    upload(container, "invoice.txt", "Acme Corp invoiced John Doe $1250");
    await waitFor(() => expect(screen.getByText(/^artifacts$/i)).toBeInTheDocument());

    // Seed a schema so extraction is enabled.
    fireEvent.change(screen.getByPlaceholderText("name:string, age:number, tags:array{string}"), {
      target: { value: "company:string, name:string, total:string" },
    });

    await waitFor(() => expect(screen.getByRole("button", { name: "Extract" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Extract" }));

    // The SSE stream completes and the result surfaces in the Output panel.
    await waitFor(() => expect(screen.getByText("Acme Corp")).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/extract/stream",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("surfaces an extraction error in the output area", async () => {
    mockFetch({
      streamEvents: [
        { type: "step", data: { step: 1, total: 1, label: "Parsing files" } },
        { type: "error", data: { message: "No API key provided for openai" } },
      ],
    });
    const { container } = await renderPage();

    upload(container, "a.txt", "x");
    await waitFor(() => expect(screen.getByText(/^artifacts$/i)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("name:string, age:number, tags:array{string}"), {
      target: { value: "company:string" },
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Extract" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Extract" }));

    await waitFor(
      () => expect(screen.getByText("No API key provided for openai")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
