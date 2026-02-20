#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const NEXT_PORT = 3100;
const DRIVER_PORT = 4444;
const FPS = 30;
const DURATION_SECONDS = 8;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

const cwd = process.cwd();
const outputPath = path.join(cwd, 'public', 'liquid-logo.mp4');
const framesDir = await fs.mkdtemp(path.join(os.tmpdir(), 'liquid-logo-frames-'));

const pageUrl = `http://127.0.0.1:${NEXT_PORT}/liquid-logo?capture=1`;
const driverUrl = `http://127.0.0.1:${DRIVER_PORT}`;

let nextProcess;
let driverProcess;
let sessionId;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForCondition(check, timeoutMs, label, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await check()) {
        return;
      }
    } catch {
      // ignore transient startup errors
    }

    await delay(intervalMs);
  }

  throw new Error(`Timed out waiting for ${label}`);
}

function wireProcessLogs(processHandle, label) {
  processHandle.stdout?.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`[${label}] ${text}`);
    }
  });

  processHandle.stderr?.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.error(`[${label}] ${text}`);
    }
  });
}

async function terminateProcess(processHandle, name) {
  if (!processHandle || processHandle.killed) {
    return;
  }

  processHandle.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => {
      processHandle.once('exit', resolve);
    }),
    delay(5000),
  ]);

  if (!processHandle.killed) {
    processHandle.kill('SIGKILL');
  }

  console.log(`${name} stopped.`);
}

async function webdriverRequest(endpoint, method = 'GET', body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30_000);

  let response;
  try {
    response = await fetch(`${driverUrl}${endpoint}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.value?.error) {
    const message = payload?.value?.message || response.statusText || 'Unknown WebDriver error';
    throw new Error(message);
  }

  return payload;
}

async function webdriverRequestNoThrow(endpoint, method = 'GET', body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30_000);

  try {
    await fetch(`${driverUrl}${endpoint}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function executeScript(script, args = []) {
  const payload = await webdriverRequest(`/session/${sessionId}/execute/sync`, 'POST', {
    script,
    args,
  });

  return payload.value;
}

async function runCommand(command, args, name) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });
  });
}

async function cleanup() {
  try {
    if (sessionId) {
      await webdriverRequestNoThrow(`/session/${sessionId}`, 'DELETE');
      sessionId = undefined;
    }
  } catch (error) {
    console.error('Failed to close WebDriver session:', error.message);
  }

  await terminateProcess(driverProcess, 'safaridriver');
  await terminateProcess(nextProcess, 'next dev server');

  try {
    await fs.rm(framesDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(1);
});

try {
  console.log('Starting Next.js dev server...');
  nextProcess = spawn('npm', ['run', 'dev', '--', '--port', String(NEXT_PORT)], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  wireProcessLogs(nextProcess, 'next');

  await waitForCondition(
    async () => {
      const response = await fetch(pageUrl);
      return response.ok;
    },
    120_000,
    'Next.js page startup',
  );

  console.log('Starting safaridriver...');
  driverProcess = spawn('safaridriver', ['-p', String(DRIVER_PORT)], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  wireProcessLogs(driverProcess, 'safaridriver');

  await waitForCondition(
    async () => {
      const response = await fetch(`${driverUrl}/status`);
      return response.ok;
    },
    30_000,
    'safaridriver startup',
  );

  const sessionPayload = await webdriverRequest('/session', 'POST', {
    capabilities: {
      alwaysMatch: {
        browserName: 'safari',
        pageLoadStrategy: 'none',
      },
    },
  });

  sessionId = sessionPayload?.value?.sessionId;
  if (!sessionId) {
    throw new Error('Failed to create WebDriver session with Safari.');
  }

  console.log(`WebDriver session started: ${sessionId}`);

  await webdriverRequestNoThrow(`/session/${sessionId}/url`, 'POST', { url: pageUrl });

  console.log('Waiting for capture API to become ready...');
  await waitForCondition(
    async () => {
      const ready = await executeScript(
        'return Boolean(window.__liquidLogoCapture && window.__liquidLogoCapture.isReady && window.__liquidLogoCapture.isReady());',
      );
      return ready === true;
    },
    120_000,
    'liquid-logo capture API',
  );

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS} fps...`);

  for (let i = 0; i < TOTAL_FRAMES; i += 1) {
    const elapsedMs = (i / FPS) * 1000;
    const dataUrl = await executeScript('return window.__liquidLogoCapture.renderAtMs(arguments[0]);', [elapsedMs]);

    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
      throw new Error(`Invalid frame payload received at frame ${i}.`);
    }

    const base64 = dataUrl.slice('data:image/png;base64,'.length);
    const framePath = path.join(framesDir, `frame-${String(i).padStart(4, '0')}.png`);
    await fs.writeFile(framePath, Buffer.from(base64, 'base64'));

    if ((i + 1) % FPS === 0 || i + 1 === TOTAL_FRAMES) {
      console.log(`Captured ${i + 1}/${TOTAL_FRAMES} frames`);
    }
  }

  console.log('Encoding MP4...');
  await runCommand('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-framerate',
    String(FPS),
    '-start_number',
    '0',
    '-i',
    path.join(framesDir, 'frame-%04d.png'),
    '-vf',
    'scale=1080:1080',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    outputPath,
  ], 'ffmpeg');

  console.log(`Video exported to ${outputPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Export failed: ${message}`);
  process.exitCode = 1;
} finally {
  await cleanup();
}
