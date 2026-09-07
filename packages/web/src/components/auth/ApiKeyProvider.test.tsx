import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiKeyProvider, useApiKeys } from "./ApiKeyProvider";

function Probe() {
  const ctx = useApiKeys();
  const [thrown, setThrown] = useState("");
  const safe = (fn: () => Promise<unknown>) =>
    fn().catch((err: unknown) => setThrown(err instanceof Error ? err.message : String(err)));
  return (
    <div>
      <output data-testid="init">{String(ctx.isInitialized)}</output>
      <output data-testid="unlocked">{String(ctx.isUnlocked)}</output>
      <output data-testid="error">{ctx.error ?? ""}</output>
      <output data-testid="providers">{ctx.storedProviders.join(",")}</output>
      <output data-testid="has-openai">{String(ctx.hasKeyForProvider("openai"))}</output>
      <output data-testid="thrown">{thrown}</output>
      <button onClick={() => safe(() => ctx.initialize("secure-password-1"))}>init</button>
      <button onClick={() => safe(() => ctx.unlock("secure-password-1"))}>unlock</button>
      <button onClick={() => safe(() => ctx.unlock("wrong-password"))}>unlock-bad</button>
      <button onClick={() => safe(() => ctx.saveApiKey("openai", "sk-openai-test"))}>save-openai</button>
      <button onClick={() => ctx.lock()}>lock</button>
      <button onClick={() => ctx.reset()}>reset</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <ApiKeyProvider>
      <Probe />
    </ApiKeyProvider>,
  );
}

describe("ApiKeyProvider", () => {
  it("starts uninitialized and locked", () => {
    renderProbe();
    expect(screen.getByTestId("init")).toHaveTextContent("false");
    expect(screen.getByTestId("unlocked")).toHaveTextContent("false");
  });

  it("initialize unlocks the session", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "init" }));

    await waitFor(() => expect(screen.getByTestId("init")).toHaveTextContent("true"));
    expect(screen.getByTestId("unlocked")).toHaveTextContent("true");
  });

  it("unlock with the correct password succeeds", async () => {
    renderProbe();
    // Pre-seed an initialized store
    fireEvent.click(screen.getByRole("button", { name: "init" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("true"));
    fireEvent.click(screen.getByRole("button", { name: "lock" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("false"));

    fireEvent.click(screen.getByRole("button", { name: "unlock" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("true"));
  });

  it("unlock with an incorrect password reports an error", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "init" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("true"));
    fireEvent.click(screen.getByRole("button", { name: "lock" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("false"));

    fireEvent.click(screen.getByRole("button", { name: "unlock-bad" }));
    await waitFor(() =>
      expect(screen.getByTestId("error")).not.toHaveTextContent(""),
    );
    expect(screen.getByTestId("unlocked")).toHaveTextContent("false");
  });

  it("saveApiKey records the provider while unlocked", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "init" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("true"));

    fireEvent.click(screen.getByRole("button", { name: "save-openai" }));

    await waitFor(() => expect(screen.getByTestId("providers")).toHaveTextContent("openai"));
    expect(screen.getByTestId("has-openai")).toHaveTextContent("true");
  });

  it("saveApiKey throws while locked", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "save-openai" }));
    await waitFor(() =>
      expect(screen.getByTestId("thrown")).toHaveTextContent("Secure storage is locked"),
    );
    expect(screen.getByTestId("providers")).toHaveTextContent("");
  });

  it("reset clears all state", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "init" }));
    await waitFor(() => expect(screen.getByTestId("unlocked")).toHaveTextContent("true"));
    fireEvent.click(screen.getByRole("button", { name: "save-openai" }));
    await waitFor(() => expect(screen.getByTestId("providers")).toHaveTextContent("openai"));

    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    await waitFor(() => expect(screen.getByTestId("init")).toHaveTextContent("false"));
    expect(screen.getByTestId("unlocked")).toHaveTextContent("false");
    expect(screen.getByTestId("providers")).toHaveTextContent("");
  });
});
