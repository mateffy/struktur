import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiKeyProvider } from "./ApiKeyProvider";
import { SecureStorageGate } from "./SecureStorageGate";
import { initializeSecureStorage, lockSecureStorage } from "@/lib/secure-storage";

function renderGate(children: React.ReactNode = <div>protected-content</div>) {
  return render(
    <ApiKeyProvider>
      <SecureStorageGate>{children}</SecureStorageGate>
    </ApiKeyProvider>,
  );
}

describe("SecureStorageGate", () => {
  it("shows the setup prompt for a brand-new user", () => {
    renderGate();
    expect(screen.getByRole("heading", { name: "Secure Your API Keys" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Secure Storage" }),
    ).toBeInTheDocument();
  });

  it("always renders the protected children underneath the gate", () => {
    renderGate(<div>protected-content</div>);
    expect(screen.getByText("protected-content")).toBeInTheDocument();
  });

  it("closes the setup prompt after creating a password", async () => {
    renderGate();

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Secure Storage" }));

    // The dialog closes once initialization succeeds
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Secure Your API Keys" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the unlock prompt and a Skip option when already initialized but locked", async () => {
    // Pre-seed an initialized storage, then lock the session before mounting.
    await initializeSecureStorage("password123");
    lockSecureStorage();

    renderGate();

    expect(screen.getByRole("heading", { name: "Unlock Struktur" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip for Now" })).toBeInTheDocument();
  });

  it("skipping the unlock prompt dismisses it while keeping the protected content", async () => {
    await initializeSecureStorage("password123");
    lockSecureStorage();

    renderGate(<div>protected-content</div>);

    fireEvent.click(screen.getByRole("button", { name: "Skip for Now" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Unlock Struktur" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("protected-content")).toBeInTheDocument();
  });

  it("rejects an incorrect password with an error message", async () => {
    await initializeSecureStorage("password123");
    lockSecureStorage();

    renderGate();

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Unlock" }));

    expect(await screen.findByText(/Incorrect password/)).toBeInTheDocument();
  });
});
