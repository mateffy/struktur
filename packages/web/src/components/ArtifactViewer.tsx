import { useMemo, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Expand, Shrink, Image as ImageIcon, FileText, Layers, Loader2 } from 'lucide-react'

type Media = {
  type: string
  base64?: string
  url?: string
  width?: number
  height?: number
  imageType?: string
}

type Content = {
  page?: number
  text?: string
  media?: Media[]
}

type Artifact = {
  id: string
  type: string
  contents: Content[]
}

type ChunkingSettings = {
  maxTokens: number
  maxImages: number | null
  textRatio: number
  imageTokens: number
  filterEmbedded: boolean
  filterScreenshot: boolean
}

type ArtifactViewerProps = {
  artifacts: Artifact[]
  chunkingSettings?: ChunkingSettings
  isParsing?: boolean
}

// Calculate estimated tokens for content
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Calculate image token cost
function calculateImageTokens(media: Media[], imageTokens: number, filterEmbedded: boolean, filterScreenshot: boolean): number {
  return media.filter(m => {
    if (m.type !== 'image') return false
    if (!filterEmbedded && m.imageType === 'embedded') return false
    if (!filterScreenshot && m.imageType === 'screenshot') return false
    return true
  }).length * imageTokens
}

// Alternating chunk colors - striped pattern
const CHUNK_COLOR_1 = '#7a5c3a' // dark brown
const CHUNK_COLOR_2 = '#d4c8b8' // light tan

function getChunkColor(chunkId: number): string {
  return chunkId % 2 === 0 ? CHUNK_COLOR_1 : CHUNK_COLOR_2
}

type Chunk = {
  id: number
  artifactIdx: number
  contentIdx: number
  startToken: number
  endToken: number
  tokens: number
}

// Chunk calculation function
function calculateChunks(
  artifacts: Artifact[],
  settings: ChunkingSettings
): Chunk[] {
  const chunks: Chunk[] = []
  let currentChunkId = 0
  let currentTokens = 0
  let chunkStart = 0

  for (let aIdx = 0; aIdx < artifacts.length; aIdx++) {
    const artifact = artifacts[aIdx]
    
    for (let cIdx = 0; cIdx < artifact.contents.length; cIdx++) {
      const content = artifact.contents[cIdx]
      const textTokens = content.text ? estimateTokens(content.text) * settings.textRatio : 0
      const imgTokens = content.media 
        ? calculateImageTokens(content.media, settings.imageTokens, settings.filterEmbedded, settings.filterScreenshot)
        : 0
      const contentTokens = textTokens + imgTokens

      // Check if adding this content would exceed limits
      const wouldExceedTokens = currentTokens + contentTokens > settings.maxTokens
      const imageCount = content.media?.filter(m => {
        if (m.type !== 'image') return false
        if (!settings.filterEmbedded && m.imageType === 'embedded') return false
        if (!settings.filterScreenshot && m.imageType === 'screenshot') return false
        return true
      }).length || 0
      const wouldExceedImages = settings.maxImages !== null && imageCount > settings.maxImages

      // Start a new chunk if limits would be exceeded and we have content
      if ((wouldExceedTokens || wouldExceedImages) && currentTokens > 0) {
        chunks.push({
          id: currentChunkId,
          artifactIdx: aIdx,
          contentIdx: cIdx,
          startToken: chunkStart,
          endToken: chunkStart + currentTokens,
          tokens: currentTokens,
        })
        currentChunkId++
        chunkStart += currentTokens
        currentTokens = contentTokens
      } else {
        currentTokens += contentTokens
      }
    }
  }

  // Add final chunk if there's remaining content
  if (currentTokens > 0) {
    chunks.push({
      id: currentChunkId,
      artifactIdx: artifacts.length - 1,
      contentIdx: artifacts[artifacts.length - 1]?.contents.length - 1 || 0,
      startToken: chunkStart,
      endToken: chunkStart + currentTokens,
      tokens: currentTokens,
    })
  }

  return chunks
}

// Page Minimap Component - Shows pages with chunk colors
function PageMinimap({ 
  artifacts,
  chunks,
  onPageClick,
  selectedPage,
  hoveredPage,
  onPageHover,
  scrollContainerRef,
}: { 
  artifacts: Artifact[]
  chunks: Chunk[]
  onPageClick: (pageNum: number) => void
  selectedPage: number | null
  hoveredPage: number | null
  onPageHover: (pageNum: number | null) => void
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
}) {
  // Build list of all pages with their info
  const pages = useMemo(() => {
    const pageList: Array<{
      pageNum: number
      artifactIdx: number
      contentIdx: number
      screenshotUrl: string | null
      chunk: Chunk | null
    }> = []
    
    artifacts.forEach((artifact, aIdx) => {
      artifact.contents.forEach((content, cIdx) => {
        if (content.page !== undefined) {
          // Find which chunk this page belongs to
          const chunk = chunks.find(c => 
            c.artifactIdx === aIdx && c.contentIdx <= cIdx
          ) || chunks[chunks.length - 1] || null
          
          // Get screenshot URL
          const screenshot = content.media?.find(m => m.imageType === 'screenshot')
          const screenshotUrl = screenshot 
            ? (screenshot.base64 
                ? `data:image/png;base64,${screenshot.base64}` 
                : screenshot.url || null)
            : null
          
          pageList.push({
            pageNum: content.page,
            artifactIdx: aIdx,
            contentIdx: cIdx,
            screenshotUrl,
            chunk,
          })
        }
      })
    })
    
    return pageList
  }, [artifacts, chunks])

  // Group pages by chunk for better visualization
  const pagesByChunk = useMemo(() => {
    if (pages.length === 0) return []
    
    const grouped: Array<{ 
      chunkId: number
      displayChunkNum: number // 1-indexed for display
      pages: typeof pages 
    }> = []
    let currentChunkId = -1
    let currentGroup: typeof pages = []
    let displayChunkCounter = 0
    
    pages.forEach((page) => {
      const pageChunkId = page.chunk?.id ?? -1
      if (pageChunkId !== currentChunkId) {
        if (currentGroup.length > 0) {
          grouped.push({ 
            chunkId: currentChunkId, 
            displayChunkNum: displayChunkCounter,
            pages: currentGroup 
          })
        }
        currentChunkId = pageChunkId
        currentGroup = [page]
        // Only increment counter for valid chunks (not -1)
        if (pageChunkId >= 0) {
          displayChunkCounter++
        }
      } else {
        currentGroup.push(page)
      }
    })
    if (currentGroup.length > 0) {
      grouped.push({ 
        chunkId: currentChunkId, 
        displayChunkNum: displayChunkCounter,
        pages: currentGroup 
      })
    }
    return grouped
  }, [pages])

  const handlePageClick = (pageNum: number, artifactIdx: number, contentIdx: number) => {
    onPageClick(pageNum)
    
    // Scroll to the page element
    if (scrollContainerRef?.current) {
      const pageElement = scrollContainerRef.current.querySelector(`[data-page="${pageNum}"]`)
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  if (pages.length === 0) return null

  return (
    <div className="w-20 flex-shrink-0 bg-[#ede5d8] border border-[#d4c8b8] rounded-lg p-2 flex flex-col gap-3 max-h-[calc(100vh-120px)] overflow-y-auto sticky top-4 self-start">
      <div className="text-[10px] text-[#7a5c3a] text-center font-bold uppercase tracking-wider mb-1">Pages</div>
      
      {pagesByChunk.map((chunkGroup) => {
        const chunkColor = getChunkColor(chunkGroup.chunkId)
        const isEvenChunk = chunkGroup.chunkId % 2 === 0
        const hasValidChunk = chunkGroup.chunkId >= 0
        
        return (
          <div 
            key={`chunk-group-${chunkGroup.chunkId}`}
            className="flex flex-col gap-1"
          >
            {/* Chunk Header - Only show if valid chunk */}
            {hasValidChunk && (
              <div 
                className="flex items-center gap-1 px-1 py-0.5 rounded shadow-sm"
                style={{ backgroundColor: chunkColor }}
              >
                <div className="w-2 h-2 rounded-full bg-white/70" />
                <span className="text-[9px] font-bold text-white">
                  Chunk {chunkGroup.displayChunkNum}
                </span>
              </div>
            )}
            
            {/* Pages in this chunk */}
            <div 
              className="flex flex-col gap-1 pl-1.5 py-1 border-l-3 bg-[#f5efe6]/50 rounded-r" 
              style={{ borderColor: hasValidChunk ? chunkColor : '#d4c8b8' }}
            >
              {chunkGroup.pages.map((page) => {
                const isSelected = selectedPage === page.pageNum
                const isHovered = hoveredPage === page.pageNum
                
                return (
                  <button
                    key={`page-${page.artifactIdx}-${page.contentIdx}`}
                    type="button"
                    onClick={() => handlePageClick(page.pageNum, page.artifactIdx, page.contentIdx)}
                    onMouseEnter={() => onPageHover(page.pageNum)}
                    onMouseLeave={() => onPageHover(null)}
                    className={`
                      relative w-full h-10 rounded overflow-hidden transition-all
                      ${isSelected ? 'ring-2 ring-[#2d1b0e] ring-offset-1' : ''}
                      ${isHovered ? 'scale-105 shadow-lg' : ''}
                    `}
                    title={`Page ${page.pageNum}${hasValidChunk ? ` (Chunk ${chunkGroup.displayChunkNum})` : ''}`}
                  >
                    {/* Background - solid chunk color with varying opacity */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        backgroundColor: hasValidChunk ? chunkColor : '#d4c8b8',
                        opacity: isEvenChunk ? 0.85 : 0.55,
                      }}
                    />
                    
                    {/* Screenshot overlay if available */}
                    {page.screenshotUrl && (
                      <img
                        src={page.screenshotUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply"
                      />
                    )}
                    
                    {/* Page Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {page.pageNum}
                      </span>
                    </div>
                    
                    {/* Hover overlay */}
                    {isHovered && (
                      <div className="absolute inset-0 bg-white/30" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ArtifactViewer({ 
  artifacts,
  chunkingSettings = {
    maxTokens: 10000,
    maxImages: null,
    textRatio: 4,
    imageTokens: 1000,
    filterEmbedded: true,
    filterScreenshot: true,
  },
  isParsing = false,
}: ArtifactViewerProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const [expandedText, setExpandedText] = useState<Set<number>>(new Set())
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [hoveredPage, setHoveredPage] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Calculate chunks based on settings
  const chunks = useMemo(() => {
    if (artifacts.length === 0) return []
    return calculateChunks(artifacts, chunkingSettings)
  }, [artifacts, chunkingSettings])

  const totalTokens = useMemo(() => {
    return chunks.reduce((sum, chunk) => sum + chunk.tokens, 0)
  }, [chunks])

  const toggleText = (index: number) => {
    const newExpanded = new Set(expandedText)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedText(newExpanded)
  }

  const expandAll = () => {
    const allIndices = new Set<number>()
    artifacts.forEach((artifact, aIdx) => {
      artifact.contents.forEach((_, cIdx) => {
        allIndices.add(aIdx * 1000 + cIdx)
      })
    })
    setExpandedText(allIndices)
  }

  const collapseAll = () => {
    setExpandedText(new Set())
  }

  // Find which chunk a content item belongs to
  const getChunkForContent = (aIdx: number, cIdx: number): Chunk | null => {
    // This is simplified - in reality you'd track exact token positions
    for (const chunk of chunks) {
      if (chunk.artifactIdx === aIdx && chunk.contentIdx >= cIdx) {
        return chunk
      }
    }
    return chunks[chunks.length - 1] || null
  }

  const renderVisualView = () => {
    if (artifacts.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-[#a0926f]">
          No artifacts to display
        </div>
      )
    }

    return (
      <div className="flex gap-4">
        {/* Page Minimap */}
        <PageMinimap 
          artifacts={artifacts}
          chunks={chunks}
          onPageClick={setSelectedPage}
          selectedPage={selectedPage}
          hoveredPage={hoveredPage}
          onPageHover={setHoveredPage}
          scrollContainerRef={scrollContainerRef}
        />

        {/* Main Content */}
        <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Info Bar - Shows Chunk/Page Info */}
          <div className="flex items-center gap-3 p-3 bg-[#ede5d8] border border-[#d4c8b8] rounded-lg">
            <Layers className="w-4 h-4 text-[#7a5c3a]" />
            <span className="text-sm text-[#2d1b0e]">
              {hoveredPage ? (
                <>
                  Page <span className="font-semibold">{hoveredPage}</span>
                  {(() => {
                    const pageContent = artifacts.flatMap((a, ai) => 
                      a.contents.map((c, ci) => ({ ...c, artifactIdx: ai, contentIdx: ci }))
                    ).find(c => c.page === hoveredPage)
                    const chunk = pageContent ? chunks.find(c => 
                      c.artifactIdx === pageContent.artifactIdx && c.contentIdx <= pageContent.contentIdx
                    ) || chunks[chunks.length - 1] : null
                    return chunk ? (
                      <>
                        {' '}→ Chunk <span className="font-semibold" style={{ color: getChunkColor(chunk.id) }}>
                          {chunk.id + 1}
                        </span>
                      </>
                    ) : null
                  })()}
                </>
              ) : (
                <>
                  <span className="font-semibold">{chunks.length}</span> chunks from {' '}
                  <span className="font-semibold">{totalTokens.toLocaleString()}</span> tokens
                </>
              )}
            </span>
            {!hoveredPage && (
              <div className="ml-auto flex gap-1">
                {chunks.slice(0, 5).map(chunk => (
                  <div 
                    key={chunk.id}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getChunkColor(chunk.id) }}
                    title={`Chunk ${chunk.id + 1}`}
                  />
                ))}
                {chunks.length > 5 && (
                  <span className="text-xs text-[#a0926f]">+{chunks.length - 5}</span>
                )}
              </div>
            )}
          </div>

          {/* Content with Chunk Boundaries */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={expandAll}
                className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8] hover:text-[#3d2b15]"
              >
                <Expand className="h-4 w-4 mr-2" />
                Expand All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={collapseAll}
                className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8] hover:text-[#3d2b15]"
              >
                <Shrink className="h-4 w-4 mr-2" />
                Collapse All
              </Button>
              <div className="ml-auto text-sm text-[#a0926f]">
                {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {artifacts.map((artifact, aIdx) => {
              const chunk = getChunkForContent(aIdx, 0)
              
              return (
                <Card key={artifact.id} className="bg-[#ede5d8] border-[#d4c8b8]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {chunk && (
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getChunkColor(chunk.id) }}
                            title={`Chunk ${chunk.id + 1}`}
                          />
                        )}
                        <CardTitle className="text-base flex items-center gap-2 text-[#2d1b0e]">
                          {artifact.type === 'image' ? (
                            <ImageIcon className="h-4 w-4 text-[#7a5c3a]" />
                          ) : (
                            <FileText className="h-4 w-4 text-[#7a5c3a]" />
                          )}
                          {artifact.type.toUpperCase()}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-[#a0926f] font-mono">
                        {artifact.id.slice(0, 8)}...
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {artifact.contents.map((content, cIdx) => {
                      const index = aIdx * 1000 + cIdx
                      const isExpanded = expandedText.has(index)
                      const contentChunk = getChunkForContent(aIdx, cIdx)
                      const isChunkBoundary = contentChunk && cIdx > 0 && 
                        getChunkForContent(aIdx, cIdx - 1)?.id !== contentChunk.id

                      // Create unique key for content
                      const contentKey = `${artifact.id}-${content.page || 'no-page'}-${content.text?.slice(0, 50) || 'no-text'}-${cIdx}`

                      return (
                        <div key={contentKey} className="relative">
                          {/* Chunk Boundary - Large Margin with Divider */}
                          {isChunkBoundary && contentChunk && (
                            <div className="relative py-6 my-2">
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#d4c8b8]" />
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#ede5d8] px-3 py-1">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getChunkColor(contentChunk.id) }}
                                />
                                <span 
                                  className="text-xs font-semibold"
                                  style={{ color: getChunkColor(contentChunk.id) }}
                                >
                                  Chunk {contentChunk.id + 1}
                                </span>
                                <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: getChunkColor(contentChunk.id) }} />
                              </div>
                            </div>
                          )}
                           
                             <div 
                               data-page={content.page}
                               className={`border rounded-lg p-3 bg-[#f5efe6] ${
                                 selectedPage !== null && content.page === selectedPage
                                   ? 'ring-2 ring-[#7a5c3a] ring-offset-1'
                                   : ''
                               }`}
                             >
                              {/* Content Layout: Header+Text Left, Screenshot Right */}
                              <div className="flex items-start gap-4">
                                {/* Left Column - Header + Text */}
                                <div className="flex-1 min-w-0">
                                  {/* Header Row */}
                                  <div className="flex items-center gap-2 mb-2">
                                    {contentChunk && (
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getChunkColor(contentChunk.id) }}
                                        title={`Chunk ${contentChunk.id + 1}`}
                                      />
                                    )}
                                    {content.page !== undefined && (
                                      <div className="text-xs font-semibold text-[#7a5c3a]">
                                        Page {content.page}
                                      </div>
                                    )}
                                    {contentChunk && (
                                      <div className="ml-auto text-xs text-[#a0926f]">
                                        ~{contentChunk.tokens.toLocaleString()} tokens
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Text */}
                                  {content.text && (
                                    <div>
                                      <div
                                        className={`text-sm text-[#3d2b15] whitespace-pre-wrap ${
                                          isExpanded ? '' : 'line-clamp-4'
                                        }`}
                                      >
                                        {content.text}
                                      </div>
                                      {content.text.length > 200 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="mt-2 h-6 text-xs text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#e5dccf]"
                                          onClick={() => toggleText(index)}
                                        >
                                          {isExpanded ? 'Show less' : 'Show more'}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Right Column - Screenshot ONLY (no embedded) */}
                                {content.media && content.media.some(m => m.imageType === 'screenshot') && (
                                  <div className="w-auto max-w-[100px] flex-shrink-0">
                                    {content.media
                                      .filter(m => m.imageType === 'screenshot')
                                      .slice(0, 1) // Show only first screenshot
                                      .map((media) => {
                                        const src = media.base64
                                          ? `data:image/png;base64,${media.base64}`
                                          : media.url || ''
                                        
                                        return (
                                          <button
                                            key={`screenshot-${content.page || index}-${media.url || media.base64?.slice(0, 20)}`}
                                            type="button"
                                            className="relative group cursor-pointer block w-full max-w-[100px] aspect-[4/3] p-0 bg-transparent border-0 overflow-hidden rounded border border-[#d4c8b8]"
                                            onClick={() => setSelectedImage(src)}
                                          >
                                            <img
                                              src={src}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                          </button>
                                        )
                                      })}
                                  </div>
                                )}
                              </div>

                              {/* Embedded Images (if any) - shown below text, small and 4:3 */}
                              {content.media && content.media.some(m => m.imageType === 'embedded') && (
                                <div className="mt-3 pt-3 border-t border-[#d4c8b8]">
                                  <div className="text-xs text-[#a0926f] mb-2">Embedded Images</div>
                                  <div className="flex flex-wrap gap-2">
                                    {content.media
                                      .filter(m => m.imageType === 'embedded')
                                      .map((media, mIdx) => {
                                        const src = media.base64
                                          ? `data:image/png;base64,${media.base64}`
                                          : media.url || ''
                                        
                                        return (
                                          <button
                                            key={`embedded-${content.page || index}-${media.url || media.base64?.slice(0, 20) || mIdx}`}
                                            type="button"
                                            className="relative group cursor-pointer block w-16 h-12 p-0 bg-transparent border-0 overflow-hidden rounded border border-[#d4c8b8] flex-shrink-0"
                                            onClick={() => setSelectedImage(src)}
                                          >
                                            <img
                                              src={src}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                          </button>
                                        )
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderJsonView = () => {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(artifacts, null, 2))}
            className="bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] hover:bg-[#ede5d8] hover:text-[#3d2b15]"
          >
            Copy JSON
          </Button>
        </div>
        <pre className="rounded-md bg-[#f5efe6] border border-[#d4c8b8] p-4 overflow-auto max-h-[600px] text-xs font-mono text-[#2d1b0e]">
          {JSON.stringify(artifacts, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <>
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'visual' | 'json')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="mt-0 relative">
          <div className={`transition-opacity duration-300 ${isParsing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {renderVisualView()}
          </div>
          
          {isParsing && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-[#ede5d8]/90 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg border border-[#d4c8b8]">
                <Loader2 className="h-6 w-6 animate-spin text-[#7a5c3a]" />
                <span className="text-[#2d1b0e] font-medium">Parsing...</span>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="json" className="mt-0">
          {renderJsonView()}
        </TabsContent>
      </Tabs>

      {selectedImage && (
        <button
          type="button"
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer border-0"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </button>
      )}
    </>
  )
}