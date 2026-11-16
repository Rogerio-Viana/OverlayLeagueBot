import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { ConfigService } from './services/configService.js';
import { LolLiveClientService } from './services/lolClient.js';
import {
  getMockOverlayState,
  triggerMockEvent,
  triggerMockItemPurchase,
  triggerMockItemSale,
  type MockEventKind,
} from './services/mockData.js';
import type { OverlayConfig, OverlayState, SoundTriggerKey } from './types/lol.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SOUNDS_DIR = path.join(PUBLIC_DIR, 'sounds');
const CUSTOM_ICONS_DIR = path.join(PUBLIC_DIR, 'custom-icons');

const PORT = Number(process.env.PORT ?? 3333);
const POLL_INTERVAL_MS = 1000;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});
app.use(express.static(PUBLIC_DIR, { etag: false, lastModified: false }));

const configService = new ConfigService();
await configService.load();

const lolService = new LolLiveClientService();
let mockMode = process.env.MOCK_MODE === 'true';
let latestState: OverlayState = {
  status: 'OFFLINE',
  ddragonVersion: '15.22.1',
  gameMode: '',
  gameTime: 0,
  turretsDestroyed: 0,
  activePlayer: null,
  purchasedItems: [],
  latestPurchasedItem: null,
  latestSoldItem: null,
  latestEvent: null,
  latestMonsterEvent: null,
  latestMapEvent: null,
  updatedAt: Date.now(),
};

app.get('/api/state', (_req, res) => {
  res.json({ mockMode, config: configService.get(), state: latestState });
});

app.get('/api/config', (_req, res) => {
  res.json(configService.get());
});

app.post('/api/config', async (req, res) => {
  const updated = await configService.update(req.body as Partial<OverlayConfig>);
  broadcastMessage({ type: 'config', payload: updated });
  res.json(updated);
});

const VALID_SOUND_KEYS: SoundTriggerKey[] = [
  'itemBuy',
  'itemSell',
  'dragon',
  'baron',
  'herald',
  'turret',
  'kill',
  'death',
  'assist',
  'firstBlood',
  'doubleKill',
  'tripleKill',
  'quadraKill',
  'pentaKill',
  'enemyBad',
];
const ALLOWED_AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.webm', '.m4a']);

app.post('/api/sounds/:key', async (req, res) => {
  const key = req.params.key as SoundTriggerKey;
  if (!VALID_SOUND_KEYS.includes(key)) {
    res.status(400).json({ error: 'Invalid sound key' });
    return;
  }

  const fileName = String(req.body?.fileName ?? '');
  const dataBase64 = String(req.body?.dataBase64 ?? '');
  const ext = path.extname(fileName).toLowerCase() || '.mp3';
  if (!ALLOWED_AUDIO_EXTS.has(ext) || !dataBase64) {
    res.status(400).json({ error: 'Invalid audio file' });
    return;
  }

  await fs.mkdir(SOUNDS_DIR, { recursive: true });
  const targetName = `${key}${ext}`;
  const targetPath = path.join(SOUNDS_DIR, targetName);
  const cleanBase64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;
  await fs.writeFile(targetPath, Buffer.from(cleanBase64, 'base64'));

  const soundUrl = `/sounds/${targetName}?t=${Date.now()}`;
  const current = configService.get();
  const updated = await configService.update({
    soundConfig: {
      ...current.soundConfig,
      customFiles: {
        ...current.soundConfig.customFiles,
        [key]: soundUrl,
      },
    },
  });

  broadcastMessage({ type: 'config', payload: updated });
  res.json({ ok: true, soundUrl, config: updated });
});

app.delete('/api/sounds/:key', async (req, res) => {
  const key = req.params.key as SoundTriggerKey;
  if (!VALID_SOUND_KEYS.includes(key)) {
    res.status(400).json({ error: 'Invalid sound key' });
    return;
  }

  const current = configService.get();
  const nextCustom = { ...current.soundConfig.customFiles };
  delete nextCustom[key];

  const updated = await configService.update({
    soundConfig: {
      ...current.soundConfig,
      customFiles: nextCustom,
    },
  });

  broadcastMessage({ type: 'config', payload: updated });
  res.json({ ok: true, config: updated });
});

const VALID_EVENT_IMAGE_KEYS = new Set([
  'dragon-fire',
  'dragon-water',
  'dragon-earth',
  'dragon-air',
  'dragon-hextech',
  'dragon-chemtech',
  'dragon-elder',
  'baron',
  'herald',
  'voidgrubs',
  'turret',
  'inhibitor',
  'kill',
  'death',
  'assist',
  'first-blood',
  'double-kill',
  'triple-kill',
  'quadra-kill',
  'penta-kill',
  'multikill',
  'ace',
]);
const ALLOWED_IMAGE_EXTS = new Set(['.gif', '.png', '.jpg', '.jpeg', '.webp']);

app.post('/api/event-images/:key', async (req, res) => {
  const key = req.params.key;
  if (!VALID_EVENT_IMAGE_KEYS.has(key)) {
    res.status(400).json({ error: 'Invalid event image key' });
    return;
  }

  const fileName = String(req.body?.fileName ?? '');
  const dataBase64 = String(req.body?.dataBase64 ?? '');
  const ext = path.extname(fileName).toLowerCase() || '.png';
  if (!ALLOWED_IMAGE_EXTS.has(ext) || !dataBase64) {
    res.status(400).json({ error: 'Invalid image/GIF file' });
    return;
  }

  await fs.mkdir(CUSTOM_ICONS_DIR, { recursive: true });
  const targetName = `${key}${ext}`;
  const targetPath = path.join(CUSTOM_ICONS_DIR, targetName);
  const cleanBase64 = dataBase64.includes(',') ? dataBase64.split(',')[1] : dataBase64;
  await fs.writeFile(targetPath, Buffer.from(cleanBase64, 'base64'));

  const imageUrl = `/custom-icons/${targetName}?t=${Date.now()}`;
  const current = configService.get();
  const updated = await configService.update({
    eventConfig: {
      ...current.eventConfig,
      customImages: {
        ...current.eventConfig.customImages,
        [key]: imageUrl,
      },
    },
  });

  broadcastMessage({ type: 'config', payload: updated });
  res.json({ ok: true, imageUrl, config: updated });
});

app.delete('/api/event-images/:key', async (req, res) => {
  const key = req.params.key;
  if (!VALID_EVENT_IMAGE_KEYS.has(key)) {
    res.status(400).json({ error: 'Invalid event image key' });
    return;
  }

  const current = configService.get();
  const nextCustom = { ...current.eventConfig.customImages };
  delete nextCustom[key];

  const updated = await configService.update({
    eventConfig: {
      ...current.eventConfig,
      customImages: nextCustom,
    },
  });

  broadcastMessage({ type: 'config', payload: updated });
  res.json({ ok: true, config: updated });
});

app.post('/api/mock', (req, res) => {
  const enabled = Boolean(req.body?.enabled);
  mockMode = enabled;
  void pollAndBroadcast();
  res.json({ mockMode });
});

const VALID_MOCK_EVENTS: MockEventKind[] = [
  'first_blood',
  'double_kill',
  'triple_kill',
  'quadra_kill',
  'penta_kill',
  'dragon',
  'dragon_fire',
  'dragon_water',
  'dragon_earth',
  'dragon_air',
  'dragon_hextech',
  'dragon_chemtech',
  'dragon_elder',
  'enemy_dragon',
  'enemy_baron',
  'enemy_turret',
  'baron',
  'herald',
  'voidgrubs',
  'turret',
  'inhibitor',
  'kill',
  'death',
  'assist',
  'pentakill',
];

app.post('/api/mock/event', (req, res) => {
  const kind = req.body?.kind as MockEventKind | undefined;
  if (!kind || !VALID_MOCK_EVENTS.includes(kind)) {
    res.status(400).json({ error: 'Invalid event kind' });
    return;
  }
  mockMode = true;
  const banner = triggerMockEvent(kind);
  void pollAndBroadcast();
  res.json({ ok: true, banner });
});

app.post('/api/mock/buy-item', async (_req, res) => {
  mockMode = true;
  const item = await triggerMockItemPurchase();
  void pollAndBroadcast();
  res.json({ ok: true, item });
});

app.post('/api/mock/sell-item', async (_req, res) => {
  mockMode = true;
  const item = await triggerMockItemSale();
  void pollAndBroadcast();
  res.json({ ok: true, item });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'config', payload: configService.get() }));
  ws.send(JSON.stringify({ type: 'state', payload: latestState }));
});

function broadcastMessage(data: unknown): void {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function broadcastState(state: OverlayState): void {
  broadcastMessage({ type: 'state', payload: state });
}

let polling = false;
async function pollAndBroadcast(): Promise<void> {
  if (polling) return;
  polling = true;
  try {
    latestState = mockMode
      ? await getMockOverlayState()
      : await lolService.pollOverlayState();
    broadcastState(latestState);
  } finally {
    polling = false;
  }
}

setInterval(() => {
  void pollAndBroadcast();
}, POLL_INTERVAL_MS);

function openDashboardInBrowser(url: string): void {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, () => {
    // ignore browser launch errors in headless environments
  });
}

server.listen(PORT, () => {
  const dashboardUrl = `http://localhost:${PORT}`;
  console.log(`[OverlayLeagueBot] Dashboard: ${dashboardUrl}`);
  console.log(`[OverlayLeagueBot] OBS Overlay: ${dashboardUrl}/overlay.html`);
  if (process.argv.includes('--open') || process.env.AUTO_OPEN === 'true') {
    openDashboardInBrowser(dashboardUrl);
  }
  void pollAndBroadcast();
});
