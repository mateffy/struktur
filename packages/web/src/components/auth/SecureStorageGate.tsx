import { useCallback, useEffect, useState } from "react";
import { useApiKeys } from "./ApiKeyProvider";
import { PasswordPrompt } from "./PasswordPrompt";

interface SecureStorageGateProps {
	children: React.ReactNode;
}

export function SecureStorageGate({ children }: SecureStorageGateProps) {
	const {
		isInitialized,
		isUnlocked,
		initialize,
		unlock,
		reset,
		error,
		status,
		unlockRequested,
		clearUnlockRequest,
	} = useApiKeys();
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptMode, setPromptMode] = useState<"setup" | "unlock">("unlock");
	const [localError, setLocalError] = useState<string | null>(null);

	// Determine whether to show the prompt
	useEffect(() => {
		if (!isInitialized) {
			// First time setup
			setPromptMode("setup");
			setShowPrompt(true);
		} else if (!isUnlocked) {
			// Need to unlock
			setPromptMode("unlock");
			setShowPrompt(true);
		} else {
			// All good
			setShowPrompt(false);
		}
	}, [isInitialized, isUnlocked]);

	// Show prompt when unlock is explicitly requested
	useEffect(() => {
		if (unlockRequested && !isUnlocked) {
			setPromptMode("unlock");
			setShowPrompt(true);
			clearUnlockRequest();
		}
	}, [unlockRequested, isUnlocked, clearUnlockRequest]);

	// Clear local error when status changes
	useEffect(() => {
		if (status !== "error") {
			setLocalError(null);
		}
	}, [status]);

	const handleSubmit = useCallback(
		async (password: string) => {
			setLocalError(null);
			if (promptMode === "setup") {
				await initialize(password);
			} else {
				const success = await unlock(password);
				if (!success) {
					setLocalError("Incorrect password. Please try again.");
					throw new Error("Incorrect password");
				}
			}
		},
		[promptMode, initialize, unlock],
	);

	const handleCancel = useCallback(() => {
		// For unlock mode, user can skip and still use the app without API keys
		if (promptMode === "unlock") {
			setShowPrompt(false);
		}
		// For setup mode, they can't skip - they must set a password
	}, [promptMode]);

	return (
		<>
			{children}
			<PasswordPrompt
				mode={promptMode}
				open={showPrompt}
				onOpenChange={(open) => {
					if (!open && promptMode === "unlock") {
						handleCancel();
					}
				}}
				onSubmit={handleSubmit}
				onCancel={promptMode === "unlock" ? handleCancel : undefined}
				onReset={promptMode === "unlock" ? reset : undefined}
				error={localError || error}
			/>
		</>
	);
}
