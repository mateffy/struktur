import {
	AlertCircle,
	FileText,
	Github,
	KeyRound,
	Loader2,
	Lock,
	Play,
	RotateCw,
	Square,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProviderId } from "@/lib/secure-storage";
import { loadFilesFromStorage, saveFilesToStorage, clearStoredFiles } from "@/lib/file-storage";
import { ArtifactViewer } from "./ArtifactViewer";
import { useApiKeys } from "./auth/ApiKeyProvider";
import { ProviderSettings } from "./auth/ProviderSettings";
import { Logo } from "./Logo";
import { OutputViewer } from "./OutputViewer";
import { Sidebar } from "./Sidebar";
import { type TimelineEntry, UnifiedTimeline } from "./UnifiedTimeline";
import { AgentViewer, useAgentActivities } from "./AgentViewer";

export type ExecutionStatus =
	| "idle"
	| "parsing"
	| "extracting"
	| "success"
	| "error";

export type SchemaMode = "file" | "json" | "fields";

export type ProgressInfo = {
	current: number;
	total: number;
	message: string;
	step?: string;
	retryAttempt?: number;
	retryMax?: number;
};

type Artifact = {
	id: string;
	type: string;
	contents: any[];
};

// Cache key based on file names and parsing options
type ParseCacheEntry = {
	artifacts: Artifact[];
	timestamp: number;
};

// Generate cache key from files and options
function generateParseCacheKey(files: File[], options: { images: boolean; screenshots: boolean; parser: string }): string {
	const fileNames = files.map(f => `${f.name}:${f.size}:${f.lastModified}`).join(',');
	const optionsKey = `${options.images}:${options.screenshots}:${options.parser}`;
	return `${fileNames}|${optionsKey}`;
}

export type ExtractionResult = {
	data: unknown;
	usage: {
		inputTokens: number;
		outputTokens: number;
	};
};

function buildFormDataWithFiles(files: File[]): FormData {
	const formData = new FormData();
	for (let i = 0; i < files.length; i++) {
		formData.append(`file_${i}`, files[i]);
	}
	return formData;
}

async function postFormData(url: string, formData: FormData): Promise<any> {
	const response = await fetch(url, {
		method: "POST",
		body: formData,
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP ${response.status}: ${text}`);
	}
	return response.json();
}

// Cache for aliases
let aliasesCache: Record<string, string> = {};
let aliasesCacheTime = 0;
const ALIASES_CACHE_DURATION = 60000; // 1 minute

async function loadAliases(): Promise<Record<string, string>> {
	const now = Date.now();
	if (now - aliasesCacheTime < ALIASES_CACHE_DURATION && Object.keys(aliasesCache).length > 0) {
		return aliasesCache;
	}
	
	try {
		const response = await fetch("/api/config");
		if (response.ok) {
			const config = await response.json();
			aliasesCache = config.aliases || {};
			aliasesCacheTime = now;
		}
	} catch {
		// Ignore fetch errors
	}
	return aliasesCache;
}

function resolveAliasLocal(model: string, aliases: Record<string, string>): string {
	return aliases[model] || model;
}

// Extract provider from model string, resolving aliases first
function getProviderFromModel(model: string, aliases: Record<string, string>): ProviderId | null {
	if (!model) return null;
	
	// Resolve alias to get the actual model spec
	const resolvedModel = resolveAliasLocal(model, aliases);
	
	const provider = resolvedModel.split("/")[0];
	if (!provider) return null;

	const validProviders: ProviderId[] = [
		"openai",
		"anthropic",
		"google",
		"opencode",
		"openrouter",
	];
	return validProviders.includes(provider as ProviderId)
		? (provider as ProviderId)
		: null;
}

export function ExtractPage() {
	// Detect if running in desktop mode via query param
	const isDesktop = typeof window !== "undefined" && 
		new URLSearchParams(window.location.search).get("desktop") === "true";

	const [files, setFiles] = useState<File[]>([]);
	const [schemaMode, setSchemaMode] = useState<SchemaMode>("fields");
	const [schemaJson, setSchemaJson] = useState("");
	const [fields, setFields] = useState("");
	const [model, setModel] = useState("");
	const [strategy, setStrategy] = useState<string>("agent");
	const [chunkSize, setChunkSize] = useState(120000);
	const [activeTab, setActiveTab] = useState<"result" | "timeline" | "agent">("result");
	const [parsingOptions, setParsingOptions] = useState({
		images: false,
		screenshots: true,
		parser: "",
	});
	const [chunkingOptions, setChunkingOptions] = useState({
		maxImages: 5 as number | null,
		textRatio: 4,
		imageTokens: 1000,
		filterEmbedded: true,
		filterScreenshot: true,
	});

	const [status, setStatus] = useState<ExecutionStatus>("idle");
	const [artifacts, setArtifacts] = useState<Artifact[]>([]);
	const [result, setResult] = useState<ExtractionResult | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
	const [isChunkingLoading, setIsChunkingLoading] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [aliases, setAliases] = useState<Record<string, string>>({});
	
	// Cache for parsed artifacts keyed by file signatures + parsing options
	const [parseCache, setParseCache] = useState<Map<string, ParseCacheEntry>>(new Map());

	const abortControllerRef = useRef<AbortController | null>(null);
	const chunkSizeDebounceRef = useRef<NodeJS.Timeout | null>(null);
	const parsingDebounceRef = useRef<NodeJS.Timeout | null>(null);

	// Load aliases on mount
	useEffect(() => {
		loadAliases().then(setAliases);
	}, []);

	// Load files from storage on mount
	useEffect(() => {
		loadFilesFromStorage().then((storedFiles) => {
			if (storedFiles.length > 0) {
				setFiles(storedFiles);
			}
		});
	}, []);

	// Save files to storage whenever they change
	useEffect(() => {
		if (files.length > 0) {
			saveFilesToStorage(files);
		} else {
			clearStoredFiles();
		}
	}, [files]);

	const {
		isUnlocked,
		storedProviders,
		saveApiKey,
		getApiKey,
		removeApiKey,
		lock,
		requestUnlock,
	} = useApiKeys();

	// Agent activities for streaming UI
	const {
		activities: agentActivities,
		isRunning: isAgentRunning,
		clearActivities: clearAgentActivities,
		startAgent,
		addActivity: addAgentActivity,
	} = useAgentActivities();

	const addTimelineEntry = useCallback(
		(
			type: TimelineEntry["type"],
			action: TimelineEntry["action"],
			message: string,
			data?: unknown,
			status: TimelineEntry["status"] = "pending",
		) => {
			const entry: TimelineEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date(),
				type,
				action,
				status,
				message,
				data,
			};
			setTimeline((prev) => [...prev, entry]);
			return entry.id;
		},
		[],
	);

	const updateTimelineEntry = useCallback(
		(id: string, updates: Partial<TimelineEntry>) => {
			setTimeline((prev) =>
				prev.map((entry) =>
					entry.id === id ? { ...entry, ...updates } : entry,
				),
			);
		},
		[],
	);

	const handleChunkSizeChange = useCallback((newSize: number) => {
		setIsChunkingLoading(true);

		if (chunkSizeDebounceRef.current) {
			clearTimeout(chunkSizeDebounceRef.current);
		}

		chunkSizeDebounceRef.current = setTimeout(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
			setChunkSize(newSize);
			await new Promise((resolve) => setTimeout(resolve, 0));
			setIsChunkingLoading(false);
		}, 300);
	}, []);

	const [globalProviders, setGlobalProviders] = useState<string[]>([]);
	const [useGlobalProviders, setUseGlobalProviders] = useState(false);
	const [apiSource, setApiSource] = useState<"local" | "server">("local");

	// Load API source preference and fetch config
	useEffect(() => {
		// Load saved preference
		const savedSource = localStorage.getItem("struktur-api-source") as "local" | "server" | null;
		
		fetch("/api/config")
			.then((res) => res.json())
			.then((config) => {
				setGlobalProviders(config.availableProviders || []);
				setUseGlobalProviders(config.useGlobalProviders || false);
				
				// Determine initial source
				const hasServerKeys = config.useGlobalProviders && (config.availableProviders || []).length > 0;
				const hasLocalKeys = storedProviders.length > 0;
				
				if (savedSource) {
					// Validate saved preference is still valid
					if (savedSource === "server" && hasServerKeys) {
						setApiSource("server");
					} else if (savedSource === "local" && hasLocalKeys) {
						setApiSource("local");
					} else if (hasServerKeys) {
						setApiSource("server");
					} else {
						setApiSource("local");
					}
				} else {
					// Default: prefer server if available, otherwise local
					if (hasServerKeys) {
						setApiSource("server");
					} else {
						setApiSource("local");
					}
				}
			})
			.catch((err) => {
				console.error("Failed to fetch config:", err);
			});
	}, [storedProviders]);

	const handleApiSourceChange = useCallback((source: "local" | "server") => {
		setApiSource(source);
		localStorage.setItem("struktur-api-source", source);
	}, []);

	const canExtract =
		files.length > 0 &&
		(schemaMode === "file" ||
			(schemaMode === "json" && schemaJson.trim().length > 0) ||
			(schemaMode === "fields" && fields.trim().length > 0));

	// Check if we have an API key for a given model
	const hasKeyForModel = useCallback((modelString: string): boolean => {
		if (!modelString) return false;
		
		const provider = getProviderFromModel(modelString, aliases);
		if (!provider) return false;
		
		// If using server-side keys, check if server has the key
		if (apiSource === "server" && useGlobalProviders && globalProviders.includes(provider)) {
			return true;
		}
		
		// If using local keys, check if we have a key stored in the secure storage
		return storedProviders.includes(provider);
	}, [storedProviders, globalProviders, useGlobalProviders, apiSource, aliases]);

	const handleParse = useCallback(async () => {
		if (files.length === 0) return;

		// Check cache first
		const cacheKey = generateParseCacheKey(files, parsingOptions);
		const cached = parseCache.get(cacheKey);
		
		if (cached) {
			// Use cached result
			setArtifacts(cached.artifacts);
			setStatus("success");
			addTimelineEntry(
				"action",
				"parse",
				"Loaded cached parse result",
				{ fileCount: files.length, cached: true },
				"completed",
			);
			return;
		}

		setStatus("parsing");
		setError(null);
		setArtifacts([]);
		setResult(null);

		const stepId = addTimelineEntry(
			"action",
			"parse",
			"Parsing files",
			{ fileCount: files.length },
			"running",
		);

		try {
			const formData = buildFormDataWithFiles(files);
			formData.append("options", JSON.stringify(parsingOptions));
			const response = await postFormData("/api/parse", formData);
			const parsedArtifacts = response.artifacts as Artifact[];
			
			// Store in cache
			setParseCache(prev => {
				const newCache = new Map(prev);
				newCache.set(cacheKey, {
					artifacts: parsedArtifacts,
					timestamp: Date.now(),
				});
				return newCache;
			});
			
			setArtifacts(parsedArtifacts);
			updateTimelineEntry(stepId, { status: "completed", endTimestamp: new Date(), metadata: { artifactCount: parsedArtifacts.length } });
			setStatus("success");
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			updateTimelineEntry(stepId, { status: "error", endTimestamp: new Date(), details: error.message });
			setStatus("error");
		}
	}, [files, parsingOptions, addTimelineEntry, updateTimelineEntry, parseCache, setParseCache]);

	const handleExtract = async () => {
		if (files.length === 0) return;
		if (schemaMode === "json" && !schemaJson.trim()) return;
		if (schemaMode === "fields" && !fields.trim()) return;

		abortControllerRef.current = new AbortController();

		setStatus("extracting");
		setError(null);
		setResult(null);

		// Start agent activities tracking for agent strategy
		if (strategy === "agent") {
			startAgent();
		}

		const parseStepId = addTimelineEntry(
			"action",
			"parse",
			"Parsing files",
			{ fileCount: files.length },
			"pending",
		);
		const extractStepId = addTimelineEntry(
			"action",
			"extract",
			"Extracting data",
			{ schemaMode, strategy },
			"pending",
		);

		try {
			// Get the provider from the selected model and retrieve API key if available
			const provider = getProviderFromModel(model, aliases);
			let apiKey: string | undefined;

			if (provider && isUnlocked) {
				const key = await getApiKey(provider);
			if (key) {
				apiKey = key;
				addTimelineEntry("info", "other", `Using stored API key for ${provider}`);
			}
			}

			const formData = buildFormDataWithFiles(files);
			formData.append(
				"params",
				JSON.stringify({
					schemaMode,
					schemaJson,
					fields,
					model,
					strategy,
					chunkSize,
					parsingOptions,
					chunkingOptions,
					apiKey,
				}),
			);

			const response = await fetch("/api/extract/stream", {
				method: "POST",
				body: formData,
				signal: abortControllerRef.current.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No response body");
			}

			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = JSON.parse(line.slice(6));

						switch (data.type) {
						case "step": {
							const stepData = data.data as any;
							if (stepData.label === "Parsing files") {
								updateTimelineEntry(parseStepId, { status: "running" });
							} else if (stepData.label === "Extracting data") {
								updateTimelineEntry(extractStepId, { status: "running" });
							}
							// Also add to agent activities if using agent strategy
							if (strategy === "agent") {
								addAgentActivity({
									type: "step",
									label: stepData.label,
									step: stepData.step || 0,
									total: stepData.total,
								});
							}
							break;
						}

						case "agent_tool_start":
							console.log(`[ExtractPage] Received agent_tool_start:`, data.data);
							if (strategy === "agent") {
								const toolData = data.data as any;
								addAgentActivity({
									type: "tool_start",
									toolName: toolData.toolName,
									toolCallId: toolData.toolCallId,
									args: toolData.args,
								});
							}
							break;

						case "agent_tool_end":
							console.log(`[ExtractPage] Received agent_tool_end:`, data.data);
							if (strategy === "agent") {
								const toolData = data.data as any;
								addAgentActivity({
									type: "tool_end",
									toolCallId: toolData.toolCallId,
									result: toolData.result,
									error: toolData.error,
								});
							}
							break;

						case "agent_message":
							console.log(`[ExtractPage] Received agent_message:`, data.data);
							if (strategy === "agent") {
								const msgData = data.data as any;
								addAgentActivity({
									type: "message_delta",
									content: msgData.content,
								});
							}
							break;

						case "agent_reasoning":
							console.log(`[ExtractPage] Received agent_reasoning:`, data.data);
							if (strategy === "agent") {
								const reasoningData = data.data as any;
								addAgentActivity({
									type: "reasoning",
									thought: reasoningData.thought,
								});
							}
							break;

						case "message":
							addTimelineEntry("info", "other", "LLM message", data.data);
							break;

						case "progress":
							addTimelineEntry("info", "other", "Progress update", data.data);
							break;

						case "tokenUsage":
							addTimelineEntry("info", "other", "Token usage", data.data);
							break;

						case "retry":
							addTimelineEntry("warning", "other", "Retry attempt", data.data);
							break;

						case "complete": {
							const completeData = data.data as any;
							console.log("Complete data:", completeData);
							console.log("Result:", completeData?.result);
							console.log("Result data:", completeData?.result?.data);
							setArtifacts(completeData.artifacts);
							setResult(completeData.result);
							updateTimelineEntry(parseStepId, { status: "completed", endTimestamp: new Date() });
							updateTimelineEntry(extractStepId, { status: "completed", endTimestamp: new Date() });
							setStatus("success");
							break;
						}

						case "error": {
							const errorData = data.data as any;
							throw new Error(errorData.message);
						}
					}
					}
				}
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			if (error.name === "AbortError") {
				addTimelineEntry("warning", "other", "Operation cancelled");
				setStatus("idle");
			} else {
				setError(error);
				updateTimelineEntry(parseStepId, { status: "error", endTimestamp: new Date() });
				updateTimelineEntry(extractStepId, { status: "error", endTimestamp: new Date() });
				setStatus("error");
			}
		}
	};

	const handleCancel = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	}, []);

	const clearTimeline = useCallback(() => {
		setTimeline([]);
	}, []);

	const hasParsed = artifacts.length > 0;

	useEffect(() => {
		if (files.length > 0 && status === "idle") {
			handleParse();
		}
	}, [files, status, handleParse]);

	useEffect(() => {
		if (files.length > 0 && status === "idle" && hasParsed) {
			// Debounce parsing to avoid excessive re-parsing
			if (parsingDebounceRef.current) {
				clearTimeout(parsingDebounceRef.current);
			}
			parsingDebounceRef.current = setTimeout(() => {
				handleParse();
			}, 500);
		}

		return () => {
			if (parsingDebounceRef.current) {
				clearTimeout(parsingDebounceRef.current);
			}
		};
	}, [parsingOptions, files.length, status, hasParsed, handleParse]);

	return (
		<div className="h-screen bg-[#f5efe6] flex flex-col">
			<header className={`border-b border-[#d4c8b8] pr-6 bg-[#ede5d8] flex items-center justify-between h-16 flex-shrink-0 z-10 relative electrobun-webkit-app-region-drag`}>
				<div className="flex items-center h-full">
					<div className={`flex items-center h-full`}>
						<Logo isDesktop={isDesktop} />
					</div>

					<div className="hidden md:flex items-center gap-1 ml-4 electrobun-webkit-app-region-no-drag h-full">
						<a
							href="https://struktur.sh/docs"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors"
						>
							<FileText className="w-4 h-4" />
							Docs
						</a>
						<a
							href="https://github.com/mateffy/struktur"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors"
						>
							<Github className="w-4 h-4" />
							GitHub
						</a>
					</div>
				</div>

				<div className="flex items-center gap-4 electrobun-webkit-app-region-no-drag">
					{/* API Source Indicator - Always show which keys are being used */}
					<div className="flex items-center gap-2">
						{useGlobalProviders && globalProviders.length > 0 ? (
							// Toggle when both options are available
							<div className="flex items-center gap-1 bg-[#ede5d8] rounded-md p-1 border border-[#d4c8b8]">
								<button
									type="button"
									onClick={() => handleApiSourceChange("local")}
									className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
										apiSource === "local"
											? "bg-[#7a5c3a] text-white"
											: "text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6]"
									}`}
									title="Use API keys stored locally in your browser"
								>
									Local Keys
								</button>
								<button
									type="button"
									onClick={() => handleApiSourceChange("server")}
									className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
										apiSource === "server"
											? "bg-[#7a5c3a] text-white"
											: "text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6]"
									}`}
									title="Use API keys configured on the server (CLI)"
								>
									Server Keys
								</button>
							</div>
						) : (
							// Indicator when only local keys are available
							<div 
								className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#7a5c3a] bg-[#ede5d8] rounded-md border border-[#d4c8b8]"
								title="Using locally stored API keys"
							>
								<KeyRound className="w-3 h-3" />
								<span>Local Keys</span>
							</div>
						)}
					</div>

					{/* Lock/Settings Button */}
					{isUnlocked ? (
						<>
							<button
								type="button"
								onClick={() => setSettingsOpen(true)}
								className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors border border-[#d4c8b8]"
								title="API Key Settings"
							>
								<KeyRound className="w-4 h-4" />
								<span className="hidden sm:inline">API Keys</span>
							</button>
							<ProviderSettings
								isOpen={settingsOpen}
								onOpenChange={setSettingsOpen}
								storedProviders={storedProviders}
								onSaveKey={saveApiKey}
								onDeleteKey={removeApiKey}
								onGetKey={getApiKey}
								onLock={lock}
								apiSource={apiSource}
								useGlobalProviders={useGlobalProviders}
								globalProviders={globalProviders}
								onApiSourceChange={handleApiSourceChange}
							/>
						</>
					) : (
						<button
							type="button"
							onClick={() => requestUnlock()}
							className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a05c5c] hover:text-[#8a4a4a] hover:bg-[#f5e6e6] bg-[#f5e6e6]/50 rounded-md transition-colors border border-[#d4c8b8]"
							title="Storage is locked - Click to unlock"
						>
							<Lock className="w-4 h-4" />
							<span className="hidden sm:inline">Token Vault locked</span>
						</button>
					)}

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={status === "parsing" ? handleCancel : handleParse}
							disabled={
								files.length === 0 ||
								status === "extracting" ||
								status === "parsing"
							}
							className={`h-9 px-4 bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] disabled:opacity-50 group ${
								status === "parsing"
									? "hover:bg-[#f5e6e6] hover:text-[#a05c5c] hover:border-[#a05c5c]"
									: "hover:bg-[#ede5d8] hover:text-[#3d2b15]"
							}`}
						>
							{status === "parsing" ? (
								<>
									<span className="flex items-center group-hover:hidden">
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Parsing...
									</span>
									<span className="hidden group-hover:flex items-center">
										<Square className="h-4 w-4 mr-2" />
										Cancel
									</span>
								</>
							) : hasParsed ? (
								<>
									<RotateCw className="h-4 w-4 mr-2" />
									Reparse
								</>
							) : (
								<>
									<Play className="h-4 w-4 mr-2" />
									Parse
								</>
							)}
						</Button>
						<Button
							onClick={status === "extracting" ? handleCancel : handleExtract}
							disabled={
								!canExtract || status === "parsing" || status === "extracting"
							}
							className={`h-9 px-4 bg-[#7a5c3a] text-white disabled:opacity-50 group ${
								status === "extracting"
									? "hover:bg-[#a05c5c]"
									: "hover:bg-[#5c452a]"
							}`}
						>
							{status === "extracting" ? (
								<>
									<span className="flex items-center group-hover:hidden">
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Extracting...
									</span>
									<span className="hidden group-hover:flex items-center">
										<Square className="h-4 w-4 mr-2" />
										Cancel
									</span>
								</>
							) : (
								<>
									<Play className="h-4 w-4 mr-2" />
									Extract
								</>
							)}
						</Button>
					</div>
				</div>
			</header>

			<div className="flex-1 flex overflow-hidden">
				<Sidebar
					files={files}
					schemaMode={schemaMode}
					schemaJson={schemaJson}
					fields={fields}
					model={model}
					strategy={strategy}
					chunkSize={chunkSize}
					parsingOptions={parsingOptions}
					chunkingOptions={chunkingOptions}
					status={status}
					isChunkingLoading={isChunkingLoading}
					hasKeyForModel={hasKeyForModel}
					onFilesChange={setFiles}
					onSchemaModeChange={setSchemaMode}
					onSchemaJsonChange={setSchemaJson}
					onFieldsChange={setFields}
					onModelChange={setModel}
					onStrategyChange={setStrategy}
					onChunkSizeChange={handleChunkSizeChange}
					onParsingOptionsChange={setParsingOptions}
					onChunkingOptionsChange={setChunkingOptions}
				/>

				<main className="flex-1 flex overflow-hidden">
					<div className="flex-1 flex">
						<div className="flex-1 overflow-y-auto p-6">
						{error && (
							<div className="mb-6 relative overflow-hidden rounded-xl border-2 border-[#a05c5c] bg-gradient-to-br from-[#f5e6e6] via-[#faf0f0] to-[#f5e6e6] shadow-[0_8px_32px_rgba(160,92,92,0.15)]">
								{/* Animated background pattern */}
								<div className="absolute inset-0 opacity-10">
									<div className="absolute inset-0" style={{
										backgroundImage: `repeating-linear-gradient(
											45deg,
											transparent,
											transparent 10px,
											rgba(160, 92, 92, 0.1) 10px,
											rgba(160, 92, 92, 0.1) 20px
										)`,
									}} />
								</div>
								
								{/* Glowing accent line */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a05c5c] to-transparent opacity-60" />
								
								<div className="relative p-5">
									<div className="flex items-start gap-4">
										{/* Animated icon container */}
										<div className="relative flex-shrink-0">
											<div className="absolute inset-0 bg-[#a05c5c] rounded-full animate-ping opacity-20" />
											<div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#a05c5c] to-[#8a4a4a] flex items-center justify-center shadow-lg">
												<AlertCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
											</div>
										</div>
										
										<div className="flex-1 min-w-0 pt-1">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-sm font-bold text-[#8a4a4a] uppercase tracking-wider">
													Error
												</span>
												<div className="flex-1 h-px bg-gradient-to-r from-[#a05c5c]/30 to-transparent" />
											</div>
											
											<div className="relative">
												<p className="text-sm text-[#5c3a3a] leading-relaxed font-medium">
													{error.message}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

							<ArtifactViewer
								artifacts={artifacts}
								chunkingSettings={{
									maxTokens: chunkSize,
									maxImages: chunkingOptions.maxImages,
									textRatio: chunkingOptions.textRatio,
									imageTokens: chunkingOptions.imageTokens,
									filterEmbedded: chunkingOptions.filterEmbedded,
									filterScreenshot: chunkingOptions.filterScreenshot,
								}}
								isParsing={status === "parsing"}
							/>
						</div>

								<div className="w-[500px] border-l border-[#d4c8b8] bg-[#ede5d8] flex flex-col overflow-hidden">
									<Tabs
										value={activeTab}
										onValueChange={(v) => setActiveTab(v as "result" | "timeline" | "agent")}
										className="flex flex-col h-full"
									>
										<div className="flex items-center justify-between p-4 border-b border-[#d4c8b8] flex-shrink-0">
											<h2 className="text-sm font-semibold text-[#2d1b0e] uppercase tracking-wider">
												Output
											</h2>
											<TabsList>
												<TabsTrigger value="result">Result</TabsTrigger>
												{strategy === "agent" && (
													<TabsTrigger value="agent">Agent</TabsTrigger>
												)}
												<TabsTrigger value="timeline">Timeline</TabsTrigger>
											</TabsList>
										</div>

										<div className="flex-1 overflow-hidden">
											<TabsContent
												value="result"
												className="h-full m-0 data-[state=inactive]:hidden"
											>
												<div className="h-full p-4">
													<OutputViewer
														data={result?.data}
														usage={result?.usage}
														model={model}
														schemaMode={
															schemaMode === "file" ? undefined : schemaMode
														}
														fields={fields}
													/>
												</div>
											</TabsContent>

											<TabsContent
												value="agent"
												className="h-full m-0 data-[state=inactive]:hidden"
											>
												<div className="h-full p-4">
													<AgentViewer
														activities={agentActivities}
														isRunning={isAgentRunning}
														onClear={clearAgentActivities}
														className="h-full"
													/>
												</div>
											</TabsContent>

											<TabsContent
												value="timeline"
												className="h-full m-0 data-[state=inactive]:hidden"
											>
												<div className="h-full p-4">
													<UnifiedTimeline
														entries={timeline}
														onClear={() => {
															clearTimeline();
															clearAgentActivities();
														}}
													/>
												</div>
											</TabsContent>
										</div>
									</Tabs>
								</div>
					</div>
				</main>
			</div>
		</div>
	);
}
