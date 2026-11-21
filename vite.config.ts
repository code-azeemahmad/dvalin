/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function webProxyPlugin(): Plugin {
  const handleProxy = async (req: any, res: any) => {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const target = parsedUrl.searchParams.get('url');
      if (!target) {
        res.statusCode = 400;
        res.end('Missing url parameter');
        return;
      }

      let parsedTarget: URL;
      try {
        parsedTarget = new URL(target);
      } catch {
        res.statusCode = 400;
        res.end('Invalid URL');
        return;
      }

      if (parsedTarget.protocol !== 'http:' && parsedTarget.protocol !== 'https:') {
        res.statusCode = 400;
        res.end('Only http and https protocols are supported');
        return;
      }

      const response = await fetch(target, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });

      const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
      res.statusCode = response.status;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Proxy-Target', target);

      // Strip frame-blocking headers: x-frame-options & csp are omitted
      if (contentType.includes('text/html')) {
        let html = await response.text();

        const targetOrigin = parsedTarget.origin;
        const targetPath = parsedTarget.pathname;
        const baseHref = new URL(targetPath, targetOrigin).href;

        const script = `
<base href="${baseHref}">
<script>
document.addEventListener('click', function(e) {
  var a = e.target.closest('a');
  if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
    e.preventDefault();
    try { window.parent.postMessage({ type: 'WEBOS_NAVIGATE', url: a.href }, '*'); } catch (err) {}
    window.location.href = '/api/proxy?url=' + encodeURIComponent(a.href);
  }
}, true);
document.addEventListener('submit', function(e) {
  var form = e.target;
  if (form && form.action) {
    e.preventDefault();
    var formData = new FormData(form);
    var searchParams = new URLSearchParams(formData);
    var method = (form.method || 'GET').toUpperCase();
    if (method === 'GET') {
      var actionUrl = new URL(form.action, window.location.href);
      searchParams.forEach(function(val, key) { actionUrl.searchParams.set(key, val); });
      try { window.parent.postMessage({ type: 'WEBOS_NAVIGATE', url: actionUrl.href }, '*'); } catch (err) {}
      window.location.href = '/api/proxy?url=' + encodeURIComponent(actionUrl.href);
    }
  }
}, true);
</script>`;

        if (html.includes('<head>')) {
          html = html.replace('<head>', '<head>' + script);
        } else if (html.includes('<html>')) {
          html = html.replace('<html>', '<html><head>' + script + '</head>');
        } else {
          html = script + html;
        }

        res.end(html);
      } else {
        const arrayBuf = await response.arrayBuffer();
        res.end(Buffer.from(arrayBuf));
      }
    } catch (err: any) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<html><body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem;">
        <h2>Failed to connect to website</h2>
        <p style="color: #94a3b8;">${err?.message || 'Gateway Timeout or Connection Error'}</p>
      </body></html>`);
    }
  };

  return {
    name: 'webos-web-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', handleProxy);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/proxy', handleProxy);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), webProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.bin', '**/*.wasm', '**/*.iso'],
  server: {
    port: 5173,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  preview: {
    port: 4173,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  build: {
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
