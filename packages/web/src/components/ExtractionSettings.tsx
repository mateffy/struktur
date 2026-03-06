import { ModelSelectorComponent } from './model/ModelSelector'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ExtractionSettingsProps = {
  model: string
  strategy: string
  chunkSize: number
  parsingOptions: {
    images: boolean
    screenshots: boolean
    parser: string
  }
  onModelChange: (model: string) => void
  onStrategyChange: (strategy: string) => void
  onChunkSizeChange: (size: number) => void
  onParsingOptionsChange: (options: ExtractionSettingsProps['parsingOptions']) => void
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

export function ExtractionSettings({
  model,
  strategy,
  chunkSize,
  parsingOptions,
  onModelChange,
  onStrategyChange,
  onChunkSizeChange,
  onParsingOptionsChange,
}: ExtractionSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <ModelSelectorComponent value={model} onChange={onModelChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strategy">Strategy</Label>
          <Select value={strategy} onValueChange={onStrategyChange}>
            <SelectTrigger id="strategy" className="w-full [&>span]:text-left">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              {STRATEGIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chunkSize">Chunk size (tokens)</Label>
          <Input
            id="chunkSize"
            type="number"
            value={chunkSize}
            onChange={(e) => onChunkSizeChange(parseInt(e.target.value, 10) || 10000)}
            min={100}
            max={100000}
            step={500}
          />
        </div>

        <div className="space-y-3">
          <Label>Parsing options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="images"
                checked={parsingOptions.images}
                onCheckedChange={(checked) => onParsingOptionsChange({
                  ...parsingOptions,
                  images: checked === true,
                })}
              />
              <label
                htmlFor="images"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Extract embedded images
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="screenshots"
                checked={parsingOptions.screenshots}
                onCheckedChange={(checked) => onParsingOptionsChange({
                  ...parsingOptions,
                  screenshots: checked === true,
                })}
              />
              <label
                htmlFor="screenshots"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Generate page screenshots
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parser">Parser override (npm package)</Label>
          <Input
            id="parser"
            type="text"
            placeholder="@myorg/custom-parser"
            value={parsingOptions.parser}
            onChange={(e) => onParsingOptionsChange({
              ...parsingOptions,
              parser: e.target.value,
            })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
