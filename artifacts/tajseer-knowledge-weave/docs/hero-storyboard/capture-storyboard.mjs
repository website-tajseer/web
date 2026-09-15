import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const folder = path.dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(path.join(folder, "storyboard.html")).href;
const port = process.env.CHROME_DEBUG_PORT ?? "9223";
const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${page}?frame=1`)}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id || !pending.has(message.id)) return; const promise = pending.get(message.id); pending.delete(message.id); message.error ? promise.reject(new Error(message.error.message)) : promise.resolve(message.result); });
const send = (method, params = {}) => { const commandId = ++id; socket.send(JSON.stringify({ id: commandId, method, params })); return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject })); };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 2560, height: 1440, screenWidth: 2560, screenHeight: 1440, deviceScaleFactor: 1, mobile: false });
for (let frame = 1; frame <= 6; frame += 1) {
  await send("Page.navigate", { url: `${page}?frame=${frame}` });
  await wait(900);
  const { data } = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path.join(folder, `frame-0${frame}-2560x1440.png`), Buffer.from(data, "base64"));
}
await send("Browser.close");
