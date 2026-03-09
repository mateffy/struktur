import * as SliderPrimitive from "@radix-ui/react-slider";
import { Camera, Check, Image, Loader2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ModelSelectorComponent } from "./model/ModelSelector";

export type ExtractionSettingsProps = {
	model: string;
	strategy: string;
	chunkSize: number;
	parsingOptions: {
		images: boolean;
		screenshots: boolean;
		parser: string;
	};
	chunkingOptions: {
		maxImages: number | null;
		textRatio: number;
		imageTokens: number;
		filterEmbedded: boolean;
		filterScreenshot: boolean;
	};
	isChunkingLoading?: boolean;
	/** Optional: Check if API key exists for the selected model - used to show validation errors */
	hasKeyForModel?: (model: string) => boolean;
	onModelChange: (model: string) => void;
	onStrategyChange: (strategy: string) => void;
	onChunkSizeChange: (size: number) => void;
	onParsingOptionsChange: (
		options: ExtractionSettingsProps["parsingOptions"],
	) => void;
	onChunkingOptionsChange: (
		options: ExtractionSettingsProps["chunkingOptions"],
	) => void;
};

const STRATEGIES = [
	{ value: "simple", label: "Simple", description: "Single extraction pass" },
	{
		value: "parallel",
		label: "Parallel",
		description: "Chunk and process in parallel",
	},
	{
		value: "sequential",
		label: "Sequential",
		description: "Chunk and process sequentially",
	},
	{
		value: "parallelAutoMerge",
		label: "Parallel + Auto-merge",
		description: "Parallel with deduplication",
	},
	{
		value: "sequentialAutoMerge",
		label: "Sequential + Auto-merge",
		description: "Sequential with deduplication",
	},
	{
		value: "doublePass",
		label: "Double Pass",
		description: "Extract then refine",
	},
	{
		value: "doublePassAutoMerge",
		label: "Double Pass + Auto-merge",
		description: "Extract, refine, and dedupe",
	},
];

interface ToggleCardProps {
	icon: React.ReactNode;
	label: string;
	description: string;
	active: boolean;
	onClick: () => void;
}

function ToggleCard({
	icon,
	label,
	description,
	active,
	onClick,
}: ToggleCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left cursor-pointer bg-[#f5efe6] ${
				active
					? "border-[#5c8a5c]/40 hover:bg-[#e5dccf]"
					: "border-[#d4c8b8] hover:border-[#5c8a5c]/30 hover:bg-[#ede5d8]"
			}`}
		>
			<div
				className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
					active ? "bg-transparent" : "bg-[#ede5d8] text-[#7a5c3a]"
				}`}
			>
				{active ? <Check className="w-4 h-4 text-[#5c8a5c]" /> : icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span
						className={`font-medium text-sm ${active ? "text-[#5c8a5c]" : "text-[#2d1b0e]"}`}
					>
						{label}
					</span>
				</div>
				<p className="text-[11px] text-[#7a5c3a]/70 leading-snug">
					{description}
				</p>
			</div>
		</button>
	);
}

function CompactInputSlider({
	value,
	onChange,
	min,
	max,
	unit,
	isLoading,
	exponential = false,
	exponentialMin = 100,
	exponentialMax = 2000000,
	showInputInHeader = false,
	headerLabel,
}: {
	value: number;
	onChange: (val: number) => void;
	min: number;
	max: number;
	step?: number;
	unit?: string;
	isLoading?: boolean;
	exponential?: boolean;
	exponentialMin?: number;
	exponentialMax?: number;
	showInputInHeader?: boolean;
	headerLabel?: string;
}) {
	// Memoize the log calculations for exponential scale
	const { logMin, logMax } = useMemo(() => {
		if (!exponential) return { logMin: 0, logMax: 0 };
		return {
			logMin: Math.log10(exponentialMin),
			logMax: Math.log10(exponentialMax),
		};
	}, [exponential, exponentialMin, exponentialMax]);

	// Convert real value to slider position (0-100 scale)
	const valueToSlider = useCallback(
		(val: number) => {
			if (!exponential) return val;
			const logVal = Math.log10(val);
			return ((logVal - logMin) / (logMax - logMin)) * 100;
		},
		[exponential, logMin, logMax],
	);

	// Convert slider position (0-100) to real value
	const sliderToValue = useCallback(
		(pos: number) => {
			if (!exponential) return pos;
			const logVal = (pos / 100) * (logMax - logMin) + logMin;
			return Math.round(10 ** logVal);
		},
		[exponential, logMin, logMax],
	);

	const [localValue, setLocalValue] = useState(value);
	const [inputValue, setInputValue] = useState(value.toString());
	const [sliderPosition, setSliderPosition] = useState(() =>
		valueToSlider(value),
	);
	const [isDebouncing, setIsDebouncing] = useState(false);
	const userInteractingRef = useRef(false);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const scheduledValueRef = useRef<number | null>(null);
	const lastPropValueRef = useRef(value);

	// Track prop value changes and sync only when meaningful
	if (
		!userInteractingRef.current &&
		scheduledValueRef.current === null &&
		value !== lastPropValueRef.current
	) {
		lastPropValueRef.current = value;
		if (Math.abs(value - localValue) > 0.01) {
			setLocalValue(value);
			setInputValue(value.toString());
			setSliderPosition(valueToSlider(value));
		}
	}

	const commitValue = (rawValue: string) => {
		const numValue = parseFloat(rawValue);
		if (!Number.isNaN(numValue)) {
			const clampedValue = Math.max(min, Math.min(max, numValue));
			setLocalValue(clampedValue);
			setInputValue(clampedValue.toString());
			setSliderPosition(valueToSlider(clampedValue));
			onChange(clampedValue);
		} else {
			// Reset to current value if invalid
			setInputValue(localValue.toString());
		}
	};

	const handleInputChange = (newValue: string) => {
		setInputValue(newValue);
	};

	const handleInputBlur = () => {
		commitValue(inputValue);
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			commitValue(inputValue);
			e.currentTarget.blur();
		}
	};

	const handleSliderChange = (newValue: number[]) => {
		const sliderPos = newValue[0];
		const realValue = sliderToValue(sliderPos);
		setSliderPosition(sliderPos);
		setLocalValue(realValue);
		setInputValue(realValue.toString());
		userInteractingRef.current = true;
		scheduledValueRef.current = realValue;
		setIsDebouncing(true);

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			scheduledValueRef.current = null;
			userInteractingRef.current = false;
			onChange(realValue);
			setIsDebouncing(false);
		}, 300);
	};

	const showSpinner = isLoading || isDebouncing;

	// Generate legend labels for exponential scale
	const getLegendLabels = () => {
		if (!exponential) {
			const stepSize = (max - min) / 4;
			return Array.from({ length: 5 }, (_, i) => min + i * stepSize);
		}
		// For exponential: show 100, 1K, 10K, 100K, 1M, 2M
		const logMin = Math.log10(exponentialMin);
		const logMax = Math.log10(exponentialMax);
		const positions = [0, 25, 50, 75, 100];
		return positions.map((pos) => {
			const logVal = (pos / 100) * (logMax - logMin) + logMin;
			const val = 10 ** logVal;
			return Math.round(val);
		});
	};

	const steps = getLegendLabels();

	const formatNumber = (num: number) => {
		if (num >= 1000000)
			return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
		if (num >= 1000)
			return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
		return num.toString();
	};

	return (
		<div className="space-y-2">
			{showInputInHeader && headerLabel && (
				<div className="flex items-center justify-between">
					<Label className="text-[#3d2b15]">{headerLabel}</Label>
					<div className="flex items-baseline gap-0.5">
						<Input
							type="text"
							value={inputValue}
							onChange={(e) => handleInputChange(e.target.value)}
							onBlur={handleInputBlur}
							onKeyDown={handleInputKeyDown}
							className="h-7 !bg-transparent border-0 border-b border-[#d4c8b8] text-[#2d1b0e] text-sm font-mono text-center px-1 focus-visible:ring-0 focus-visible:border-[#7a5c3a] rounded-none"
							style={{
								width: `${inputValue.length + 1}ch`,
								backgroundColor: "transparent",
							}}
						/>
						{unit && (
							<span className="text-[10px] text-[#a0926f] font-mono ml-1">
								{unit}
							</span>
						)}
					</div>
				</div>
			)}
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<SliderPrimitive.Root
						value={[sliderPosition]}
						onValueChange={handleSliderChange}
						min={0}
						max={100}
						step={1}
						className="relative flex w-full touch-none select-none items-center"
					>
						<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#d4c8b8]">
							<SliderPrimitive.Range className="absolute h-full bg-[#7a5c3a]" />
						</SliderPrimitive.Track>
						<SliderPrimitive.Thumb
							className={cn(
								"block h-5 w-5 rounded-full border-2 border-[#7a5c3a] bg-[#f5efe6] ring-offset-[#f5efe6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a5c3a] focus-visible:ring-offset-2 disabled:pointer-events-none",
								showSpinner && "border-[#a0926f]",
							)}
						>
							{showSpinner && (
								<div className="absolute inset-0 flex items-center justify-center">
									<Loader2 className="h-3 w-3 animate-spin text-[#7a5c3a]" />
								</div>
							)}
						</SliderPrimitive.Thumb>
					</SliderPrimitive.Root>
					<div className="flex justify-between text-[10px] text-[#a0926f] font-mono mt-1">
						{steps.map((stepValue) => (
							<span
								key={stepValue}
								className={
									stepValue === min || stepValue === max ? "font-semibold" : ""
								}
							>
								{formatNumber(stepValue)}
							</span>
						))}
					</div>
				</div>
				{!showInputInHeader && (
					<div className="flex items-baseline gap-0.5 min-w-[60px] justify-end">
						<Input
							type="text"
							value={inputValue}
							onChange={(e) => handleInputChange(e.target.value)}
							onBlur={handleInputBlur}
							onKeyDown={handleInputKeyDown}
							className="h-7 !bg-transparent border-0 shadow-none text-[#2d1b0e] text-sm font-mono text-right px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
							style={{
								width: `${inputValue.length + 0.5}ch`,
								backgroundColor: "transparent",
							}}
						/>
						{unit && (
							<span className="text-[10px] text-[#a0926f] font-mono">
								{unit}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export function ExtractionSettings({
	model,
	strategy,
	chunkSize,
	parsingOptions,
	chunkingOptions,
	isChunkingLoading,
	hasKeyForModel,
	onModelChange,
	onStrategyChange,
	onChunkSizeChange,
	onParsingOptionsChange,
	onChunkingOptionsChange,
}: ExtractionSettingsProps) {
	const toggleParsingImages = () => {
		onParsingOptionsChange({
			...parsingOptions,
			images: !parsingOptions.images,
		});
	};

	const toggleParsingScreenshots = () => {
		onParsingOptionsChange({
			...parsingOptions,
			screenshots: !parsingOptions.screenshots,
		});
	};

	// Check if we have API key for the selected model
	const hasKey = hasKeyForModel ? hasKeyForModel(model) : true;

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="model" className="text-[#2d1b0e] font-medium">
					Model
				</Label>
				<ModelSelectorComponent value={model} onChange={onModelChange} />
				{model && !hasKey && (
					<p className="text-xs text-[#a05c5c] flex items-center gap-1">
						<span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a05c5c]"></span>
						No API key configured for this provider. Please add your key in the provider settings.
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="strategy" className="text-[#2d1b0e] font-medium">
					Strategy
				</Label>
				<Select value={strategy} onValueChange={onStrategyChange}>
					<SelectTrigger
						id="strategy"
						className="w-full h-11 [&>span]:text-left bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] focus:ring-[#7a5c3a]"
					>
						<SelectValue placeholder="Select strategy" />
					</SelectTrigger>
					<SelectContent className="bg-[#f5efe6] border-[#d4c8b8]">
						{STRATEGIES.map((s) => (
							<SelectItem
								key={s.value}
								value={s.value}
								className="text-[#2d1b0e] focus:bg-[#e5dccf] focus:text-[#2d1b0e] py-2"
							>
								<div className="flex flex-col">
									<span className="font-medium">{s.label}</span>
									<span className="text-xs text-[#a0926f]">
										{s.description}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-3 pt-2">
				<div className="flex items-center justify-between">
					<Label className="text-[#2d1b0e] font-medium">Parsing Output</Label>
					<div className="flex items-center gap-1">
						<Input
							type="text"
							placeholder="5"
							value={chunkingOptions.maxImages?.toString() ?? ""}
							onChange={(e) => {
								const val = e.target.value;
								onChunkingOptionsChange({
									...chunkingOptions,
									maxImages: val === "" ? null : parseInt(val, 10),
								});
							}}
							className="h-7 w-14 bg-transparent border-0 border-b border-[#d4c8b8] text-[#2d1b0e] text-sm font-mono text-center px-1 focus-visible:ring-0 focus-visible:border-[#7a5c3a] rounded-none"
						/>
						<span className="text-xs text-[#a0926f]">imgs/chunk</span>
					</div>
				</div>

				<div className="space-y-2">
					<ToggleCard
						icon={<Image className="w-4 h-4" />}
						label="Images"
						description="Extract embedded images from documents"
						active={parsingOptions.images}
						onClick={toggleParsingImages}
					/>
					<ToggleCard
						icon={<Camera className="w-4 h-4" />}
						label="Screenshots"
						description="Extract rendered page screenshots"
						active={parsingOptions.screenshots}
						onClick={toggleParsingScreenshots}
					/>
				</div>
			</div>

			<div className="space-y-4 pt-3 border-t border-[#d4c8b8]">
				<div className="space-y-2">
					<CompactInputSlider
						value={chunkSize}
						onChange={onChunkSizeChange}
						min={100}
						max={2000000}
						unit="tokens"
						isLoading={isChunkingLoading}
						exponential
						exponentialMin={100}
						exponentialMax={2000000}
						showInputInHeader
						headerLabel="Chunk Size"
					/>
				</div>
			</div>

			<div className="space-y-2 pt-3 border-t border-[#d4c8b8]">
				<Label htmlFor="parser" className="text-[#2d1b0e] font-medium">
					Parser Override
				</Label>
				<Input
					id="parser"
					type="text"
					placeholder="@myorg/custom-parser"
					value={parsingOptions.parser}
					onChange={(e) =>
						onParsingOptionsChange({
							...parsingOptions,
							parser: e.target.value,
						})
					}
					className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] focus-visible:ring-[#7a5c3a]"
				/>
				<p className="text-xs text-[#a0926f]">npm package for custom parsing</p>
			</div>
		</div>
	);
}
