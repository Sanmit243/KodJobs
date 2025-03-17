import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-users',
      configureServer(server) {
        server.middlewares.use('/api/users', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const users = JSON.parse(body)
                writeFileSync(
                  resolve(process.cwd(), 'src/users.json'),
                  JSON.stringify(users, null, 2)
                )
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('Error updating users:', errorMessage)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: errorMessage }))
              }
            })
          } else {
            res.statusCode = 404
            res.end()
          }
        })
      }
    }
  ]
})
