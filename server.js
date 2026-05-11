import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Redirection Middleware
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const url = req.url;
    
    // 1. Redirect HTTP to HTTPS (for production environments with proxy)
    const isHttp = req.headers['x-forwarded-proto'] === 'http';
    
    // 2. Redirect WWW to Non-WWW
    const isWww = host.startsWith('www.');
    
    // 3. Trailing Slash Removal
    const hasTrailingSlash = url.length > 1 && url.endsWith('/');
    
    // 4. Accent/Special Character Cleaning (ASCII only)
    const decodedUrl = decodeURIComponent(url);
    const normalizedUrl = decodedUrl.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isAccented = decodedUrl !== normalizedUrl;

    if (isHttp || isWww || hasTrailingSlash || isAccented) {
      let newHost = host;
      if (isWww) newHost = host.slice(4);
      
      let newUrl = url;
      if (isAccented) {
        newUrl = encodeURIComponent(normalizedUrl).replace(/%2F/g, '/');
      }
      if (newUrl.length > 1 && newUrl.endsWith('/')) {
        newUrl = newUrl.slice(0, -1);
      }

      // Final Check: ensure we are not redirecting to the same URL (infinite loop)
      const target = `https://${newHost}${newUrl}`;
      const current = `https://${host}${url}`;
      
      if (target !== current) {
        return res.redirect(301, target);
      }
    }
    
    next();
  });

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-src 'self' https:;");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // Servir arquivos estáticos com cache de 1 ano
  app.use(express.static(path.resolve(__dirname, 'dist'), {
    maxAge: '1y',
    immutable: true,
    index: false
  }))

  app.use(async (req, res) => {
    try {
      const url = req.originalUrl

      let template = await fs.readFile(
        path.resolve(__dirname, 'dist/index.html'),
        'utf-8'
      )

      // Em produção, importamos o bundle do servidor gerado pelo build
      const render = (await import('./dist/server/entry-server.js')).render

      const appHtml = await render(url)

      const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app }
}

createServer().then(({ app }) =>
  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000')
  })
)
