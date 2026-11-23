// Screenshot helper for the trophy guide (Node 22+, standard library only).
// Launches the Playwright-cached Chromium with remote debugging, drives it
// over the DevTools protocol with the built-in WebSocket client, and saves
// a PNG. Usage:
//   node tools/screenshot.mjs <url> <out.png> [width] [height] [eval.js]
// The optional eval file is JavaScript run in the page before the shot
// (for example to tick trophies or open a view); it must be a single
// expression or a function body that returns a promise.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const [url, out, widthArg, heightArg, evalFile] = process.argv.slice(2);
const width = Number(widthArg || 1280);
const height = Number(heightArg || 800);
const chrome = join(homedir(), ".cache/ms-playwright/chromium-1255/chrome-linux64/chrome");
const port = 9333 + Math.floor(Math.random() * 500);

const child = spawn(chrome, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  ...(process.env.CHROME_PROFILE ? [`--user-data-dir=${process.env.CHROME_PROFILE}`] : []),
  `--remote-debugging-port=${port}`,
  `--window-size=${width},${height}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page) return page;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error("Chromium did not start its debugger");
}

let id = 0;
const pending = new Map();
let ws;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

try {
  const target = await getTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url });
  await sleep(2500);
  if (evalFile) {
    const expr = readFileSync(evalFile, "utf8");
    const res = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    console.log("eval result: " + JSON.stringify(res?.result?.value ?? res?.result ?? null));
    await sleep(800);
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("wrote " + out);
} finally {
  try { ws?.close(); } catch { /* already closed */ }
  child.kill();
}
