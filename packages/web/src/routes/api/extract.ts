import { createFileRoute } from '@tanstack/react-router'
import { parseFiles, extractData, saveExtraction, generateExtractionId } from '../../server/api'
import busboy from 'busboy'
import { Readable } from 'node:stream'

export const Route = createFileRoute('/api/extract')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get('content-type')
        if (!contentType?.includes('multipart/form-data')) {
          return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        
        const bodyBuffer = await request.arrayBuffer()
        
        const files: File[] = []
        let params: any = {}
        
        await new Promise<void>((resolve, reject) => {
          const headers: Record<string, string> = {}
          request.headers.forEach((v, k) => { headers[k] = v })
          
          const bb = busboy({
            headers,
            limits: { fileSize: 100 * 1024 * 1024 },
          })
          
          bb.on('file', (name, stream, info) => {
            const chunks: Buffer[] = []
            stream.on('data', (chunk: Buffer) => chunks.push(chunk))
            stream.on('end', () => {
              const data = Buffer.concat(chunks)
              const file = new File([data], info.filename || name, { type: info.mimeType || 'application/octet-stream' })
              files.push(file)
            })
          })
          
          bb.on('field', (name, val) => {
            if (name === 'params') {
              params = JSON.parse(val)
            }
          })
          
          bb.on('close', () => resolve())
          bb.on('error', reject)
          
          const nodeStream = Readable.from(Buffer.from(bodyBuffer))
          nodeStream.pipe(bb)
        })
        
        if (files.length === 0) {
          return new Response(JSON.stringify({ error: 'No files provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        
        const { schemaMode, schemaJson, fields, model, strategy, chunkSize, parsingOptions } = params
        
        const artifacts = await parseFiles(files, parsingOptions ?? {})
        
        const result = await extractData(
          artifacts,
          schemaMode,
          schemaJson,
          fields,
          model,
          strategy,
          chunkSize,
        )
        
        const id = generateExtractionId()
        const savedPath = await saveExtraction(id, {
          files: files.map(f => f.name),
          schema: schemaMode === 'json' ? schemaJson : fields,
          result: result.data,
          artifacts,
        })
        
        return new Response(JSON.stringify({
          artifacts,
          result,
          savedPath,
        }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
