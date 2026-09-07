import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PasswordPrompt } from "./PasswordPrompt";

const noop = () => {};
const resolved = () => Promise.resolve();

describe("PasswordPrompt — setup mode", () => {
  it("shows the setup title, both inputs, and the create button", () => {
    render(<PasswordPrompt mode="setup" onSubmit={resolved} />);

    expect(screen.getByRole("heading", { name: "Secure Your API Keys" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Secure Storage" })).toBeInTheDocument();
  });

  it("does not offer a skip button in setup mode", () => {
    render(<PasswordPrompt mode="setup" onSubmit={resolved} />);
    expect(screen.queryByRole("button", { name: "Skip for Now" })).not.toBeInTheDocument();
  });

  it("shows the end-to-end encryption notice in setup mode", () => {
    render(<PasswordPrompt mode="setup" onSubmit={resolved} />);
    expect(screen.getByText("End-to-End Encryption")).toBeInTheDocument();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const onSubmit = vi.fn(resolved);
    render(<PasswordPrompt mode="setup" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Secure Storage" }));

    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const onSubmit = vi.fn(resolved);
    render(<PasswordPrompt mode="setup" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/), {
      target: { value: "password124" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Secure Storage" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the password when the form is valid", async () => {
    const onSubmit = vi.fn(resolved);
    render(<PasswordPrompt mode="setup" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/), {
      target: { value: "password123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Create Secure Storage" }));
      await Promise.resolve();
    });

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith("password123"));
  });
});

describe("PasswordPrompt — unlock mode", () => {
  it("shows the unlock title, single input, and actions", () => {
    render(<PasswordPrompt mode="unlock" onSubmit={resolved} onCancel={noop} onReset={noop} />);

    expect(screen.getByRole("heading", { name: "Unlock Struktur" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip for Now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Forgot password/ })).toBeInTheDocument();
    // No confirm field in unlock mode
    expect(screen.queryByLabelText(/^Confirm Password$/)).not.toBeInTheDocument();
  });

  it("calls onCancel when Skip for Now is clicked", async () => {
    const onCancel = vi.fn();
    render(<PasswordPrompt mode="unlock" onSubmit={resolved} onCancel={onCancel} onReset={noop} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip for Now" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("submits a valid password", async () => {
    const onSubmit = vi.fn(resolved);
    render(<PasswordPrompt mode="unlock" onSubmit={onSubmit} onCancel={noop} onReset={noop} />);

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "password123" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Unlock" }));
      await Promise.resolve();
    });

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith("password123"));
  });
});

describe("PasswordPrompt — errors", () => {
  it("renders an external error message", () => {
    render(
      <PasswordPrompt
        mode="unlock"
        onSubmit={resolved}
        onCancel={noop}
        error="Incorrect password. Try again."
      />,
    );
    expect(screen.getByText("Incorrect password. Try again.")).toBeInTheDocument();
  });

  it("surfaces an error thrown by onSubmit", async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error("Storage unavailable")));
    render(<PasswordPrompt mode="unlock" onSubmit={onSubmit} onCancel={noop} />);

    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Unlock" }));

    expect(await screen.findByText("Storage unavailable")).toBeInTheDocument();
  });
});
