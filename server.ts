import express, {type Request, type Response} from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

/** The final master render. Served as /out/... and downloaded through /api/download-mp4. */
const MP4_CANDIDATES = [
  path.resolve(__dirname, 'public/out/sudan-digital-45s.mp4'),
  path.resolve(__dirname, 'out/sudan-digital-45s.mp4'),
];
const MANIFEST_CANDIDATES = [
  path.resolve(__dirname, 'public/out/sudan-digital-45s.manifest.json'),
  path.resolve(__dirname, 'out/sudan-digital-45s.manifest.json'),
];

const firstExisting = (list: string[]): string | null =>
  list.find((p) => fs.existsSync(p)) ?? null;

function readManifest() {
  const p = firstExisting(MANIFEST_CANDIDATES);
  if (!p) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.json({ok: true, service: 'sudan-digital-motion-studio'});
  });

  app.get('/api/video-info', (_req, res) => {
    const mp4 = firstExisting(MP4_CANDIDATES);
    if (!mp4) {
      res.json({ready: false, message: 'MP4 render in progress'});
      return;
    }
    const stat = fs.statSync(mp4);
    const manifest = readManifest() ?? {};
    res.json({
      ready: true,
      filename: 'sudan-digital-45s-60fps.mp4',
      sizeBytes: stat.size,
      durationSeconds: manifest.durationSeconds ?? 45,
      totalFrames: manifest.totalFrames ?? 2700,
      fps: manifest.fps ?? 60,
      resolution: manifest.resolution ?? '1080x1920',
      videoCodec: manifest.videoCodec ?? 'h264',
      audioCodec: manifest.audioCodec ?? 'aac',
      pixelFormat: manifest.pixelFormat ?? 'yuv420p',
      fourKAvailable: true,
      fourKComposition: '2160x3840 (composition SudanDigitalPromo4K)',
      downloadUrl: '/api/download-mp4',
      publicUrl: '/out/sudan-digital-45s.mp4',
    });
  });

  // Content-Disposition: attachment so a click always saves the file
  const sendDownload = (_req: Request, res: Response) => {
    const mp4 = firstExisting(MP4_CANDIDATES);
    if (!mp4) {
      res.status(404).json({error: 'Rendered MP4 file not found'});
      return;
    }
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sudan-digital-45s-60fps.mp4"',
    );
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(mp4, {acceptRanges: true}, (err?: Error) => {
      if (err && !res.headersSent) {
        res.status(500).json({error: 'Failed to stream MP4'});
      }
    });
  };

  app.get('/api/download-mp4', sendDownload);
  app.head('/api/download-mp4', sendDownload);

  // Explicit MP4 route (before the SPA fallback) so a missing render is a real 404
  // instead of an index.html 200.
  app.get('/out/:file', (req, res, next) => {
    const requested = path.basename(req.params.file);
    if (!requested.endsWith('.mp4')) return next();
    const filePath = path.resolve(__dirname, 'public/out', requested);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({error: 'Render not found', file: requested});
      return;
    }
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(filePath, {acceptRanges: true});
  });

  // Always serve public/ assets directly (including /out/sudan-digital-45s.mp4)
  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      acceptRanges: true,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4')) {
          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader('Accept-Ranges', 'bytes');
        }
      },
    }),
  );

  if (!IS_PROD) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // The sandbox preview serves this app from a proxied host
        // (https://<port>-<sandbox>.e2b.app), so host/origin checks must allow it.
        allowedHosts: true,
        cors: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sudan Digital Motion Studio listening on http://0.0.0.0:${PORT}`);
    const mp4 = firstExisting(MP4_CANDIDATES);
    console.log(
      mp4
        ? `MP4 master: ${mp4} (${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB)`
        : 'MP4 master: not rendered yet',
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
