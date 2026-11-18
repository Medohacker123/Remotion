import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const MP4_PATH = path.resolve(__dirname, 'public/out/sudan-digital-45s.mp4');

async function startServer() {
  const app = express();

  app.get('/api/video-info', (_req, res) => {
    if (!fs.existsSync(MP4_PATH)) {
      res.json({ready: false, message: 'MP4 render in progress'});
      return;
    }
    const stat = fs.statSync(MP4_PATH);
    res.json({
      ready: true,
      filename: 'sudan-digital-45s-60fps.mp4',
      sizeBytes: stat.size,
      durationSeconds: 45,
      fps: 60,
      resolution: '1080x1920',
      fourKAvailable: true,
      downloadUrl: '/api/download-mp4',
      publicUrl: '/out/sudan-digital-45s.mp4',
    });
  });

  app.get('/api/download-mp4', (req, res) => {
    if (!fs.existsSync(MP4_PATH)) {
      res.status(404).json({error: 'Rendered MP4 file not found'});
      return;
    }
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sudan-digital-45s-60fps.mp4"',
    );
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(MP4_PATH);
  });

  // Always serve public/ assets directly (including /out/sudan-digital-45s.mp4)
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!IS_PROD) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
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
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
