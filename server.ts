import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'app_state.json');
const BUILD_VERSION = '1.2.0-' + Date.now();

// Active SSE client connections for instant Realtime data push
const sseClients = new Set<express.Response>();

function broadcastRealtimeUpdate(payload: any) {
  const data = JSON.stringify(payload);
  for (const client of sseClients) {
    try {
      client.write(`event: state_update\ndata: ${data}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to safely read state
function readServerState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, 'utf-8');
      if (content && content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error('[Server] Failed to read app_state.json:', err);
  }
  return null;
}

// Helper to safely write state atomically
function writeServerState(state: any) {
  try {
    const tmpFile = `${STATE_FILE}.tmp.${Date.now()}`;
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
      serverVersion: (state.serverVersion || 0) + 1,
    };
    fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tmpFile, STATE_FILE);
    return payload;
  } catch (err) {
    console.error('[Server] Failed to save app_state.json:', err);
    throw err;
  }
}

async function startServer() {
  const app = express();

  // Allow larger payloads (e.g. photos/receipts in base64)
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // CORS headers for iframe / preview support
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API 1: Health check & App Version
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Masjid Cloud State Sync API',
      version: BUILD_VERSION,
      time: new Date().toISOString(),
    });
  });

  // API 2: Lightweight sync check (timestamp and version)
  app.get('/api/sync', (_req, res) => {
    const state = readServerState();
    if (!state) {
      return res.json({
        exists: false,
        updatedAt: null,
        serverVersion: 0,
      });
    }
    return res.json({
      exists: true,
      updatedAt: state.updatedAt || null,
      serverVersion: state.serverVersion || 1,
    });
  });

  // API 3: Get full application state
  app.get('/api/state', (_req, res) => {
    const state = readServerState();
    res.json({
      success: true,
      data: state,
    });
  });

  // API 4: Save / synchronize full application state + Realtime Push
  app.post('/api/state', (req, res) => {
    try {
      const incomingState = req.body;
      if (!incomingState || typeof incomingState !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid state payload' });
      }

      const saved = writeServerState(incomingState);

      // Instantly push to all connected clients via SSE
      broadcastRealtimeUpdate({
        type: 'STATE_UPDATED',
        state: saved,
        serverVersion: saved.serverVersion,
        updatedAt: saved.updatedAt,
      });

      res.json({
        success: true,
        updatedAt: saved.updatedAt,
        serverVersion: saved.serverVersion,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to persist state' });
    }
  });

  // API 5: Server-Sent Events (SSE) for 2-Way Realtime Data Sync
  app.get('/api/realtime', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Initial greeting event
    res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString(), build: BUILD_VERSION })}\n\n`);

    sseClients.add(res);

    // Heartbeat to keep connection alive through proxies
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // API 6: Get accounts/users directly
  app.get('/api/users', (_req, res) => {
    const state = readServerState();
    const users = state?.users || [];
    res.json({ success: true, users });
  });

  // API 7: Save/update users directly + Realtime Push
  app.post('/api/users', (req, res) => {
    try {
      const { users } = req.body;
      if (!Array.isArray(users)) {
        return res.status(400).json({ success: false, error: 'users must be an array' });
      }
      const state = readServerState() || {};
      state.users = users;
      const saved = writeServerState(state);

      // Push realtime update
      broadcastRealtimeUpdate({
        type: 'STATE_UPDATED',
        state: saved,
        serverVersion: saved.serverVersion,
        updatedAt: saved.updatedAt,
      });

      res.json({
        success: true,
        users: saved.users,
        updatedAt: saved.updatedAt,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to update users' });
    }
  });

  // Development vs Production Mode
  const isDev = process.env.NODE_ENV !== 'production' || !fs.existsSync(path.resolve(__dirname, 'dist'));

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in dev mode');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.url.startsWith('/api')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving production build from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Masjid App server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
