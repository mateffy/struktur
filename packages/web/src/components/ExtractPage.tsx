import { useState } from 'react'
import { FileUploadZone } from './FileUploadZone'
import { SchemaInput } from './SchemaInput'
import { ExtractionSettings } from './ExtractionSettings'
import { OutputView } from './OutputView'
import { Button } from '@/components/ui/button'

export type ExecutionStatus = 'idle' | 'parsing' | 'extracting' | 'success' | 'error'

export type SchemaMode = 'file' | 'json' | 'fields'

export type ProgressInfo = {
  step?: string
  message?: string
  current?: number
  total?: number
  retryAttempt?: number
  retryMax?: number
}

export type ExtractionResult = {
  data: unknown
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

type Artifact = {
  id: string
  type: string
  contents: any[]
}

function buildFormDataWithFiles(files: File[]): FormData {
  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    formData.append(`file_${i}`, files[i])
  }
  return formData
}

async function postFormData(url: string, formData: FormData): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  return response.json()
}

export function ExtractPage() {
  const [files, setFiles] = useState<File[]>([])
  const [schemaMode, setSchemaMode] = useState<SchemaMode>('fields')
  const [schemaJson, setSchemaJson] = useState('')
  const [fields, setFields] = useState('')
  const [model, setModel] = useState('')
  const [strategy, setStrategy] = useState<string>('simple')
  const [chunkSize, setChunkSize] = useState(10000)
  const [parsingOptions, setParsingOptions] = useState({
    images: false,
    screenshots: false,
    parser: '',
  })
  
  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [progress, setProgress] = useState<ProgressInfo>({})
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [savedPath, setSavedPath] = useState<string>('')

  const handleParse = async () => {
    if (files.length === 0) return
    
    setStatus('parsing')
    setError(null)
    setArtifacts([])
    setResult(null)
    
    try {
      const formData = buildFormDataWithFiles(files)
      formData.append('options', JSON.stringify(parsingOptions))
      const response = await postFormData('/api/parse', formData)
      setArtifacts(response.artifacts as Artifact[])
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setStatus('error')
    }
  }

  const handleExtract = async () => {
    if (files.length === 0) return
    if (schemaMode === 'json' && !schemaJson.trim()) return
    if (schemaMode === 'fields' && !fields.trim()) return
    
    setStatus('extracting')
    setError(null)
    setProgress({})
    setResult(null)
    
    try {
      const formData = buildFormDataWithFiles(files)
      formData.append('params', JSON.stringify({
        schemaMode,
        schemaJson,
        fields,
        model,
        strategy,
        chunkSize,
        parsingOptions,
      }))
      const response = await postFormData('/api/extract', formData)
      
      setArtifacts(response.artifacts as Artifact[])
      setResult(response.result)
      setSavedPath(response.savedPath)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setStatus('error')
    }
  }

  const canExtract = files.length > 0 && (
    schemaMode === 'file' ||
    (schemaMode === 'json' && schemaJson.trim().length > 0) ||
    (schemaMode === 'fields' && fields.trim().length > 0)
  )

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-border/40 px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <img
            src="/struktur-icon.png"
            alt="Struktur"
            className="w-12 h-12 rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-semibold">
              Struktur
            </h1>
            <p className="text-sm text-muted-foreground">
              Extract structured data from documents
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-6">
        <FileUploadZone
          files={files}
          onFilesChange={setFiles}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchemaInput
            mode={schemaMode}
            schemaJson={schemaJson}
            fields={fields}
            onModeChange={setSchemaMode}
            onSchemaJsonChange={setSchemaJson}
            onFieldsChange={setFields}
          />

          <ExtractionSettings
            model={model}
            strategy={strategy}
            chunkSize={chunkSize}
            parsingOptions={parsingOptions}
            onModelChange={setModel}
            onStrategyChange={setStrategy}
            onChunkSizeChange={setChunkSize}
            onParsingOptionsChange={setParsingOptions}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleParse}
            disabled={files.length === 0 || status === 'parsing' || status === 'extracting'}
          >
            Parse Only
          </Button>
          <Button
            onClick={handleExtract}
            disabled={!canExtract || status === 'parsing' || status === 'extracting'}
          >
            Extract
          </Button>
        </div>

        <OutputView
          status={status}
          progress={progress}
          artifacts={artifacts}
          result={result}
          error={error}
          savedPath={savedPath}
        />
      </main>
    </div>
  )
}
