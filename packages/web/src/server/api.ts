import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type {
	NpmParserDef,
	ParsersConfig,
	SerializedArtifact,
} from "@struktur/sdk";
import {
	agent,
	detectMimeType,
	doublePass,
	doublePassAutoMerge,
	extract,
	getDefaultModel,
	hydrateSerializedArtifacts,
	listParsers,
	parallel,
	parallelAutoMerge,
	parsePdf,
	resolveAlias,
	resolveModel,
	runParser,
	sequential,
	sequentialAutoMerge,
	simple,
	splitTextIntoContents,
} from "@struktur/sdk";
import { getProviderEnvVar, useGlobalProviders } from "./config";

const CONFIG_DIR =
	process.env.STRUKTUR_CONFIG_DIR ??
	path.join(os.homedir(), ".config", "struktur");
const EXTRACTIONS_DIR = path.join(CONFIG_DIR, "extractions");

async function ensureExtractionsDir() {
	await mkdir(EXTRACTIONS_DIR, { recursive: true, mode: 0o700 });
}

function generateExtractionId() {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const random = Math.random().toString(36).slice(2, 8);
	return `${timestamp}-${random}`;
}

async function saveExtraction(
	id: string,
	data: {
		files: string[];
		schema: unknown;
		result: unknown;
		artifacts: SerializedArtifact[];
	},
) {
	await ensureExtractionsDir();
	const filepath = path.join(EXTRACTIONS_DIR, `${id}.json`);
	await writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
	return filepath;
}

// Map providers to their environment variable names
const PROVIDER_ENV_VARS: Record<string, string> = {
	openai: "OPENAI_API_KEY",
	anthropic: "ANTHROPIC_API_KEY",
	google: "GOOGLE_GENERATIVE_AI_API_KEY",
	opencode: "OPENCODE_API_KEY",
	openrouter: "OPENROUTER_API_KEY",
};

export async function parseFiles(
	files: File[],
	options: {
		images?: boolean;
		screenshots?: boolean;
		parser?: string;
	},
): Promise<SerializedArtifact[]> {
	const parsersConfig: ParsersConfig = await listParsers().catch(() => ({}));

	const artifacts: SerializedArtifact[] = [];

	for (const file of files) {
		const buffer = Buffer.from(await file.arrayBuffer());
		const filePath = file.name;

		// Detect MIME type
		const npmParserEntries = Object.entries(parsersConfig)
			.filter(
				(entry): entry is [string, NpmParserDef] => entry[1].type === "npm",
			)
			.map(([mimeType, def]) => ({ mimeType, def }));

		const mimeType = await detectMimeType({
			buffer,
			filePath,
			npmParsers: npmParserEntries,
		});

		if (!mimeType) {
			throw new Error(`Cannot detect MIME type for file "${file.name}"`);
		}

		// Resolve parser
		const effectiveParsers: ParsersConfig = { ...parsersConfig };
		if (options.parser) {
			effectiveParsers[mimeType] = { type: "npm", package: options.parser };
		}

		const parserDef = effectiveParsers[mimeType];

		let fileArtifacts: SerializedArtifact[] = [];

		if (parserDef) {
			const parsed = await runParser(
				parserDef,
				{ kind: "buffer", buffer },
				mimeType,
			);
			fileArtifacts = parsed.map((a) => serializeArtifact(a));
		} else if (mimeType === "application/pdf") {
			const parsed = await parsePdf(buffer, {
				includeImages: options.images ?? false,
				screenshots: options.screenshots ?? false,
			});
			fileArtifacts = [serializeArtifact(parsed)];
		} else if (mimeType.startsWith("text/")) {
			const text = buffer.toString();
			const contents = splitTextIntoContents(text);
			fileArtifacts = [
				{
					id: `artifact-${crypto.randomUUID()}`,
					type: "text",
					contents: contents.map((c) => ({
						...(c.page !== undefined ? { page: c.page } : {}),
						...(c.text !== undefined ? { text: c.text } : {}),
					})),
				},
			];
		} else if (mimeType.startsWith("image/")) {
			fileArtifacts = [
				{
					id: `artifact-${crypto.randomUUID()}`,
					type: "image",
					contents: [
						{ media: [{ type: "image", base64: buffer.toString("base64") }] },
					],
				},
			];
		} else {
			throw new Error(`No parser configured for MIME type "${mimeType}"`);
		}

		artifacts.push(...fileArtifacts);
	}

	return artifacts;
}

function serializeArtifact(artifact: any): SerializedArtifact {
	const contents = artifact.contents.map((c: any) => {
		const entry: any = {};
		if (c.page !== undefined) entry.page = c.page;
		if (c.text !== undefined) entry.text = c.text;
		if (c.media) {
			entry.media = c.media.map((m: any) => {
				const img: any = { type: "image" };
				if (m.url) img.url = m.url;
				if (m.base64) img.base64 = m.base64;
				if (m.contents) img.base64 = m.contents.toString("base64");
				if (m.text) img.text = m.text;
				if (m.width !== undefined) img.width = m.width;
				if (m.height !== undefined) img.height = m.height;
				if (m.imageType) img.imageType = m.imageType;
				return img;
			});
		}
		return entry;
	});

	const result: any = {
		id: artifact.id,
		type: artifact.type,
		contents,
	};

	if (artifact.metadata) {
		result.metadata = JSON.parse(JSON.stringify(artifact.metadata));
	}

	return result;
}

export type ExtractionEvent = {
	type:
		| "step"
		| "message"
		| "progress"
		| "tokenUsage"
		| "retry"
		| "complete"
		| "error"
		| "agent_tool_start"
		| "agent_tool_end"
		| "agent_message"
		| "agent_reasoning";
	data: unknown;
};

export async function extractData(
	artifacts: SerializedArtifact[],
	schemaMode: "json" | "fields",
	schemaJson: string | null,
	fields: string | null,
	modelSpec: string,
	strategyName: string,
	chunkSize: number,
	apiKey: string | undefined,
	onEvent?: (event: ExtractionEvent) => void | Promise<void>,
): Promise<{
	data: unknown;
	usage: { inputTokens: number; outputTokens: number };
}> {
	// Resolve alias first to get the actual model spec
	const resolvedModelSpec = await resolveAlias(modelSpec);

	// Determine provider from the resolved (not aliased) model spec
	const provider = resolvedModelSpec.split("/")[0];

	// Check if we're using global providers
	const globalProvidersEnabled = useGlobalProviders();

	// If global providers are not enabled, we MUST have a client-supplied API key
	if (!globalProvidersEnabled && !apiKey) {
		throw new Error(
			`No API key provided for ${provider}. Please add your API key in the provider settings, or ask the operator to enable global providers.`,
		);
	}

	// If global providers are enabled and no client key, check if the provider has a global key
	if (globalProvidersEnabled && !apiKey) {
		const envVar = getProviderEnvVar(provider);
		if (!envVar || !process.env[envVar]) {
			throw new Error(
				`Provider ${provider} is not configured. Please add your API key in the provider settings.`,
			);
		}
	}

	// If an API key is provided, set it as environment variable temporarily
	if (apiKey && provider && PROVIDER_ENV_VARS[provider]) {
		const envVar = PROVIDER_ENV_VARS[provider];
		process.env[envVar] = apiKey;
	}

	try {
		// Resolve model (already resolved alias above, but this also handles defaults)
		const resolvedModel =
			resolvedModelSpec || (await getDefaultModel()) || "openai/gpt-4o-mini";
		const modelString = await resolveAlias(resolvedModel);
		const model = await resolveModel(modelString);

		// Create strategy
		const strategy = createStrategy(strategyName, model, chunkSize, modelString);

		// Build schema
		let schema: any;
		if (schemaMode === "json" && schemaJson) {
			schema = JSON.parse(schemaJson);
		} else if (schemaMode === "fields" && fields) {
			schema = parseFieldsShorthand(fields);
		} else {
			throw new Error("Schema is required");
		}

		// Run extraction with events
		const hydratedArtifacts = await hydrateSerializedArtifacts(artifacts);
		const result = await extract({
			artifacts: hydratedArtifacts,
			schema,
			strategy,
			events: {
				onStep: async (info) => await onEvent?.({ type: "step", data: info }),
				onMessage: async (info) => await onEvent?.({ type: "message", data: info }),
				onProgress: async (info) => await onEvent?.({ type: "progress", data: info }),
				onTokenUsage: async (info) => await onEvent?.({ type: "tokenUsage", data: info }),
				onRetry: async (info) => await onEvent?.({ type: "retry", data: info }),
				// Agent-specific events for streaming UI
				onAgentToolStart: async (info) => {
					console.error(`[API] Received onAgentToolStart:`, info);
					await onEvent?.({ type: "agent_tool_start", data: info });
				},
				onAgentToolEnd: async (info) => {
					console.error(`[API] Received onAgentToolEnd:`, info);
					await onEvent?.({ type: "agent_tool_end", data: info });
				},
				onAgentMessage: async (info) => {
					console.error(`[API] Received onAgentMessage:`, info);
					await onEvent?.({ type: "agent_message", data: info });
				},
				onAgentReasoning: async (info) => {
					console.error(`[API] Received onAgentReasoning:`, info);
					await onEvent?.({ type: "agent_reasoning", data: info });
				},
			},
		});

		if (result.error) {
			onEvent?.({ type: "error", data: { message: result.error.message } });
			throw result.error;
		}

		onEvent?.({
			type: "complete",
			data: { result: { data: result.data, usage: result.usage } },
		});

		return {
			data: result.data,
			usage: result.usage,
		};
	} finally {
		// Clear the API key from environment (if we set it)
		if (apiKey && provider && PROVIDER_ENV_VARS[provider]) {
			const envVar = PROVIDER_ENV_VARS[provider];
			delete process.env[envVar];
		}
	}
}

function createStrategy(name: string, model: unknown, chunkSize: number, modelSpec?: string) {
	switch (name) {
		case "simple":
			return simple({ model });
		case "parallel":
			return parallel({ model, mergeModel: model, chunkSize });
		case "sequential":
			return sequential({ model, chunkSize });
		case "parallelAutoMerge":
			return parallelAutoMerge({ model, dedupeModel: model, chunkSize });
		case "sequentialAutoMerge":
			return sequentialAutoMerge({ model, dedupeModel: model, chunkSize });
		case "doublePass":
			return doublePass({ model, mergeModel: model, chunkSize });
		case "doublePassAutoMerge":
			return doublePassAutoMerge({ model, dedupeModel: model, chunkSize });
		case "agent":
			// Extract provider and modelId from modelSpec for agent strategy
			if (modelSpec) {
				const [provider, ...rest] = modelSpec.split("/");
				const modelId = rest.join("/");
				if (provider && modelId) {
					return agent({ provider, modelId });
				}
			}
			// Fallback to using the model object directly
			return agent({ model });
		default:
			throw new Error(`Unknown strategy: ${name}`);
	}
}

function parseFieldsShorthand(fields: string): any {
	const properties: any = {};
	const required: string[] = [];

	const parts = fields
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	for (const part of parts) {
		const match = part.match(/^(\w+)(?::(\w+))?(?:\{([^}]+)\})?$/);
		if (!match) continue;

		const [, name, type, subtype] = match;
		required.push(name);

		if (type === "number") {
			properties[name] = { type: "number" };
		} else if (type === "boolean") {
			properties[name] = { type: "boolean" };
		} else if (type === "array") {
			if (subtype) {
				if (subtype.includes("|")) {
					// enum array
					properties[name] = {
						type: "array",
						items: { enum: subtype.split("|") },
					};
				} else {
					// typed array
					properties[name] = {
						type: "array",
						items: { type: subtype },
					};
				}
			} else {
				properties[name] = { type: "array" };
			}
		} else if (type === "enum" && subtype) {
			properties[name] = { enum: subtype.split("|") };
		} else {
			properties[name] = { type: "string" };
		}
	}

	return {
		type: "object",
		properties,
		required,
	};
}

export { saveExtraction, generateExtractionId };
