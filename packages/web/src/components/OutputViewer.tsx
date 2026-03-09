import { CheckCircle, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchemaForm } from "./SchemaForm";

// Warm parchment color palette for JSON syntax highlighting
const JSON_COLORS = {
	bracket: "#7a5c3a",      // Brown for brackets/punctuation
	key: "#2d1b0e",          // Dark brown for keys
	string: "#5c8a5c",       // Green for strings
	number: "#7a5c3a",       // Brown for numbers
	boolean: "#a05c5c",      // Red for booleans/null
	text: "#2d1b0e",         // Dark brown for text
};

type OutputViewerProps = {
	data: unknown;
	schema?: unknown;
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
	model?: string;
	schemaMode?: "json" | "fields";
	fields?: string;
};

export function OutputViewer({
	data,
	schema: explicitSchema,
	usage,
	model,
	schemaMode,
	fields,
}: OutputViewerProps) {
	const [viewMode, setViewMode] = useState<"json" | "form">("form");
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(JSON.stringify(data, null, 2));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownload = () => {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "extraction-result.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	const calculateCost = (
		inputTokens: number,
		outputTokens: number,
		modelId?: string,
	): number | null => {
		if (!modelId) return null;

		// Pricing per 1M tokens (in USD)
		const pricing: Record<string, { input: number; output: number }> = {
			// OpenAI
			"gpt-4o": { input: 2.5, output: 10 },
			"gpt-4o-mini": { input: 0.15, output: 0.6 },
			"gpt-4-turbo": { input: 10, output: 30 },
			"gpt-4": { input: 30, output: 60 },
			"gpt-3.5-turbo": { input: 0.5, output: 1.5 },
			// Anthropic
			"claude-3-5-sonnet": { input: 3, output: 15 },
			"claude-3-5-haiku": { input: 1, output: 5 },
			"claude-3-opus": { input: 15, output: 75 },
			"claude-3-sonnet": { input: 3, output: 15 },
			"claude-3-haiku": { input: 0.25, output: 1.25 },
			// Google
			"gemini-1.5-pro": { input: 3.5, output: 10.5 },
			"gemini-1.5-flash": { input: 0.075, output: 0.3 },
			// Defaults
			default: { input: 2.5, output: 10 },
		};

		// Find matching model pricing
		let matchedPricing = pricing.default;
		for (const [key, value] of Object.entries(pricing)) {
			if (modelId.toLowerCase().includes(key.toLowerCase())) {
				matchedPricing = value;
				break;
			}
		}

		const inputCost = (inputTokens / 1000000) * matchedPricing.input;
		const outputCost = (outputTokens / 1000000) * matchedPricing.output;

		return inputCost + outputCost;
	};

	// Parse fields shorthand into JSON schema
	const parseFieldsShorthand = (fieldsStr: string): object => {
		const properties: Record<string, any> = {};
		const required: string[] = [];

		const parts = fieldsStr
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
	};

	// Get effective schema - either explicit or generated from fields
	const getEffectiveSchema = (): object | null => {
		if (explicitSchema) {
			return explicitSchema as object;
		}
		if (schemaMode === "fields" && fields) {
			return parseFieldsShorthand(fields);
		}
		return null;
	};

	// JSON syntax highlighting with warm colors
	const renderJsonValue = (value: unknown, depth = 0): React.ReactNode => {
		if (value === null || value === undefined) {
			return (
				<span style={{ color: JSON_COLORS.boolean }} className="font-medium">
					null
				</span>
			);
		}

		if (typeof value === "boolean") {
			return (
				<span style={{ color: JSON_COLORS.boolean }} className="font-medium">
					{String(value)}
				</span>
			);
		}

		if (typeof value === "number") {
			return (
				<span style={{ color: JSON_COLORS.number }} className="font-medium">
					{String(value)}
				</span>
			);
		}

		if (typeof value === "string") {
			return (
				<span style={{ color: JSON_COLORS.string }}>
					&quot;{String(value)}&quot;
				</span>
			);
		}

		if (Array.isArray(value)) {
			if (value.length === 0) {
				return (
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						[]
					</span>
				);
			}

			let itemNum = 0;
			return (
				<div className="font-mono text-xs leading-relaxed">
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						[
					</span>
					{value.map((item) => {
						const currentNum = itemNum++;
						return (
							<div
								key={`arr-${depth}-${currentNum}`}
								style={{ paddingLeft: `${(depth + 1) * 16}px` }}
							>
								{renderJsonValue(item, depth + 1)}
								{currentNum < value.length - 1 && (
									<span style={{ color: JSON_COLORS.bracket }}>,</span>
								)}
							</div>
						);
					})}
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						]
					</span>
				</div>
			);
		}

		if (typeof value === "object") {
			const entries = Object.entries(value as Record<string, unknown>);
			if (entries.length === 0) {
				return (
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						{"{ }"}
					</span>
				);
			}

			return (
				<div className="font-mono text-xs leading-relaxed">
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						{"{"}
					</span>
					{entries.map(([key, val], index) => (
						<div key={key} style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
							<span style={{ color: JSON_COLORS.key }} className="font-medium">
								{key}
							</span>
							<span style={{ color: JSON_COLORS.bracket }}>: </span>
							{renderJsonValue(val, depth + 1)}
							{index < entries.length - 1 && (
								<span style={{ color: JSON_COLORS.bracket }}>,</span>
							)}
						</div>
					))}
					<span style={{ color: JSON_COLORS.bracket }} className="font-medium">
						{"}"}
					</span>
				</div>
			);
		}

		return <span>{String(value)}</span>;
	};

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-[#a0926f]">
				<CheckCircle className="h-12 w-12 mb-3 opacity-50" />
				<p className="text-sm">No output data yet</p>
			</div>
		);
	}

	const cost = usage
		? calculateCost(usage.inputTokens, usage.outputTokens, model)
		: null;

	const effectiveSchema = getEffectiveSchema();

	return (
		<div className="space-y-4 h-full flex flex-col">
			{usage && (
				<div className="flex items-center gap-4 text-sm text-[#7a5c3a] flex-shrink-0">
					<div>
						<span className="font-medium text-[#2d1b0e]">Input:</span>{" "}
						{usage.inputTokens.toLocaleString()} tokens
					</div>
					<div>
						<span className="font-medium text-[#2d1b0e]">Output:</span>{" "}
						{usage.outputTokens.toLocaleString()} tokens
					</div>
					{cost !== null && (
						<div>
							<span className="font-medium text-[#2d1b0e]">Cost:</span> ${cost.toFixed(4)}
						</div>
					)}
				</div>
			)}

			<Tabs
				value={viewMode}
				onValueChange={(v) => setViewMode(v as "json" | "form")}
				className="flex-1 flex flex-col"
			>
				<div className="flex items-center justify-between mb-3 flex-shrink-0">
					<TabsList className="bg-[#ede5d8]">
						<TabsTrigger 
							value="form" 
							className="data-[state=active]:bg-[#f5efe6] data-[state=active]:text-[#2d1b0e]"
						>
							Form View
						</TabsTrigger>
						<TabsTrigger 
							value="json"
							className="data-[state=active]:bg-[#f5efe6] data-[state=active]:text-[#2d1b0e]"
						>
							JSON
						</TabsTrigger>
					</TabsList>
					<div className="flex gap-2">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={handleCopy}
							className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8]"
						>
							{copied ? (
								<CheckCircle className="h-4 w-4 mr-2 text-[#5c8a5c]" />
							) : (
								<Copy className="h-4 w-4 mr-2" />
							)}
							{copied ? "Copied!" : "Copy"}
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={handleDownload}
							className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8]"
						>
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					</div>
				</div>

				<TabsContent value="json" className="mt-0 flex-1 overflow-hidden">
					<div 
						className="rounded-lg border border-[#d4c8b8] p-4 overflow-auto max-h-full h-full bg-[#faf8f3]"
						style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", monospace' }}
					>
						{renderJsonValue(data)}
					</div>
				</TabsContent>

				<TabsContent value="form" className="mt-0 flex-1 overflow-hidden">
					<div className="rounded-lg border border-[#d4c8b8] p-4 overflow-auto max-h-full h-full bg-[#faf8f3]">
						{effectiveSchema ? (
							<SchemaForm 
								schema={effectiveSchema as any} 
								data={data} 
							/>
						) : (
							<div className="text-[#a0926f] text-center py-8">
								<p>No schema available - showing raw JSON</p>
								<div className="mt-4 text-xs" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
									{renderJsonValue(data)}
								</div>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
