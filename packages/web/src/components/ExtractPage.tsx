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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProviderId } from "@/lib/secure-storage";
import { ArtifactViewer } from "./ArtifactViewer";
import { useApiKeys } from "./auth/ApiKeyProvider";
import { ProviderSettings } from "./auth/ProviderSettings";
import { Logo } from "./Logo";
import { OutputViewer } from "./OutputViewer";
import { Sidebar } from "./Sidebar";
import { type TimelineEntry, UnifiedTimeline } from "./UnifiedTimeline";

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

// Extract provider from model string (e.g., "openai/gpt-4o" -> "openai")
function getProviderFromModel(model: string): ProviderId | null {
	if (!model) return null;
	const provider = model.split("/")[0];
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
	const [files, setFiles] = useState<File[]>([]);
	const [schemaMode, setSchemaMode] = useState<SchemaMode>("fields");
	const [schemaJson, setSchemaJson] = useState("");
	const [fields, setFields] = useState("");
	const [model, setModel] = useState("");
	const [strategy, setStrategy] = useState<string>("simple");
	const [chunkSize, setChunkSize] = useState(120000);
	const [activeTab, setActiveTab] = useState<"result" | "timeline">("result");
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

	const abortControllerRef = useRef<AbortController | null>(null);
	const chunkSizeDebounceRef = useRef<NodeJS.Timeout | null>(null);

	const {
		isUnlocked,
		storedProviders,
		saveApiKey,
		getApiKey,
		removeApiKey,
		lock,
		requestUnlock,
	} = useApiKeys();

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

	const canExtract =
		files.length > 0 &&
		(schemaMode === "file" ||
			(schemaMode === "json" && schemaJson.trim().length > 0) ||
			(schemaMode === "fields" && fields.trim().length > 0));

	const handleParse = useCallback(async () => {
		if (files.length === 0) return;

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

			setArtifacts(response.artifacts as Artifact[]);
			updateTimelineEntry(stepId, { status: "completed", endTimestamp: new Date(), metadata: { artifactCount: response.artifacts.length } });
			setStatus("success");
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			updateTimelineEntry(stepId, { status: "error", endTimestamp: new Date(), details: error.message });
			setStatus("error");
		}
	}, [files, parsingOptions, addTimelineEntry, updateTimelineEntry]);

	const handleExtract = async () => {
		if (files.length === 0) return;
		if (schemaMode === "json" && !schemaJson.trim()) return;
		if (schemaMode === "fields" && !fields.trim()) return;

		abortControllerRef.current = new AbortController();

		setStatus("extracting");
		setError(null);
		setResult(null);

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
			const provider = getProviderFromModel(model);
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
							} else {
								addTimelineEntry(
									"action",
									"other",
									stepData.label,
									data.data,
									"running",
								);
							}
							break;
						}

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

	useEffect(() => {
		if (files.length > 0 && status === "idle") {
			handleParse();
		}
	}, [files, status, handleParse]);

	const hasParsed = artifacts.length > 0;

	return (
		<div className="h-screen bg-[#f5efe6] flex flex-col">
			<header className="border-b border-[#d4c8b8] pl-0 pr-6 py-0 bg-[#ede5d8] flex items-center justify-between flex-shrink-0 z-10">
				<div className="flex items-center">
					<Logo />

					<div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-[#d4c8b8]">
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

				<div className="flex items-center gap-4">
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
								<Card className="mb-6 border-[#c4a8a8] bg-[#f5e6e6]">
									<CardContent className="py-4">
										<div className="flex items-start gap-3">
											<AlertCircle className="h-5 w-5 text-[#a05c5c] flex-shrink-0 mt-0.5" />
											<div>
												<div className="font-medium text-[#8a4a4a]">Error</div>
												<div className="text-sm text-[#7a5c5c] mt-1">
													{error.message}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
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
								onValueChange={(v) => setActiveTab(v as "result" | "timeline")}
								className="flex flex-col h-full"
							>
								<div className="flex items-center justify-between p-4 border-b border-[#d4c8b8] flex-shrink-0">
									<h2 className="text-sm font-semibold text-[#2d1b0e] uppercase tracking-wider">
										Output
									</h2>
									<TabsList>
										<TabsTrigger value="result">Result</TabsTrigger>
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
										value="timeline"
										className="h-full m-0 data-[state=inactive]:hidden"
									>
										<div className="h-full p-4">
											<UnifiedTimeline
												entries={timeline}
												onClear={clearTimeline}
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
