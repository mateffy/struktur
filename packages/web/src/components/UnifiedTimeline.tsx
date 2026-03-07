import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ScrollText, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Circle,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings,
  Zap,
  Layers,
  Database,
  Clock,
  Cpu,
  BarChart3,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TimelineEntry = {
  id: string
  timestamp: Date
  type: 'step' | 'info' | 'warning' | 'error' | 'success'
  status?: 'pending' | 'running' | 'completed' | 'error'
  message: string
  data?: unknown
  metadata?: {
    strategy?: string
    model?: string
    chunkSize?: number
    duration?: number
    fileCount?: number
    totalTokens?: number
    stepNumber?: number
    totalSteps?: number
  }
}

type UnifiedTimelineProps = {
  entries: TimelineEntry[]
  onClear?: () => void
}

const STEP_TYPES = {
  parsing: {
    icon: FileText,
    color: '#7a5c3a',
    bgColor: 'bg-[#7a5c3a]/10',
    borderColor: 'border-l-[#7a5c3a]',
    label: 'Parse'
  },
  extracting: {
    icon: Zap,
    color: '#5c8a5c',
    bgColor: 'bg-[#5c8a5c]/10',
    borderColor: 'border-l-[#5c8a5c]',
    label: 'Extract'
  },
  chunking: {
    icon: Layers,
    color: '#a0926f',
    bgColor: 'bg-[#a0926f]/10',
    borderColor: 'border-l-[#a0926f]',
    label: 'Chunk'
  },
  merging: {
    icon: Database,
    color: '#7a5c3a',
    bgColor: 'bg-[#7a5c3a]/10',
    borderColor: 'border-l-[#7a5c3a]',
    label: 'Merge'
  },
  strategy: {
    icon: Settings,
    color: '#2d1b0e',
    bgColor: 'bg-[#2d1b0e]/5',
    borderColor: 'border-l-[#2d1b0e]',
    label: 'Strategy'
  },
  model: {
    icon: Cpu,
    color: '#7a5c3a',
    bgColor: 'bg-[#7a5c3a]/10',
    borderColor: 'border-l-[#7a5c3a]',
    label: 'Model'
  }
}

function detectStepType(message: string): keyof typeof STEP_TYPES | null {
  const lowerMsg = message.toLowerCase()
  if (lowerMsg.includes('parse')) return 'parsing'
  if (lowerMsg.includes('extract')) return 'extracting'
  if (lowerMsg.includes('chunk')) return 'chunking'
  if (lowerMsg.includes('merge') || lowerMsg.includes('dedup')) return 'merging'
  if (lowerMsg.includes('strategy')) return 'strategy'
  if (lowerMsg.includes('model')) return 'model'
  return null
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function SimpleBadge({ 
  children, 
  className,
  variant = 'default'
}: { 
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded',
      variant === 'outline' && 'border',
      className
    )}>
      {children}
    </span>
  )
}

export function UnifiedTimeline({ entries, onClear }: UnifiedTimelineProps) {
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showAllMetadata, setShowAllMetadata] = useState(false)

  const filteredEntries = entries.filter((entry) => {
    if (!filter) return true
    const lowerFilter = filter.toLowerCase()
    return (
      entry.message.toLowerCase().includes(lowerFilter) ||
      entry.type.toLowerCase().includes(lowerFilter) ||
      entry.metadata?.strategy?.toLowerCase().includes(lowerFilter) ||
      entry.metadata?.model?.toLowerCase().includes(lowerFilter)
    )
  })

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  const getStatusIcon = (status?: TimelineEntry['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-[#7a5c3a]" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-[#5c8a5c]" />
      case 'error':
        return <XCircle className="h-4 w-4 text-[#a05c5c]" />
      case 'pending':
        return <Circle className="h-4 w-4 text-[#a0926f]" />
      default:
        return <Circle className="h-4 w-4 text-[#a0926f]" />
    }
  }

  const getStepBadge = (stepType: keyof typeof STEP_TYPES) => {
    const config = STEP_TYPES[stepType]
    const Icon = config.icon
    return (
      <SimpleBadge className={cn(config.bgColor, 'text-[#2d1b0e]')}>
        <Icon className="h-3 w-3" style={{ color: config.color }} />
        {config.label}
      </SimpleBadge>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#a0926f]">
        <div className="w-16 h-16 rounded-full bg-[#ede5d8] flex items-center justify-center mb-4">
          <ScrollText className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-sm font-medium">No activity yet</p>
        <p className="text-xs mt-1 opacity-70">Start parsing or extracting to see the timeline</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f5efe6]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0926f]" />
          <Input
            placeholder="Filter timeline..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] focus-visible:ring-[#7a5c3a]"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAllMetadata(!showAllMetadata)}
          className="bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#e5dccf]"
        >
          {showAllMetadata ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        {onClear && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            className="bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#e5dccf]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredEntries.map((entry, index) => {
          const isExpanded = expanded.has(entry.id)
          const hasData = entry.data !== undefined
          const stepType = detectStepType(entry.message)
          const isRunning = entry.status === 'running'
          const hasMetadata = !!(entry.metadata && (
            entry.metadata.strategy || 
            entry.metadata.model || 
            entry.metadata.duration || 
            entry.metadata.fileCount ||
            entry.metadata.totalTokens
          ))
          const showMetadata = showAllMetadata || isExpanded

          // Common classes for the card
          const cardClasses = cn(
            'relative z-10 rounded-lg border-l-4 p-3 transition-all',
            'bg-[#ede5d8] border-[#d4c8b8]',
            stepType && STEP_TYPES[stepType].borderColor,
            isRunning && 'ring-2 ring-[#7a5c3a]/30 shadow-md'
          )

          return (
            <div key={entry.id} className="relative">
              {/* Timeline connector line */}
              {index < filteredEntries.length - 1 && (
                <div className="absolute left-[19px] top-[40px] w-[2px] h-[calc(100%-24px)] bg-[#d4c8b8] z-0" />
              )}
              
              {hasData ? (
                <button
                  type="button"
                  className={cn(cardClasses, 'text-left w-full cursor-pointer hover:shadow-sm')}
                  onClick={() => toggleExpand(entry.id)}
                >
                  <TimelineEntryContent
                    entry={entry}
                    isExpanded={isExpanded}
                    isRunning={isRunning}
                    stepType={stepType}
                    hasMetadata={hasMetadata}
                    showMetadata={showMetadata}
                    getStatusIcon={getStatusIcon}
                    getStepBadge={getStepBadge}
                  />
                </button>
              ) : (
                <div className={cardClasses}>
                  <TimelineEntryContent
                    entry={entry}
                    isExpanded={isExpanded}
                    isRunning={isRunning}
                    stepType={stepType}
                    hasMetadata={hasMetadata}
                    showMetadata={showMetadata}
                    getStatusIcon={getStatusIcon}
                    getStepBadge={getStepBadge}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Separate component for the entry content to avoid duplication
interface TimelineEntryContentProps {
  entry: TimelineEntry
  isExpanded: boolean
  isRunning: boolean
  stepType: keyof typeof STEP_TYPES | null
  hasMetadata: boolean
  showMetadata: boolean
  getStatusIcon: (status?: TimelineEntry['status']) => React.ReactNode
  getStepBadge: (stepType: keyof typeof STEP_TYPES) => React.ReactNode
}

function TimelineEntryContent({
  entry,
  isExpanded,
  isRunning,
  stepType,
  hasMetadata,
  showMetadata,
  getStatusIcon,
  getStepBadge
}: TimelineEntryContentProps) {
  const hasData = entry.data !== undefined

  return (
    <div className="flex items-start gap-3">
      {/* Icon column */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center border-2',
          isRunning ? 'border-[#7a5c3a] bg-[#f5efe6]' : 'border-[#d4c8b8] bg-[#f5efe6]'
        )}>
          {getStatusIcon(entry.status)}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {stepType && getStepBadge(stepType)}
          
          <span className="text-xs text-[#a0926f] font-mono flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          
          {entry.status && (
            <SimpleBadge className={cn(
              'text-[10px] px-1.5',
              entry.status === 'running' && 'bg-[#7a5c3a]/20 text-[#7a5c3a]',
              entry.status === 'completed' && 'bg-[#5c8a5c]/20 text-[#5c8a5c]',
              entry.status === 'error' && 'bg-[#a05c5c]/20 text-[#a05c5c]',
              entry.status === 'pending' && 'bg-[#d4c8b8]/50 text-[#a0926f]'
            )}>
              {entry.status}
            </SimpleBadge>
          )}
        </div>
        
        {/* Message */}
        <div className="font-medium text-[#2d1b0e] text-sm leading-relaxed">
          {entry.message}
        </div>
        
        {/* Metadata pills */}
        {hasMetadata && showMetadata && (
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.metadata?.strategy && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#7a5c3a]">
                <Settings className="h-3 w-3 mr-1" />
                {entry.metadata.strategy}
              </SimpleBadge>
            )}
            {entry.metadata?.model && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e]">
                <Cpu className="h-3 w-3 mr-1" />
                {entry.metadata.model}
              </SimpleBadge>
            )}
            {entry.metadata?.fileCount !== undefined && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e]">
                <FileText className="h-3 w-3 mr-1" />
                {entry.metadata.fileCount} files
              </SimpleBadge>
            )}
            {entry.metadata?.chunkSize && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e]">
                <Layers className="h-3 w-3 mr-1" />
                {formatNumber(entry.metadata.chunkSize)} tokens/chunk
              </SimpleBadge>
            )}
            {entry.metadata?.totalTokens && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e]">
                <BarChart3 className="h-3 w-3 mr-1" />
                {formatNumber(entry.metadata.totalTokens)} tokens
              </SimpleBadge>
            )}
            {entry.metadata?.duration && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#5c8a5c]">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(entry.metadata.duration)}
              </SimpleBadge>
            )}
            {entry.metadata?.stepNumber !== undefined && entry.metadata?.totalSteps && (
              <SimpleBadge variant="outline" className="text-[10px] bg-[#f5efe6] border-[#d4c8b8] text-[#7a5c3a]">
                Step {entry.metadata.stepNumber}/{entry.metadata.totalSteps}
              </SimpleBadge>
            )}
          </div>
        )}
        
        {/* Progress bar for running steps */}
        {isRunning && entry.metadata?.stepNumber && entry.metadata?.totalSteps && (
          <div className="mt-2">
            <div className="h-1.5 bg-[#d4c8b8] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7a5c3a] rounded-full transition-all duration-500"
                style={{ 
                  width: `${(entry.metadata.stepNumber / entry.metadata.totalSteps) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {/* Show/Hide details link */}
        {hasData && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[#7a5c3a] hover:text-[#2d1b0e] transition-colors">
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
          </div>
        )}
        
        {/* Expanded data */}
        {isExpanded && hasData && (
          <div className="mt-3 pt-3 border-t border-[#d4c8b8]">
            <pre className="p-3 rounded-lg bg-[#f5efe6] overflow-auto text-xs font-mono text-[#2d1b0e] border border-[#d4c8b8]">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
