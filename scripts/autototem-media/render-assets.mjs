import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const composition = args.get('--composition');
const outDir = args.get('--out');
const workDir = args.get('--work');
const fps = Number(args.get('--fps') || 24);

if (!composition || !outDir || !workDir) {
  throw new Error('Usage: render-assets.mjs --composition render.html --out <dir> --work <dir> --fps 24');
}

class CDP {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const client = new CDP(ws);
      ws.addEventListener('open', () => resolve(client), { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
  }

  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.waiters = new Map();
    ws.addEventListener('message', (event) => this.receive(event.data));
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitFor(method) {
    return new Promise((resolve) => {
      const list = this.waiters.get(method) || [];
      list.push(resolve);
      this.waiters.set(method, list);
    });
  }

  receive(raw) {
    const message = JSON.parse(raw);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    if (message.method && this.waiters.has(message.method)) {
      const list = this.waiters.get(message.method);
      this.waiters.delete(message.method);
      for (const resolve of list) resolve(message.params || {});
    }
  }

  close() {
    this.ws.close();
  }
}

const chromium = process.env.CHROMIUM_BIN || await findChromium();
const staticAssets = [
  { asset: 'instagram-post-fila', width: 1080, height: 1080, file: 'instagram-post-fila.png', t: 1.8 },
  { asset: 'instagram-story-cardapio', width: 1080, height: 1920, file: 'instagram-story-cardapio.png', t: 2.4 },
  { asset: 'facebook-post-operacao', width: 1200, height: 630, file: 'facebook-post-operacao.png', t: 1.8 },
  { asset: 'youtube-thumb-demo', width: 1280, height: 720, file: 'youtube-thumb-demo.png', t: 2.2 },
];
const videoAssets = [
  { asset: 'autototem-reels-fila-pico', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-fila-pico', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-gargalo', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-gargalo', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-6-motivos', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-6-motivos', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-onde-usar', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-onde-usar', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-restaurante', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-restaurante', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-hardware-real', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-hardware-real', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-pix-balcao', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-pix-balcao', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-clinicas', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-clinicas', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-varejo-cadastro', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-varejo-cadastro', width: 1280, height: 720, duration: 8 },
  { asset: 'autototem-reels-checklist-implantacao', width: 1080, height: 1920, duration: 8 },
  { asset: 'autototem-youtube-checklist-implantacao', width: 1280, height: 720, duration: 8 },
];
const onlyAssets = new Set((process.env.ONLY_ASSETS || '').split(/[,\s]+/).filter(Boolean));
const shouldRender = (item) => onlyAssets.size === 0 || onlyAssets.has(item.asset) || onlyAssets.has(item.file);

await mkdir(outDir, { recursive: true });
await mkdir(workDir, { recursive: true });

for (const item of staticAssets.filter(shouldRender)) {
  const browser = await launchBrowser(item);
  try {
    await browser.setTime(item.t);
    await browser.capture(path.join(outDir, item.file));
    console.log(`Rendered ${item.file}`);
  } finally {
    await browser.close();
  }
}

for (const item of videoAssets.filter(shouldRender)) {
  const frameDir = path.join(workDir, item.asset);
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });
  const browser = await launchBrowser(item);
  try {
    const totalFrames = Math.round(item.duration * fps);
    for (let frame = 0; frame < totalFrames; frame += 1) {
      const seconds = frame / fps;
      await browser.setTime(seconds);
      await browser.capture(path.join(frameDir, `${String(frame + 1).padStart(4, '0')}.png`));
      if ((frame + 1) % fps === 0) {
        console.log(`Rendered ${item.asset}: ${Math.min(item.duration, Math.floor(seconds + 1))}s/${item.duration}s`);
      }
    }
  } finally {
    await browser.close();
  }
}

async function findChromium() {
  const candidates = ['/snap/bin/chromium', 'chromium', 'google-chrome'];
  for (const candidate of candidates) {
    try {
      const child = spawn(candidate, ['--version'], { stdio: 'ignore' });
      const code = await new Promise((resolve) => child.on('close', resolve));
      if (code === 0) return candidate;
    } catch {}
  }
  throw new Error('Could not find Chromium or Chrome.');
}

async function launchBrowser({ asset, width, height }) {
  const port = 9300 + (process.pid % 400);
  const profile = `/tmp/autototem-chrome-${process.pid}-${asset}`;
  const url = fileUrl(composition, { asset, t: 0 });
  const child = spawn(chromium, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--mute-audio',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    url,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  child.stderr.on('data', () => {});
  await waitForJson(port);
  const target = await waitForPageTarget(port);
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send('Page.navigate', { url });
  await cdp.waitFor('Page.loadEventFired');
  await cdp.send('Runtime.evaluate', {
    expression: 'document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()',
    awaitPromise: true,
  });

  return {
    async setTime(seconds) {
      await cdp.send('Runtime.evaluate', {
        expression: `window.__setRenderTime(${Number(seconds).toFixed(4)})`,
        awaitPromise: true,
      });
    },
    async capture(filename) {
      const result = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await writeFile(filename, Buffer.from(result.data, 'base64'));
    },
    async close() {
      try {
        await cdp.close();
      } finally {
        child.kill('SIGTERM');
      }
    },
  };
}

function fileUrl(filename, params) {
  const search = new URLSearchParams(params).toString();
  return `file://${path.resolve(filename)}?${search}`;
}

async function waitForJson(port) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error(`Chromium did not expose CDP on port ${port}.`);
}

async function waitForPageTarget(port) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await response.json();
    const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
    if (page) return page;
    await sleep(100);
  }
  throw new Error(`Chromium did not expose a page target on port ${port}.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
