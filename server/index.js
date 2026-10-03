import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import authRouter from './routes/auth';
import syncRouter from './routes/sync';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use(
  '*',
  secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin'
  })
);

// Health Check API
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BiHua Cloudflare Edge Worker',
    env: c.env.ENVIRONMENT || 'development'
  });
});

// Mount Sub-routers
app.route('/api/auth', authRouter);
app.route('/api/sync', syncRouter);

// Fallback: Static Assets & Single-Page Application (SPA) routing
// Cloudflare Workers Assets binding (c.env.ASSETS) serves files from the ./dist directory
app.all('*', async (c) => {
  // If request begins with /api/ and wasn't matched, return 404 JSON
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Endpoint Not Found' }, 404);
  }

  // If ASSETS binding is available (Cloudflare Workers Static Assets)
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    
    // Fetch static asset
    const res = await c.env.ASSETS.fetch(c.req.raw);

    // If 404 and it looks like an HTML navigation route (not a static file with extension)
    // rewrite request to /index.html for client-side React Router (SPA)
    if (res.status === 404 && c.req.method === 'GET') {
      const hasFileExtension = url.pathname.split('/').pop().includes('.');
      if (!hasFileExtension) {
        const indexRequest = new Request(new URL('/', c.req.url), c.req.raw);
        return await c.env.ASSETS.fetch(indexRequest);
      }
    }

    return res;
  }

  return c.text('Not Found', 404);
});

export default app;
