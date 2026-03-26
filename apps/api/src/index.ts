import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import assessments from './routes/assessments'
import sessions from './routes/sessions'
import results from './routes/results'
import careers from './routes/careers'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5006'],
    credentials: true,
  })
)

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'MyKite API',
    version: '0.1.0',
    status: 'healthy',
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.route('/api/assessments', assessments)
app.route('/api/sessions', sessions)
app.route('/api/results', results)
app.route('/api/careers', careers)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  )
})

// Start server
const port = parseInt(process.env.PORT ?? '5006')

console.log(`🚀 Server starting on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
