import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const port = 9376;
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${path.join(tmpdir(), "absence-shots")}`,
  "--hide-scrollbars",
  "about:blank",
], { stdio: "ignore" });

async function waitJson() {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("no chrome");
}
async function cdp(ws, method, params = {}, sessionId) {
  const id = (cdp.n = (cdp.n || 0) + 1);
  ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  return new Promise((resolve, reject) => {
    const onMessage = (raw) => {
      const payload = typeof raw === "string" ? raw : raw.data;
      const data = JSON.parse(typeof payload === "string" ? payload : payload.toString());
      if (data.id !== id) return;
      ws.removeEventListener("message", onMessage);
      if (data.error) reject(new Error(JSON.stringify(data.error)));
      else resolve(data.result);
    };
    ws.addEventListener("message", onMessage);
  });
}
await waitJson();
const list = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(list.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
const { targetId } = await cdp(ws, "Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp(ws, "Target.attachToTarget", { targetId, flatten: true });
await cdp(ws, "Page.enable", {}, sessionId);
await cdp(ws, "Runtime.enable", {}, sessionId);
await cdp(ws, "Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await cdp(ws, "Page.navigate", { url: "http://127.0.0.1:5173/#dashboard" }, sessionId);
await new Promise((r) => setTimeout(r, 2500));
const info = await cdp(ws, "Runtime.evaluate", {
  expression: `(() => {
    const el = document.querySelector('.shot-scroller');
    const imgs = [...document.querySelectorAll('.shot-card img')].slice(0,5).map(img => img.naturalWidth);
    const a = el.scrollLeft;
    return new Promise((resolve) => setTimeout(() => resolve(JSON.stringify({a, b: el.scrollLeft, imgs, labels: [...document.querySelectorAll('.shot-card figcaption')].slice(0,5).map(n=>n.textContent)})), 900));
  })()`,
  awaitPromise: true,
  returnByValue: true,
}, sessionId);
const box = await cdp(ws, "Runtime.evaluate", {
  expression: `(() => { const el = document.querySelector('#dashboard'); const r = el.getBoundingClientRect(); return JSON.stringify({y: r.top + window.scrollY, h: Math.min(el.offsetHeight, 780)}); })()`,
  returnByValue: true,
}, sessionId);
const rect = JSON.parse(box.result.value);
mkdirSync(".verify", { recursive: true });
writeFileSync(".verify/shots.txt", info.result.value);
const shot = await cdp(ws, "Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  clip: { x: 0, y: rect.y, width: 1280, height: rect.h, scale: 1 },
}, sessionId);
writeFileSync(".verify/dashboard.png", Buffer.from(shot.data, "base64"));
proc.kill();
ws.close();
process.exit(0);
