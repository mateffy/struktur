import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type OutputViewerProps = {
  data: unknown
  schema?: unknown
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  savedPath?: string
}

export function OutputViewer({ data, schema, usage, savedPath }: OutputViewerProps) {
  const [viewMode, setViewMode] = useState<'json' | 'schema'>('json')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extraction-result.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderJsonValue = (value: unknown, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">{String(value)}</span>
    }

    if (typeof value === 'boolean') {
      return <span className="text-green-600 font-medium">{String(value)}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 font-medium">{String(value)}</span>
    }

    if (typeof value === 'string') {
      return <span className="text-orange-600">"{String(value)}"</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">[]</span>
      }

      return (
        <div>
          <span className="text-muted-foreground">[</span>
          {value.map((item, index) => (
            <div
              key={index}
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
            >
              {renderJsonValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
          <span className="text-muted-foreground">]</span>
        </div>
      )
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        return <span className="text-muted-foreground">{'{}'}</span>
      }

      return (
        <div>
          <span className="text-muted-foreground">{'{'}</span>
          {entries.map(([key, val], index) => (
            <div
              key={key}
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
            >
              <span className="text-purple-600 font-medium">{key}</span>
              <span className="text-muted-foreground">: </span>
              {renderJsonValue(val, depth + 1)}
              {index < entries.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
          <span className="text-muted-foreground">{'}'}</span>
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  const renderSchemaBasedView = () => {
    if (!schema || !data) {
      return (
        <div className="text-muted-foreground text-center py-8">
          No schema available
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Schema-based rendering coming soon...
        </div>
        <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
          {renderJsonValue(data)}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No output data yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {usage && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Input tokens:</span>{' '}
            {usage.inputTokens.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Output tokens:</span>{' '}
            {usage.outputTokens.toLocaleString()}
          </div>
          {savedPath && (
            <div className="ml-auto text-xs">
              Saved: {savedPath}
            </div>
          )}
        </div>
      )}

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'json' | 'schema')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="schema">Schema View</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
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
  )
}
