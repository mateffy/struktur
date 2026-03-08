import { CheckCircle, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
	const [viewMode, setViewMode] = useState<"json" | "schema">("schema");
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

	const renderJsonValue = (value: unknown, depth = 0): React.ReactNode => {
		if (value === null || value === undefined) {
			return <span className="text-muted-foreground">{String(value)}</span>;
		}

		if (typeof value === "boolean") {
			return (
				<span className="text-green-600 font-medium">{String(value)}</span>
			);
		}

		if (typeof value === "number") {
			return <span className="text-blue-600 font-medium">{String(value)}</span>;
		}

		if (typeof value === "string") {
			return <span className="text-orange-600">"{String(value)}"</span>;
		}

		if (Array.isArray(value)) {
			if (value.length === 0) {
				return <span className="text-muted-foreground">[]</span>;
			}

			let itemNum = 0;
			return (
				<div>
					<span className="text-muted-foreground">[</span>
					{value.map((item) => {
						const currentNum = itemNum++;
						return (
							<div
								key={`arr-${depth}-${currentNum}`}
								style={{ paddingLeft: `${(depth + 1) * 16}px` }}
							>
								{renderJsonValue(item, depth + 1)}
								{currentNum < value.length - 1 && (
									<span className="text-muted-foreground">,</span>
								)}
							</div>
						);
					})}
					<span className="text-muted-foreground">]</span>
				</div>
			);
		}

		if (typeof value === "object") {
			const entries = Object.entries(value as Record<string, unknown>);
			if (entries.length === 0) {
				return <span className="text-muted-foreground">{"{}"}</span>;
			}

			return (
				<div>
					<span className="text-muted-foreground">{"{"}</span>
					{entries.map(([key, val], index) => (
						<div key={key} style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
							<span className="text-purple-600 font-medium">{key}</span>
							<span className="text-muted-foreground">: </span>
							{renderJsonValue(val, depth + 1)}
							{index < entries.length - 1 && (
								<span className="text-muted-foreground">,</span>
							)}
						</div>
					))}
					<span className="text-muted-foreground">{"}"}</span>
				</div>
			);
		}

		return <span>{String(value)}</span>;
	};

	const renderSchemaBasedView = () => {
		const effectiveSchema = getEffectiveSchema();

		if (!effectiveSchema || !data) {
			return (
				<div className="text-muted-foreground text-center py-8">
					{!effectiveSchema ? "No schema available" : "No data available"}
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="rounded-md bg-[#f5efe6] border border-[#d4c8b8] p-3 overflow-auto max-h-[200px]">
					<div className="text-xs font-medium text-[#7a5c3a] mb-2">
						Generated Schema
					</div>
					<pre className="text-xs font-mono text-[#2d1b0e]">
						{JSON.stringify(effectiveSchema, null, 2)}
					</pre>
				</div>
				<div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
					{renderJsonValue(data)}
				</div>
			</div>
		);
	};

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
				<CheckCircle className="h-12 w-12 mb-3 opacity-50" />
				<p className="text-sm">No output data yet</p>
			</div>
		);
	}

	const cost = usage
		? calculateCost(usage.inputTokens, usage.outputTokens, model)
		: null;

	return (
		<div className="space-y-4">
			{usage && (
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div>
						<span className="font-medium">Input:</span>{" "}
						{usage.inputTokens.toLocaleString()} tokens
					</div>
					<div>
						<span className="font-medium">Output:</span>{" "}
						{usage.outputTokens.toLocaleString()} tokens
					</div>
					{cost !== null && (
						<div>
							<span className="font-medium">Cost:</span> ${cost.toFixed(4)}
						</div>
					)}
				</div>
			)}

			<Tabs
				value={viewMode}
				onValueChange={(v) => setViewMode(v as "json" | "schema")}
			>
				<div className="flex items-center justify-between mb-4">
					<TabsList>
						<TabsTrigger value="schema">Schema View</TabsTrigger>
						<TabsTrigger value="json">JSON</TabsTrigger>
					</TabsList>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={handleCopy}>
							{copied ? (
								<CheckCircle className="h-4 w-4 mr-2 text-green-600" />
							) : (
								<Copy className="h-4 w-4 mr-2" />
							)}
							{copied ? "Copied!" : "Copy"}
						</Button>
						<Button variant="outline" size="sm" onClick={handleDownload}>
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					</div>
				</div>

				<TabsContent value="json" className="mt-0">
					<div className="rounded-md bg-muted p-4 overflow-auto max-h-[600px] text-xs font-mono">
						{renderJsonValue(data)}
					</div>
				</TabsContent>

				<TabsContent value="schema" className="mt-0">
					{renderSchemaBasedView()}
				</TabsContent>
			</Tabs>
		</div>
	);
}
