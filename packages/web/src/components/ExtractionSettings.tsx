import { ModelSelectorComponent } from './model/ModelSelector'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ExtractionSettingsProps = {
  model: string
  strategy: string
  chunkSize: number
  parsingOptions: {
    images: boolean
    screenshots: boolean
    parser: string
  }
  chunkingOptions: {
    maxImages: number | null
    textRatio: number
    imageTokens: number
    filterEmbedded: boolean
    filterScreenshot: boolean
  }
  onModelChange: (model: string) => void
  onStrategyChange: (strategy: string) => void
  onChunkSizeChange: (size: number) => void
  onParsingOptionsChange: (options: ExtractionSettingsProps['parsingOptions']) => void
  onChunkingOptionsChange: (options: ExtractionSettingsProps['chunkingOptions']) => void
}

const STRATEGIES = [
  { value: 'simple', label: 'Simple', description: 'Single extraction pass' },
  { value: 'parallel', label: 'Parallel', description: 'Chunk and process in parallel' },
  { value: 'sequential', label: 'Sequential', description: 'Chunk and process sequentially' },
  { value: 'parallelAutoMerge', label: 'Parallel + Auto-merge', description: 'Parallel with deduplication' },
  { value: 'sequentialAutoMerge', label: 'Sequential + Auto-merge', description: 'Sequential with deduplication' },
  { value: 'doublePass', label: 'Double Pass', description: 'Extract then refine' },
  { value: 'doublePassAutoMerge', label: 'Double Pass + Auto-merge', description: 'Extract, refine, and dedupe' },
]

// Toggle button component for image types
function ImageTypeToggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? 'bg-[#7a5c3a] text-white'
          : 'bg-[#f5efe6] text-[#7a5c3a] hover:bg-[#e5dccf]'
      }`}
    >
      {label}
    </button>
  )
}

// Combined input + slider component
function InputSlider({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  inputWidth = 'w-20',
}: {
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step: number
  unit?: string
  inputWidth?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value)
          if (!isNaN(val)) {
            onChange(Math.max(min, Math.min(max, val)))
          }
        }}
        min={min}
        max={max}
        step={step}
        className={`${inputWidth} h-8 bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] text-sm focus-visible:ring-[#7a5c3a]`}
      />
      <div className="flex-1">
        <Slider
          value={[value]}
          onValueChange={(val) => onChange(val[0])}
          min={min}
          max={max}
          step={step}
        />
      </div>
      {unit && <span className="text-xs text-[#a0926f]">{unit}</span>}
    </div>
  )
}

export function ExtractionSettings({
  model,
  strategy,
  chunkSize,
  parsingOptions,
  chunkingOptions,
  onModelChange,
  onStrategyChange,
  onChunkSizeChange,
  onParsingOptionsChange,
  onChunkingOptionsChange,
}: ExtractionSettingsProps) {
  // Toggle handlers for parsing options
  const toggleParsingImages = () => {
    onParsingOptionsChange({
      ...parsingOptions,
      images: !parsingOptions.images,
    })
  }

  const toggleParsingScreenshots = () => {
    onParsingOptionsChange({
      ...parsingOptions,
      screenshots: !parsingOptions.screenshots,
    })
  }

  // Toggle handlers for chunking filters
  const toggleChunkingEmbedded = () => {
    onChunkingOptionsChange({
      ...chunkingOptions,
      filterEmbedded: !chunkingOptions.filterEmbedded,
    })
  }

  const toggleChunkingScreenshot = () => {
    onChunkingOptionsChange({
      ...chunkingOptions,
      filterScreenshot: !chunkingOptions.filterScreenshot,
    })
  }

  return (
    <div className="space-y-5">
      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model" className="text-[#2d1b0e] font-medium">Model</Label>
        <ModelSelectorComponent value={model} onChange={onModelChange} />
      </div>

      {/* Strategy Selection */}
      <div className="space-y-2">
        <Label htmlFor="strategy" className="text-[#2d1b0e] font-medium">Strategy</Label>
        <Select value={strategy} onValueChange={onStrategyChange}>
          <SelectTrigger 
            id="strategy" 
            className="w-full [&>span]:text-left bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] focus:ring-[#7a5c3a]"
          >
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent className="bg-[#f5efe6] border-[#d4c8b8]">
            {STRATEGIES.map((s) => (
              <SelectItem 
                key={s.value} 
                value={s.value}
                className="text-[#2d1b0e] focus:bg-[#e5dccf] focus:text-[#2d1b0e]"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-xs text-[#a0926f]">{s.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Parsing Options - Now in main settings */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-[#2d1b0e] font-medium">Parsing Output</Label>
          <span className="text-xs text-[#a0926f] italic">what to extract from files</span>
        </div>
        
        {/* Multi-toggle for parsing image types */}
        <div className="flex gap-2 p-1 bg-[#f5efe6] rounded-lg border border-[#d4c8b8]">
          <ImageTypeToggle
            label="IMAGES"
            active={parsingOptions.images}
            onClick={toggleParsingImages}
          />
          <ImageTypeToggle
            label="SCREENSHOTS"
            active={parsingOptions.screenshots}
            onClick={toggleParsingScreenshots}
          />
        </div>
      </div>

      {/* Chunking Settings */}
      <div className="space-y-4 pt-3 border-t border-[#d4c8b8]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2d1b0e] uppercase tracking-wider">Chunking</h3>
          <span className="text-xs text-[#a0926f] italic">what goes to the LLM</span>
        </div>
        
        {/* Chunk Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="chunkSize" className="text-[#3d2b15]">Chunk Size</Label>
          </div>
          <InputSlider
            value={chunkSize}
            onChange={onChunkSizeChange}
            min={1000}
            max={50000}
            step={500}
            unit="tokens"
          />
        </div>
        
        {/* Max Images */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="maxImages" className="text-[#3d2b15]">Max Images</Label>
            <span className="text-xs text-[#a0926f]">
              {chunkingOptions.maxImages === null ? 'Unlimited' : `${chunkingOptions.maxImages} per chunk`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="maxImages"
              type="number"
              placeholder="∞"
              value={chunkingOptions.maxImages ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onChunkingOptionsChange({
                  ...chunkingOptions,
                  maxImages: val === '' ? null : parseInt(val, 10),
                })
              }}
              min={1}
              max={100}
              className="w-16 h-8 bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] text-sm focus-visible:ring-[#7a5c3a]"
            />
            <div className="flex-1">
              <Slider
                value={[chunkingOptions.maxImages ?? 10]}
                onValueChange={(value) => onChunkingOptionsChange({
                  ...chunkingOptions,
                  maxImages: value[0],
                })}
                min={1}
                max={50}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Text Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="textRatio" className="text-[#3d2b15]">Text Ratio</Label>
            <span className="text-xs text-[#a0926f]">{chunkingOptions.textRatio}x</span>
          </div>
          <InputSlider
            value={chunkingOptions.textRatio}
            onChange={(val) => onChunkingOptionsChange({
              ...chunkingOptions,
              textRatio: val,
            })}
            min={1}
            max={10}
            step={0.5}
          />
        </div>

        {/* Image Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="imageTokens" className="text-[#3d2b15]">Image Tokens</Label>
            <span className="text-xs text-[#a0926f]">{chunkingOptions.imageTokens.toLocaleString()}</span>
          </div>
          <InputSlider
            value={chunkingOptions.imageTokens}
            onChange={(val) => onChunkingOptionsChange({
              ...chunkingOptions,
              imageTokens: val,
            })}
            min={100}
            max={5000}
            step={100}
          />
        </div>

        {/* Image Type Filters for Chunking */}
        <div className="space-y-2 pt-1">
          <Label className="text-[#3d2b15]">Include in Chunks</Label>
          <div className="flex gap-2 p-1 bg-[#f5efe6] rounded-lg border border-[#d4c8b8]">
            <ImageTypeToggle
              label="EMBEDDED"
              active={chunkingOptions.filterEmbedded}
              onClick={toggleChunkingEmbedded}
            />
            <ImageTypeToggle
              label="SCREENSHOTS"
              active={chunkingOptions.filterScreenshot}
              onClick={toggleChunkingScreenshot}
            />
          </div>
        </div>
      </div>

      {/* Parser Override - Kept at bottom */}
      <div className="space-y-2 pt-3 border-t border-[#d4c8b8]">
        <Label htmlFor="parser" className="text-[#2d1b0e] font-medium">Parser Override</Label>
        <Input
          id="parser"
          type="text"
          placeholder="@myorg/custom-parser"
          value={parsingOptions.parser}
          onChange={(e) => onParsingOptionsChange({
            ...parsingOptions,
            parser: e.target.value,
          })}
          className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] focus-visible:ring-[#7a5c3a]"
        />
        <p className="text-xs text-[#a0926f]">npm package for custom parsing</p>
      </div>
    </div>
  )
}
