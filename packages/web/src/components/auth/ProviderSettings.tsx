import {
	AlertCircle,
	Check,
	ExternalLink,
	Eye,
	EyeOff,
	KeyRound,
	Lock,
	Shield,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProviderId } from "@/lib/secure-storage";
import {
	getAllProviders,
	type ProviderConfig,
	validateApiKeyFormat,
} from "@/types/providers";
import { ProviderLogo } from "./ProviderLogos";

interface ProviderSettingsProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	storedProviders: ProviderId[];
	onSaveKey: (provider: ProviderId, apiKey: string) => Promise<void>;
	onDeleteKey: (provider: ProviderId) => void;
	onGetKey: (provider: ProviderId) => Promise<string | null>;
	onLock: () => void;
}

interface ProviderCardProps {
	config: ProviderConfig;
	apiKey: string;
	isStored: boolean;
	isSaving: boolean;
	isRevealed: boolean;
	error: string | null;
	onApiKeyChange: (value: string) => void;
	onSave: () => void;
	onDelete: () => void;
	onRevealToggle: () => void;
}

function ProviderCard({
	config,
	apiKey,
	isStored,
	isSaving,
	isRevealed,
	error,
	onApiKeyChange,
	onSave,
	onDelete,
	onRevealToggle,
}: ProviderCardProps) {
	const validation = validateApiKeyFormat(config.id, apiKey);
	const canSave = apiKey.length > 0 && validation.valid && !isSaving;

	return (
		<div className="bg-[#f5efe6] rounded-xl border border-[#d4c8b8] overflow-hidden">
			{/* Header */}
			<div className="p-4 bg-[#ede5d8] border-b border-[#d4c8b8]">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm text-[#7a5c3a]">
							<ProviderLogo provider={config.id} className="w-6 h-6" />
						</div>
						<div>
							<h3 className="font-semibold text-[#2d1b0e]">{config.name}</h3>
							<p className="text-xs text-[#7a5c3a]">{config.description}</p>
						</div>
					</div>
					{isStored && (
						<div className="flex items-center gap-1.5 text-xs text-[#5c8a5c] bg-[#e8f5e8] px-2 py-1 rounded-full">
							<Check className="w-3 h-3" />
							Saved
						</div>
					)}
				</div>
			</div>

			{/* Body */}
			<div className="p-4 space-y-4">
				{/* API Key Input */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label
							htmlFor={`api-key-${config.id}`}
							className="text-sm font-medium text-[#2d1b0e]"
						>
							API Key
						</Label>
						<a
							href={config.keyUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-[#7a5c3a] hover:text-[#2d1b0e] flex items-center gap-1 transition-colors"
						>
							Get key
							<ExternalLink className="w-3 h-3" />
						</a>
					</div>
					<div className="relative">
						<Input
							id={`api-key-${config.id}`}
							type={isRevealed ? "text" : "password"}
							value={apiKey}
							onChange={(e) => onApiKeyChange(e.target.value)}
							placeholder={config.keyPlaceholder}
							autoComplete="off"
							data-lpignore="true"
							data-form-type="other"
							className="h-11 bg-white border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f]/60 pr-20 font-mono text-sm focus-visible:ring-[#7a5c3a]"
						/>
						<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
							<button
								type="button"
								onClick={onRevealToggle}
								className="p-1.5 text-[#a0926f] hover:text-[#7a5c3a] hover:bg-[#ede5d8] rounded-md transition-colors"
								title={isRevealed ? "Hide" : "Reveal"}
							>
								{isRevealed ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
							{isStored && (
								<button
									type="button"
									onClick={onDelete}
									className="p-1.5 text-[#a0926f] hover:text-[#a05c5c] hover:bg-[#f5e6e6] rounded-md transition-colors"
									title="Delete key"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>
					{error && (
						<p className="text-xs text-[#a05c5c] flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{error}
						</p>
					)}
					{!error && !validation.valid && apiKey.length > 0 && (
						<p className="text-xs text-[#a0926f]">{validation.error}</p>
					)}
				</div>

				{/* Save Button */}
				<Button
					onClick={onSave}
					disabled={!canSave}
					className="w-full h-10 bg-[#7a5c3a] text-white hover:bg-[#5c452a] disabled:opacity-50"
				>
					{isSaving ? (
						<span className="flex items-center gap-2">
							<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							Saving...
						</span>
					) : isStored ? (
						"Update API Key"
					) : (
						"Save API Key"
					)}
				</Button>

				{/* Recommended Permissions */}
				<Accordion className="w-full">
					<AccordionItem value="permissions" className="border-0">
						<AccordionTrigger className="text-xs text-[#7a5c3a] hover:text-[#2d1b0e] py-2 hover:no-underline">
							<span className="flex items-center gap-1.5">
								<Shield className="w-3 h-3" />
								Security recommendations
							</span>
						</AccordionTrigger>
						<AccordionContent>
							<ul className="text-xs text-[#7a5c3a] space-y-1.5 bg-[#ede5d8] rounded-lg p-3 mt-2">
								{config.recommendedPermissions.map((permission) => (
									<li key={permission} className="flex items-start gap-1.5">
										<span className="text-[#5c8a5c] mt-0.5">•</span>
										{permission}
									</li>
								))}
							</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}

export function ProviderSettings({
	isOpen,
	onOpenChange,
	storedProviders,
	onSaveKey,
	onDeleteKey,
	onGetKey,
	onLock,
}: ProviderSettingsProps) {
	const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>({
		openai: "",
		anthropic: "",
		google: "",
		opencode: "",
		openrouter: "",
	});
	const [revealedKeys, setRevealedKeys] = useState<Set<ProviderId>>(new Set());
	const [savingProviders, setSavingProviders] = useState<Set<ProviderId>>(
		new Set(),
	);
	const [errors, setErrors] = useState<Record<ProviderId, string | null>>({
		openai: null,
		anthropic: null,
		google: null,
		opencode: null,
		openrouter: null,
	});
	const [localStoredProviders, setLocalStoredProviders] = useState<
		Set<ProviderId>
	>(new Set(storedProviders));

	// Load stored keys when dialog opens
	useEffect(() => {
		if (isOpen) {
			const loadKeys = async () => {
				const newApiKeys: Record<ProviderId, string> = {
					openai: "",
					anthropic: "",
					google: "",
					opencode: "",
					openrouter: "",
				};
				for (const provider of storedProviders) {
					const key = await onGetKey(provider);
					if (key) {
						newApiKeys[provider] = key;
					}
				}
				setApiKeys(newApiKeys);
				setLocalStoredProviders(new Set(storedProviders));
			};
			loadKeys();
		}
	}, [isOpen, storedProviders, onGetKey]);

	const handleApiKeyChange = useCallback(
		(provider: ProviderId, value: string) => {
			setApiKeys((prev) => ({ ...prev, [provider]: value }));
			setErrors((prev) => ({ ...prev, [provider]: null }));
		},
		[],
	);

	const handleSave = useCallback(
		async (provider: ProviderId) => {
			const apiKey = apiKeys[provider];
			const validation = validateApiKeyFormat(provider, apiKey);

			if (!validation.valid) {
				setErrors((prev) => ({
					...prev,
					[provider]: validation.error || "Invalid key",
				}));
				return;
			}

			setSavingProviders((prev) => new Set(prev).add(provider));
			setErrors((prev) => ({ ...prev, [provider]: null }));

			try {
				await onSaveKey(provider, apiKey);
				setLocalStoredProviders((prev) => new Set(prev).add(provider));
			} catch (err) {
				setErrors((prev) => ({
					...prev,
					[provider]: err instanceof Error ? err.message : "Failed to save",
				}));
			} finally {
				setSavingProviders((prev) => {
					const next = new Set(prev);
					next.delete(provider);
					return next;
				});
			}
		},
		[apiKeys, onSaveKey],
	);

	const handleDelete = useCallback(
		(provider: ProviderId) => {
			onDeleteKey(provider);
			setApiKeys((prev) => ({ ...prev, [provider]: "" }));
			setLocalStoredProviders((prev) => {
				const next = new Set(prev);
				next.delete(provider);
				return next;
			});
		},
		[onDeleteKey],
	);

	const toggleReveal = useCallback((provider: ProviderId) => {
		setRevealedKeys((prev) => {
			const next = new Set(prev);
			if (next.has(provider)) {
				next.delete(provider);
			} else {
				next.add(provider);
			}
			return next;
		});
	}, []);

	const providers = getAllProviders();

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="w-[calc(100%-2rem)] !max-w-none max-h-[90vh] overflow-y-auto bg-[#f5efe6] border-[#d4c8b8] p-0">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle className="flex items-center gap-2 text-xl text-[#2d1b0e]">
						<KeyRound className="w-5 h-5 text-[#7a5c3a]" />
						API Key Settings
					</DialogTitle>
				</DialogHeader>

				{/* Security notice */}
				<div className="px-6">
					<div className="bg-[#ede5d8] rounded-lg p-4 border border-[#d4c8b8]">
						<div className="flex items-start gap-3">
							<Shield className="w-5 h-5 text-[#7a5c3a] flex-shrink-0 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium text-[#2d1b0e] mb-1">
									Your API keys are encrypted and stored locally
								</p>
								<p className="text-[#7a5c3a] leading-relaxed">
									API keys are encrypted in your browser's LocalStorage and only
									decrypted when needed. They are sent directly to the model
									provider when you run extractions and are never stored on our
									servers. We recommend setting billing limits and using
									restricted API keys.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Provider cards */}
				<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					{providers.map((config) => (
						<ProviderCard
							key={config.id}
							config={config}
							apiKey={apiKeys[config.id]}
							isStored={localStoredProviders.has(config.id)}
							isSaving={savingProviders.has(config.id)}
							isRevealed={revealedKeys.has(config.id)}
							error={errors[config.id]}
							onApiKeyChange={(value) => handleApiKeyChange(config.id, value)}
							onSave={() => handleSave(config.id)}
							onDelete={() => handleDelete(config.id)}
							onRevealToggle={() => toggleReveal(config.id)}
						/>
					))}
				</div>

				{/* Footer */}
				<DialogFooter className="p-6 pt-0 flex-col sm:flex-row gap-3">
					<Button
						variant="outline"
						onClick={onLock}
						className="border-[#d4c8b8] text-[#7a5c3a] hover:bg-[#ede5d8] hover:text-[#2d1b0e]"
					>
						<Lock className="w-4 h-4 mr-2" />
						Lock Storage
					</Button>
					<Button
						onClick={() => onOpenChange(false)}
						className="bg-[#7a5c3a] text-white hover:bg-[#5c452a]"
					>
						Done
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
