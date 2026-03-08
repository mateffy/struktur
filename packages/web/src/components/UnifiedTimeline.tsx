import {
	ArrowRight,
	CheckCircle2,
	ChevronDown,
	Circle,
	Clock,
	FileText,
	Loader2,
	RotateCcw,
	Search,
	Trash2,
	XCircle,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TimelineEntryStatus = "pending" | "running" | "completed" | "error";

export type TimelineEntry = {
	id: string;
	timestamp: Date;
	endTimestamp?: Date;
	type: "action" | "info" | "warning" | "error";
	status: TimelineEntryStatus;
	action: "parse" | "extract" | "chunk" | "merge" | "validate" | "other";
	message: string;
	details?: string;
	data?: unknown;
	metadata?: {
		fileCount?: number;
		artifactCount?: number;
		strategy?: string;
		model?: string;
		tokenCount?: number;
		duration?: number;
		progress?: number;
		totalSteps?: number;
		currentStep?: number;
	};
};

type UnifiedTimelineProps = {
	entries: TimelineEntry[];
	onClear?: () => void;
};

const ACTION_CONFIG = {
	parse: {
		label: "Parse",
		icon: FileText,
		color: "#7a5c3a",
		bgColor: "bg-[#7a5c3a]/10",
		borderColor: "border-l-[#7a5c3a]",
	},
	extract: {
		label: "Extract",
		icon: Zap,
		color: "#5c8a5c",
		bgColor: "bg-[#5c8a5c]/10",
		borderColor: "border-l-[#5c8a5c]",
	},
	chunk: {
		label: "Chunk",
		icon: Clock,
		color: "#a0926f",
		bgColor: "bg-[#a0926f]/10",
		borderColor: "border-l-[#a0926f]",
	},
	merge: {
		label: "Merge",
		icon: RotateCcw,
		color: "#7a5c3a",
		bgColor: "bg-[#7a5c3a]/10",
		borderColor: "border-l-[#7a5c3a]",
	},
	validate: {
		label: "Validate",
		icon: CheckCircle2,
		color: "#5c8a5c",
		bgColor: "bg-[#5c8a5c]/10",
		borderColor: "border-l-[#5c8a5c]",
	},
	other: {
		label: "Action",
		icon: Circle,
		color: "#a0926f",
		bgColor: "bg-[#a0926f]/10",
		borderColor: "border-l-[#a0926f]",
	},
};

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function StatusIcon({
	status,
	color,
}: { status: TimelineEntryStatus; color: string }) {
	switch (status) {
		case "running":
			return <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color }} />;
		case "completed":
			return <CheckCircle2 className="h-3.5 w-3.5" style={{ color }} />;
		case "error":
			return <XCircle className="h-3.5 w-3.5 text-[#a05c5c]" />;
		case "pending":
			return (
				<Circle className="h-3.5 w-3.5 text-[#a0926f]" />
			);
		default:
			return null;
	}
}

function StatusBadge({ status }: { status: TimelineEntryStatus }) {
	const styles = {
		pending: "bg-[#d4c8b8]/50 text-[#a0926f]",
		running: "bg-[#7a5c3a]/15 text-[#7a5c3a]",
		completed: "bg-[#5c8a5c]/15 text-[#5c8a5c]",
		error: "bg-[#a05c5c]/15 text-[#a05c5c]",
	};

	return (
		<span
			className={cn(
				"text-[10px] font-medium px-1.5 py-0.5 rounded",
				styles[status],
			)}
		>
			{status}
		</span>
	);
}

export function UnifiedTimeline({ entries, onClear }: UnifiedTimelineProps) {
	const [filter, setFilter] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	// Reverse entries so newest is first
	const filteredEntries = useMemo(() => {
		const reversed = [...entries].reverse();
		if (!filter) return reversed;
		const lowerFilter = filter.toLowerCase();
		return reversed.filter(
			(entry) =>
				entry.message.toLowerCase().includes(lowerFilter) ||
				entry.action.toLowerCase().includes(lowerFilter),
		);
	}, [entries, filter]);

	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-[300px] text-[#a0926f]">
				<div className="w-12 h-12 rounded-full bg-[#ede5d8] flex items-center justify-center mb-3">
					<Clock className="h-5 w-5 opacity-50" />
				</div>
				<p className="text-sm font-medium">No activity yet</p>
				<p className="text-xs mt-1 opacity-70">
					Start parsing or extracting to see the timeline
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-[#f5efe6]">
			{/* Header */}
			<div className="flex items-center gap-2 mb-3 flex-shrink-0">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a0926f]" />
					<Input
						placeholder="Filter..."
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="pl-8 h-8 bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] text-sm focus-visible:ring-[#7a5c3a]"
					/>
				</div>
				{onClear && (
					<Button
						variant="outline"
						size="sm"
						onClick={onClear}
						className="h-8 px-2 bg-[#ede5d8] border-[#d4c8b8] text-[#a0926f] hover:text-[#a05c5c] hover:bg-[#f5e6e6] hover:border-[#a05c5c]"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-y-auto pr-1 space-y-2">
				{filteredEntries.map((entry, index) => {
					const config = ACTION_CONFIG[entry.action];
					const Icon = config.icon;
					const isExpanded = expandedId === entry.id;
					const isRunning = entry.status === "running";
					const hasData = entry.data !== undefined;
					const duration =
						entry.endTimestamp && entry.timestamp
							? entry.endTimestamp.getTime() - entry.timestamp.getTime()
							: undefined;
					const isFirst = index === 0;

					return (
						<div
							key={entry.id}
							className={cn(
								"group relative flex gap-3 p-3 rounded-lg border-l-4 bg-[#ede5d8] border-[#d4c8b8] transition-all",
								config.borderColor,
								isRunning && "ring-1 ring-[#7a5c3a]/20 shadow-sm",
								!isFirst && "opacity-75 hover:opacity-100",
							)}
						>
							{/* Connector line to next item (visual only, below) */}
							{!isFirst && (
								<div className="absolute left-[21px] -top-2 w-[1.5px] h-4 bg-[#d4c8b8]/60" />
							)}

							{/* Icon */}
							<div
								className={cn(
									"flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
									config.bgColor,
								)}
							>
								{isRunning ? (
									<StatusIcon status="running" color={config.color} />
								) : (
									<Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
								)}
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0">
								{/* Header row */}
								<div className="flex items-center gap-2 flex-wrap">
									<span className="text-xs font-semibold text-[#2d1b0e]">
										{config.label}
									</span>
									<ArrowRight className="h-3 w-3 text-[#a0926f]" />
									<span className="text-sm text-[#2d1b0e] truncate">
										{entry.message}
									</span>
								</div>

								{/* Meta row */}
								<div className="flex items-center gap-2 mt-1 flex-wrap">
									<StatusBadge status={entry.status} />

									<span className="text-[10px] text-[#a0926f] font-mono">
										{formatTime(entry.timestamp)}
									</span>

									{duration && entry.status !== "running" && (
										<span className="text-[10px] text-[#5c8a5c]">
											{formatDuration(duration)}
										</span>
									)}

									{entry.metadata?.fileCount && (
										<span className="text-[10px] text-[#7a5c3a]">
											{entry.metadata.fileCount} files
										</span>
									)}

									{entry.metadata?.artifactCount && (
										<span className="text-[10px] text-[#7a5c3a]">
											{entry.metadata.artifactCount} artifacts
										</span>
									)}

									{entry.metadata?.tokenCount && (
										<span className="text-[10px] text-[#2d1b0e]">
											{entry.metadata.tokenCount.toLocaleString()} tokens
										</span>
									)}
								</div>

								{/* Running progress */}
								{isRunning && entry.metadata && (
									<div className="mt-2 space-y-1">
										{entry.metadata.currentStep !== undefined &&
											entry.metadata.totalSteps && (
												<div className="flex items-center gap-2">
													<div className="flex-1 h-1 bg-[#d4c8b8] rounded-full overflow-hidden">
														<div
															className="h-full bg-[#7a5c3a] rounded-full transition-all duration-300"
															style={{
																width: `${(entry.metadata.currentStep / entry.metadata.totalSteps) * 100}%`,
															}}
														/>
													</div>
													<span className="text-[10px] text-[#a0926f] tabular-nums">
														{entry.metadata.currentStep}/{entry.metadata.totalSteps}
													</span>
												</div>
											)}
										{entry.metadata.strategy && (
											<span className="text-[10px] text-[#a0926f]">
												via {entry.metadata.strategy}
												{entry.metadata.model && ` • ${entry.metadata.model}`}
											</span>
										)}
									</div>
								)}

								{/* Details text */}
								{entry.details && (
									<p className="mt-1.5 text-xs text-[#7a5c3a]">{entry.details}</p>
								)}

								{/* Expandable data */}
								{hasData && (
									<div className="mt-2">
										<button
											type="button"
											onClick={() =>
												setExpandedId(isExpanded ? null : entry.id)
											}
											className="flex items-center gap-1 text-[10px] text-[#7a5c3a] hover:text-[#2d1b0e] transition-colors"
										>
											<ChevronDown
												className={cn(
													"h-3 w-3 transition-transform",
													!isExpanded && "-rotate-90",
												)}
											/>
											{isExpanded ? "Hide details" : "Show details"}
										</button>

										{isExpanded && (
											<pre className="mt-2 p-2.5 rounded bg-[#f5efe6] border border-[#d4c8b8] overflow-auto text-[10px] font-mono text-[#2d1b0e]">
												{JSON.stringify(entry.data, null, 2)}
											</pre>
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
