import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	ExecutionStatus,
	ExtractionResult,
	ProgressInfo,
} from "./ExtractPage";

type OutputViewProps = {
	status: ExecutionStatus;
	progress: ProgressInfo;
	artifacts: unknown[];
	result: ExtractionResult | null;
	error: Error | null;
	savedPath: string;
};

export function OutputView({
	status,
	progress,
	artifacts,
	result,
	error,
	savedPath,
}: OutputViewProps) {
	const [activeTab, setActiveTab] = useState("progress");

	if (status === "idle") {
		return (
			<Card>
				<CardContent className="py-16 text-center">
					<p className="text-muted-foreground">
						No output yet. Upload files and run an extraction to see results
						here.
					</p>
				</CardContent>
			</Card>
		);
	}

	const renderProgressContent = () => {
		if (status === "parsing") {
			return (
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span className="font-medium">Parsing files...</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Converting your files into the artifact format
					</p>
				</div>
			);
		}

		if (status === "extracting") {
			return (
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span className="font-medium">Extracting data...</span>
					</div>

					{progress.step && (
						<p className="text-sm text-muted-foreground">{progress.step}</p>
					)}

					{progress.total && progress.current !== undefined && (
						<div className="space-y-2">
							<div className="h-2 bg-secondary rounded-full overflow-hidden">
								<div
									className="h-full bg-primary transition-all"
									style={{
										width: `${(progress.current / progress.total) * 100}%`,
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								{progress.current} / {progress.total}
							</p>
						</div>
					)}

					{progress.retryAttempt && progress.retryMax && (
						<div className="inline-flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800">
							<AlertCircle className="h-4 w-4" />
							Retry attempt {progress.retryAttempt}/{progress.retryMax}
						</div>
					)}
				</div>
			);
		}

		if (status === "success") {
			return (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5 text-green-600" />
						<span className="font-medium text-green-600">Complete</span>
					</div>

					{result && (
						<div className="text-sm text-muted-foreground space-y-1">
							<p>
								Tokens: {result.usage.inputTokens.toLocaleString()} input /{" "}
								{result.usage.outputTokens.toLocaleString()} output
							</p>
							{savedPath && <p className="text-xs">Saved to: {savedPath}</p>}
						</div>
					)}

					{artifacts.length > 0 && (
						<p className="text-sm text-muted-foreground">
							{artifacts.length} artifact{artifacts.length !== 1 ? "s" : ""}{" "}
							generated
						</p>
					)}
				</div>
			);
		}

		if (status === "error") {
			return (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<XCircle className="h-5 w-5 text-destructive" />
						<span className="font-medium text-destructive">Failed</span>
					</div>

					<div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
						<p className="text-sm font-mono text-destructive">
							{error?.message || "Unknown error"}
						</p>
					</div>
				</div>
			);
		}

		return null;
	};

	const renderJsonContent = () => {
		if (!result && artifacts.length === 0) {
			return <p className="text-muted-foreground">No data available yet</p>;
		}

		const data = result?.data || artifacts;
		const json = JSON.stringify(data, null, 2);

		return (
			<div className="space-y-3">
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigator.clipboard.writeText(json)}
					>
						Copy
					</Button>
				</div>
				<pre className="rounded-md bg-muted p-4 overflow-auto max-h-[400px] text-xs font-mono">
					{json}
				</pre>
			</div>
		);
	};

	const renderFormattedContent = () => {
		if (!result?.data) {
			return (
				<p className="text-muted-foreground">No extraction result available</p>
			);
		}

		return (
			<div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
				<FormattedData data={result.data} />
			</div>
		);
	};

	return (
		<Card>
			<CardHeader>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="progress">Progress</TabsTrigger>
						<TabsTrigger value="json">JSON Output</TabsTrigger>
						<TabsTrigger value="formatted">Formatted</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent>
				{activeTab === "progress" && renderProgressContent()}
				{activeTab === "json" && renderJsonContent()}
				{activeTab === "formatted" && renderFormattedContent()}
			</CardContent>
		</Card>
	);
}

function FormattedData({ data, depth = 0 }: { data: unknown; depth?: number }) {
	if (data === null || data === undefined) {
		return <span className="text-muted-foreground">{String(data)}</span>;
	}

	if (typeof data === "boolean") {
		return <span className="text-green-600">{data ? "true" : "false"}</span>;
	}

	if (typeof data === "number") {
		return <span className="text-blue-600">{data}</span>;
	}

	if (typeof data === "string") {
		return <span className="text-orange-600">"{data}"</span>;
	}

	if (Array.isArray(data)) {
		if (data.length === 0) {
			return <span className="text-muted-foreground">[]</span>;
		}

		return (
			<div>
				<span className="text-muted-foreground">[</span>
				{data.map((item, index) => (
					<div key={index} style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
						<FormattedData data={item} depth={depth + 1} />
						{index < data.length - 1 && <span>,</span>}
					</div>
				))}
				<span className="text-muted-foreground">]</span>
			</div>
		);
	}

	if (typeof data === "object") {
		const entries = Object.entries(data as Record<string, unknown>);
		if (entries.length === 0) {
			return <span className="text-muted-foreground">{"{}"}</span>;
		}

		return (
			<div>
				<span className="text-muted-foreground">{"{"}</span>
				{entries.map(([key, value], index) => (
					<div key={key} style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
						<span className="text-purple-600">{key}</span>
						<span>: </span>
						<FormattedData data={value} depth={depth + 1} />
						{index < entries.length - 1 && <span>,</span>}
					</div>
				))}
				<span className="text-muted-foreground">{"}"}</span>
			</div>
		);
	}

	return <span>{String(data)}</span>;
}
