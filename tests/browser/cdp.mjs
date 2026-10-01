// A minimal Chrome DevTools Protocol driver on Node's built-in WebSocket, so the
// browser smoke test needs nothing beyond Node 22+ and a local Chrome.
//
// Set PINWHEEL_CHROME to the browser binary if it is not in one of the usual places.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.PINWHEEL_CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);
const CHROME = CANDIDATES.find(p => fs.existsSync(p));
if (!CHROME) { console.error('No Chrome found. Set PINWHEEL_CHROME to the browser binary.'); process.exit(2); }
const PORT = +(process.env.PINWHEEL_CDP_PORT || 9333);
export const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

export async function launch() {
  const dir = path.join(os.tmpdir(), 'pinwheel-smoke-profile');
  fs.rmSync(dir, { recursive: true, force: true });
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${dir}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--window-size=1400,900', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  return proc;
}

export async function page() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } else if (m.method) listeners.forEach(l => l(m)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const errors = [];
  listeners.push(m => {
    if (m.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) errors.push(m.params.type.toUpperCase() + ' ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  const p = {
    send, errors,
    async goto(url) { const load = new Promise(r => { const l = m => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); }); await send('Page.navigate', { url }); await load; },
    async eval(expr) { let r; try { r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); } catch (e) { throw new Error(e.message + ' in: ' + expr.slice(0, 160)); } if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; },
    async shot(name, full) { const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full }); fs.writeFileSync(OUT + name + '.png', Buffer.from(r.data, 'base64')); return OUT + name + '.png'; },
    async size(width, height, mobile = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
      if (mobile) await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    },
    async click(sel, nth = 0) { const ok = await p.eval(`(() => { const n = document.querySelectorAll(${JSON.stringify(sel)})[${nth}]; if (!n) return false; n.click(); return true; })()`); if (!ok) throw new Error('no element ' + sel); await p.wait(120); },
    async clickText(text, tag = 'button') { const ok = await p.eval(`(() => { const n = [...document.querySelectorAll(${JSON.stringify(tag)})].find(b => b.textContent.replace(/\\s+/g, " ").trim().includes(${JSON.stringify(text)})); if (!n) return false; n.click(); return true; })()`); if (!ok) throw new Error('no ' + tag + ' with text ' + text); await p.wait(150); },
    async type(sel, text) { await p.eval(`(() => { const n = document.querySelector(${JSON.stringify(sel)}); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(n, ${JSON.stringify(text)}); n.dispatchEvent(new Event('input', { bubbles: true })); })()`); await p.wait(80); },
    async tap(x, y) { await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.wait(120); },
    async mouse(x, y, x2, y2) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); if (x2 != null) { for (let i = 1; i <= 5; i++) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + (x2 - x) * i / 5, y: y + (y2 - y) * i / 5, button: 'left' }); } await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2 ?? x, y: y2 ?? y, button: 'left', clickCount: 1 }); await p.wait(120); },
    wait: ms => new Promise(r => setTimeout(r, ms)),
    async until(expr, ms = 8000) { const t = Date.now(); while (Date.now() - t < ms) { if (await p.eval(expr)) return true; await p.wait(100); } throw new Error('timeout waiting for ' + expr); },
    close: () => ws.close()
  };
  return p;
}
