import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { ArtifactViewer } from './ArtifactViewer'
import { OutputViewer } from './OutputViewer'
import { DebugLog, type LogEntry } from './DebugLog'
import { ProgressTracker, type Step } from './ProgressTracker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, FileText, Github, RotateCw } from 'lucide-react'

export type ExecutionStatus = 'idle' | 'parsing' | 'extracting' | 'success' | 'error'

export type SchemaMode = 'file' | 'json' | 'fields'

type Artifact = {
  id: string
  type: string
  contents: any[]
}

type ExtractionResult = {
  data: unknown
  usage: {
    inputTokens: number
    outputTokens: number
  }
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
  const [chunkingOptions, setChunkingOptions] = useState({
    maxImages: null as number | null,
    textRatio: 4,
    imageTokens: 1000,
    filterEmbedded: true,
    filterScreenshot: true,
  })

  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [savedPath, setSavedPath] = useState<string>('')
  const [steps, setSteps] = useState<Step[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((type: LogEntry['type'], message: string, data?: unknown) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      data,
    }
    setLogs((prev) => [...prev, entry])
  }, [])

  const canExtract = files.length > 0 && (
    schemaMode === 'file' ||
    (schemaMode === 'json' && schemaJson.trim().length > 0) ||
    (schemaMode === 'fields' && fields.trim().length > 0)
  )

  const isLoading = status === 'parsing' || status === 'extracting'

  const handleParse = useCallback(async () => {
    if (files.length === 0) return

    setStatus('parsing')
    setError(null)
    setArtifacts([])
    setResult(null)
    setSteps([
      { id: 'parse', label: 'Parsing files', status: 'running' },
    ])
    setLogs([])

    addLog('info', 'Starting file parsing', { fileCount: files.length })

    try {
      const formData = buildFormDataWithFiles(files)
      formData.append('options', JSON.stringify(parsingOptions))
      const response = await postFormData('/api/parse', formData)

      setArtifacts(response.artifacts as Artifact[])
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'parse' ? { ...s, status: 'completed' } : s
        )
      )
      setStatus('success')
      addLog('success', 'Parsing completed', { artifactCount: response.artifacts.length })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setSteps((prev) =>
        prev.map((s) =>
          s.id === 'parse' ? { ...s, status: 'error', message: error.message } : s
        )
      )
      setStatus('error')
      addLog('error', 'Parsing failed', { error: error.message })
    }
  }, [files, parsingOptions, addLog])

  const handleExtract = async () => {
    if (files.length === 0) return
    if (schemaMode === 'json' && !schemaJson.trim()) return
    if (schemaMode === 'fields' && !fields.trim()) return

    setStatus('extracting')
    setError(null)
    setResult(null)
    setSteps([
      { id: 'parse', label: 'Parsing files', status: 'pending' },
      { id: 'extract', label: 'Extracting data', status: 'pending' },
    ])
    setLogs([])

    addLog('info', 'Starting extraction', {
      fileCount: files.length,
      schemaMode,
      strategy,
    })

    try {
      const formData = buildFormDataWithFiles(files)
      formData.append(
        'params',
        JSON.stringify({
          schemaMode,
          schemaJson,
          fields,
          model,
          strategy,
          chunkSize,
          parsingOptions,
          chunkingOptions,
        })
      )

      const response = await fetch('/api/extract/stream', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {
              case 'step':
                setSteps((prev) => {
                  const stepData = data.data as any
                  const existing = prev.find((s) => s.id === stepData.label)
                  if (existing) {
                    return prev.map((s) =>
                      s.id === stepData.label
                        ? { ...s, status: 'completed' }
                        : s
                    )
                  }
                  return [
                    ...prev.slice(0, -1),
                    {
                      id: stepData.label,
                      label: stepData.label,
                      status: 'running',
                    },
                  ]
                })
                addLog('info', `Step: ${data.data.label}`, data.data)
                break

              case 'message':
                addLog('info', 'LLM message', data.data)
                break

              case 'progress':
                addLog('info', 'Progress update', data.data)
                break

              case 'tokenUsage':
                addLog('info', 'Token usage', data.data)
                break

              case 'retry':
                addLog('warning', 'Retry attempt', data.data)
                break

              case 'complete': {
                const completeData = data.data as any
                setArtifacts(completeData.artifacts)
                setResult(completeData.result)
                setSavedPath(completeData.savedPath)
                setSteps((prev) =>
                  prev.map((s) => ({ ...s, status: 'completed' }))
                )
                setStatus('success')
                addLog('success', 'Extraction completed', completeData)
                break
              }

              case 'error': {
                const errorData = data.data as any
                throw new Error(errorData.message)
              }
            }
          }
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setSteps((prev) =>
        prev.map((s) =>
          s.status === 'running'
            ? { ...s, status: 'error', message: error.message }
            : s
        )
      )
      setStatus('error')
      addLog('error', 'Extraction failed', { error: error.message })
    }
  }

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Auto-parse when files change
  useEffect(() => {
    if (files.length > 0 && status === 'idle') {
      handleParse()
    }
  }, [files, status, handleParse])

  // Track if we've parsed at least once
  const hasParsed = artifacts.length > 0

  return (
    <div className="h-screen bg-[#f5efe6] flex flex-col">
      {/* Header - Full width, above sidebar */}
      <header className="border-b border-[#d4c8b8] px-6 py-3 bg-[#ede5d8] flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <img
            src="/struktur-icon.png"
            alt="Struktur"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <div className="text-xs text-[#a0926f] italic leading-none">/ʃtʁʊkˈtuːɐ̯/</div>
            <h1 className="text-xl font-semibold text-[#2d1b0e] tracking-tight">
              struktur
            </h1>
          </div>
          
          {/* Documentation Links */}
          <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-[#d4c8b8]">
            <a 
              href="https://struktur.sh/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              Docs
            </a>
            <a 
              href="https://github.com/mateffy/struktur" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {status !== 'idle' && (
            <div className="flex items-center gap-2 mr-4">
              {status === 'parsing' && (
                <span className="text-sm text-[#7a5c3a]">Parsing...</span>
              )}
              {status === 'extracting' && (
                <span className="text-sm text-[#7a5c3a]">Extracting...</span>
              )}
              {status === 'success' && (
                <span className="text-sm text-[#5c8a5c] font-medium">Complete</span>
              )}
              {status === 'error' && (
                <span className="text-sm text-[#a05c5c] font-medium">Failed</span>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleParse}
              disabled={files.length === 0 || isLoading}
              className="h-9 px-4 bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8] hover:text-[#3d2b15] disabled:opacity-50"
            >
              {status === 'parsing' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : hasParsed ? (
                <RotateCw className="h-4 w-4 mr-2" />
              ) : null}
              {hasParsed ? 'Reparse' : 'Parse'}
            </Button>
            <Button
              onClick={handleExtract}
              disabled={!canExtract || isLoading}
              className="h-9 px-4 bg-[#7a5c3a] text-white hover:bg-[#5c452a] disabled:opacity-50"
            >
              {status === 'extracting' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Extract
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content - Left side */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <Card className="mb-6 border-[#c4a8a8] bg-[#f5e6e6]">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[#a05c5c] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-[#8a4a4a]">Error</div>
                      <div className="text-sm text-[#7a5c5c] mt-1">
                        {error.message}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="artifacts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="artifacts">
                  Artifacts
                </TabsTrigger>
                <TabsTrigger value="output">
                  Output
                </TabsTrigger>
                <TabsTrigger value="progress">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="debug">
                  Debug Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="artifacts" className="mt-0">
                <ArtifactViewer 
                  artifacts={artifacts} 
                  chunkingSettings={{
                    maxTokens: chunkSize,
                    maxImages: chunkingOptions.maxImages,
                    textRatio: chunkingOptions.textRatio,
                    imageTokens: chunkingOptions.imageTokens,
                    filterEmbedded: chunkingOptions.filterEmbedded,
                    filterScreenshot: chunkingOptions.filterScreenshot,
                  }}
                  isParsing={status === 'parsing'}
                />
              </TabsContent>

              <TabsContent value="output" className="mt-0">
                <Card className="bg-[#ede5d8] border-[#d4c8b8]">
                  <CardHeader>
                    <CardTitle className="text-[#2d1b0e]">Extraction Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OutputViewer
                      data={result?.data}
                      usage={result?.usage}
                      savedPath={savedPath}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <Card className="bg-[#ede5d8] border-[#d4c8b8]">
                  <CardHeader>
                    <CardTitle className="text-[#2d1b0e]">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {steps.length > 0 ? (
                      <ProgressTracker steps={steps} />
                    ) : (
                      <div className="text-center text-[#a0926f] py-8">
                        No progress to display
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="debug" className="mt-0">
                <Card className="bg-[#ede5d8] border-[#d4c8b8]">
                  <CardHeader>
                    <CardTitle className="text-[#2d1b0e]">Debug Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DebugLog entries={logs} onClear={clearLogs} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Sidebar - Right side */}
        <Sidebar
          files={files}
          schemaMode={schemaMode}
          schemaJson={schemaJson}
          fields={fields}
          model={model}
          strategy={strategy}
          chunkSize={chunkSize}
          parsingOptions={parsingOptions}
          chunkingOptions={chunkingOptions}
          status={status}
          onFilesChange={setFiles}
          onSchemaModeChange={setSchemaMode}
          onSchemaJsonChange={setSchemaJson}
          onFieldsChange={setFields}
          onModelChange={setModel}
          onStrategyChange={setStrategy}
          onChunkSizeChange={setChunkSize}
          onParsingOptionsChange={setParsingOptions}
          onChunkingOptionsChange={setChunkingOptions}
        />
      </div>
    </div>
  )
}
