import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProviderSettings } from "./ProviderSettings";

const noop = () => {};
const resolved = () => Promise.resolve();

async function renderSettings(overrides: Partial<Parameters<typeof ProviderSettings>[0]> = {}) {
  const result = render(
    <ProviderSettings
      isOpen
      onOpenChange={noop}
      storedProviders={[]}
      onSaveKey={vi.fn(resolved)}
      onDeleteKey={noop}
      onGetKey={vi.fn().mockResolvedValue(null)}
      onLock={noop}
      {...overrides}
    />,
  );
  // The dialog loads stored keys asynchronously on mount; settle inside act().
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return result;
}

describe("ProviderSettings", () => {
  it("renders the dialog title and all provider cards", async () => {
    await renderSettings();
    expect(screen.getByRole("heading", { name: "API Key Settings" })).toBeInTheDocument();

    for (const name of ["OpenAI", "Anthropic", "Google AI", "Opencode", "OpenRouter"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders an encrypted API key input for each provider", async () => {
    await renderSettings();
    expect(screen.getAllByLabelText("API Key")).toHaveLength(5);
    for (const id of ["openai", "anthropic", "google", "opencode", "openrouter"]) {
      const input = document.querySelector<HTMLInputElement>(`#api-key-${id}`);
      expect(input).toBeTruthy();
      // Keys come back masked by default.
      expect(input!.type).toBe("password");
    }
  });

  it("keeps the OpenAI Save button disabled until a valid key is entered", async () => {
    await renderSettings();

    const openaiInput = document.querySelector<HTMLInputElement>("#api-key-openai");
    expect(openaiInput).toBeTruthy();
    expect(openaiInput!.type).toBe("password");

    // No key yet — save disabled
    const buttons = Array.from(screen.getAllByRole("button", { name: "Save API Key" }));
    expect(buttons).toHaveLength(5);
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("enables Save and calls onSaveKey for a valid OpenAI key", async () => {
    const onSaveKey = vi.fn(resolved);
    await renderSettings({ onSaveKey });

    const openaiInput = document.querySelector<HTMLInputElement>("#api-key-openai");
    fireEvent.change(openaiInput!, { target: { value: "sk-validkey0123456789" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save API Key" });
    const firstSave = saveButtons[0]; // OpenAI card is first
    await waitFor(() => expect(firstSave).toBeEnabled());
    await act(async () => {
      fireEvent.click(firstSave);
      await Promise.resolve();
    });

    await waitFor(() => expect(onSaveKey).toHaveBeenCalledWith("openai", "sk-validkey0123456789"));
  });

  it("shows a validation error for a key with a bad prefix", async () => {
    const onSaveKey = vi.fn(resolved);
    await renderSettings({ onSaveKey });

    const openaiInput = document.querySelector<HTMLInputElement>("#api-key-openai");
    fireEvent.change(openaiInput!, { target: { value: "wrongprefix-123456" } });

    const saveButtons = screen.getAllByRole("button", { name: "Save API Key" });
    fireEvent.click(saveButtons[0]);

    expect(await screen.findByText(/API key should start with/)).toBeInTheDocument();
    expect(onSaveKey).not.toHaveBeenCalled();
  });

  it("shows the Saved badge for providers already stored", async () => {
    await renderSettings({ storedProviders: ["openai"] });
    // The OpenAI card reflects a stored key.
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("calls onLock when Lock Storage is pressed", async () => {
    const onLock = vi.fn();
    await renderSettings({ onLock });
    fireEvent.click(screen.getByRole("button", { name: /Lock Storage/ }));
    expect(onLock).toHaveBeenCalled();
  });
});
