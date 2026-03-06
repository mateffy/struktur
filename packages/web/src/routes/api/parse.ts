import { createFileRoute } from '@tanstack/react-router'
import { parseFiles } from '../../server/api'
import busboy from 'busboy'
import { Readable } from 'node:stream'

export const Route = createFileRoute('/api/parse')({
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
        let options: any = {}
        
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
            if (name === 'options') {
              options = JSON.parse(val)
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
        
        const artifacts = await parseFiles(files, options)
        
        return new Response(JSON.stringify({ artifacts }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
