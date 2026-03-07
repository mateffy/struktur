import { FileUploadZone } from './FileUploadZone'
import { SchemaInput } from './SchemaInput'
import { ExtractionSettings } from './ExtractionSettings'
import { Separator } from '@/components/ui/separator'
import type { SchemaMode } from './ExtractPage'

type SidebarProps = {
  files: File[]
  schemaMode: SchemaMode
  schemaJson: string
  fields: string
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
  status: 'idle' | 'parsing' | 'extracting' | 'success' | 'error'
  isChunkingLoading?: boolean
  onFilesChange: (files: File[]) => void
  onSchemaModeChange: (mode: SchemaMode) => void
  onSchemaJsonChange: (json: string) => void
  onFieldsChange: (fields: string) => void
  onModelChange: (model: string) => void
  onStrategyChange: (strategy: string) => void
  onChunkSizeChange: (size: number) => void
  onParsingOptionsChange: (options: SidebarProps['parsingOptions']) => void
  onChunkingOptionsChange: (options: SidebarProps['chunkingOptions']) => void
}

export function Sidebar({
  files,
  schemaMode,
  schemaJson,
  fields,
  model,
  strategy,
  chunkSize,
  parsingOptions,
  chunkingOptions,
  isChunkingLoading,
  onFilesChange,
  onSchemaModeChange,
  onSchemaJsonChange,
  onFieldsChange,
  onModelChange,
  onStrategyChange,
  onChunkSizeChange,
  onParsingOptionsChange,
  onChunkingOptionsChange,
}: SidebarProps) {
  return (
    <aside className="w-96 bg-[#ede5d8] border-r border-[#d4c8b8] flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="p-5 space-y-5">
          <section>
            <h2 className="text-sm font-semibold text-[#2d1b0e] mb-3 uppercase tracking-wider">Files</h2>
            <FileUploadZone files={files} onFilesChange={onFilesChange} />
          </section>

          <Separator className="bg-[#d4c8b8]" />

          <section>
            <h2 className="text-sm font-semibold text-[#2d1b0e] mb-3 uppercase tracking-wider">Schema</h2>
            <SchemaInput
              mode={schemaMode}
              schemaJson={schemaJson}
              fields={fields}
              onModeChange={onSchemaModeChange}
              onSchemaJsonChange={onSchemaJsonChange}
              onFieldsChange={onFieldsChange}
            />
          </section>

          <Separator className="bg-[#d4c8b8]" />

          <section>
            <h2 className="text-sm font-semibold text-[#2d1b0e] mb-3 uppercase tracking-wider">Settings</h2>
            <ExtractionSettings
              model={model}
              strategy={strategy}
              chunkSize={chunkSize}
              parsingOptions={parsingOptions}
              chunkingOptions={chunkingOptions}
              isChunkingLoading={isChunkingLoading}
              onModelChange={onModelChange}
              onStrategyChange={onStrategyChange}
              onChunkSizeChange={onChunkSizeChange}
              onParsingOptionsChange={onParsingOptionsChange}
              onChunkingOptionsChange={onChunkingOptionsChange}
            />
          </section>
        </div>
      </div>
    </aside>
  )
}
