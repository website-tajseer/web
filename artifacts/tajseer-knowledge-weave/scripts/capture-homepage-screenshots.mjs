import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const debugPort = process.env.CHROME_DEBUG_PORT ?? "9223";
const origin = process.env.PAGE_ORIGIN ?? "http://127.0.0.1:4174";
const output = path.resolve("docs/screenshots/homepage-prototype");
const viewport = { width: 2560, height: 1440 };

await mkdir(output, { recursive: true });
for (const file of await readdir(output)) {
  if (file.endsWith(".png")) await unlink(path.join(output, file));
}

const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`${origin}/homepage-prototype?lang=en#top`)}`, {
  method: "PUT",
}).then((response) => response.json());

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const browserIssues = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Runtime.exceptionThrown") browserIssues.push(message.params.exceptionDetails.text);
  if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) browserIssues.push(`${message.params.entry.level}: ${message.params.entry.text}`);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") browserIssues.push(`console: ${message.params.args.map((arg) => arg.value ?? arg.description).join(" ")}`);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  ...viewport,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: viewport.width,
  screenHeight: viewport.height,
});

async function navigate(hash, offset = 0) {
  await send("Page.navigate", { url: `${origin}/homepage-prototype?lang=en#${hash}` });
  await wait(1800);
  const { result } = await send("Runtime.evaluate", {
    expression: `(() => {
      document.documentElement.style.scrollBehavior = "auto";
      const element = document.getElementById(${JSON.stringify(hash)});
      const targetY = element ? window.scrollY + element.getBoundingClientRect().top + ${offset} : 0;
      window.scrollTo(0, targetY);
      return { hash: ${JSON.stringify(hash)}, targetY, actualY: window.scrollY };
    })()`,
    returnByValue: true,
  });
  console.log(result.value);
  await wait(650);
}

async function capture(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path.join(output, name), Buffer.from(data, "base64"));
}

await navigate("top");
await capture("01a-hero-distributed-2560x1440.png");
await navigate("top", 470);
await capture("01b-hero-relationships-2560x1440.png");
await navigate("top", 900);
await capture("01c-hero-directed-2560x1440.png");

await navigate("about", 360);
await capture("02-about-2560x1440.png");

await navigate("multimedia", 100);
await capture("03a-multimedia-separated-2560x1440.png");
await navigate("multimedia", 650);
await capture("03b-multimedia-converged-2560x1440.png");

await navigate("elearning", 100);
await capture("04a-elearning-fragments-2560x1440.png");
await navigate("elearning", 760);
await capture("04b-elearning-structured-2560x1440.png");
await navigate("elearning", 1450);
await capture("04c-elearning-resolved-2560x1440.png");

await navigate("stem");
await send("Runtime.evaluate", { expression: `(() => { const input = document.querySelector(".hp-system-control input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "22"); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); })()` });
await wait(400);
await capture("05a-stem-system-low-input-2560x1440.png");
await send("Runtime.evaluate", { expression: `(() => { const input = document.querySelector(".hp-system-control input"); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(input, "88"); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); })()` });
await wait(400);
await capture("05b-stem-system-high-input-2560x1440.png");

await navigate("arvr", 40);
await capture("06a-arvr-flat-2560x1440.png");
await navigate("arvr", 380);
await capture("06b-arvr-spatial-2560x1440.png");
await navigate("arvr", 720);
await capture("06c-arvr-immersive-2560x1440.png");

await navigate("consulting", 780);
await capture("07-training-consulting-2560x1440.png");

await navigate("mission", 220);
await capture("08-mission-vision-2560x1440.png");

await navigate("contact");
await capture("09-contact-2560x1440.png");

await navigate("top");
const { cssContentSize } = await send("Page.getLayoutMetrics");
const { data: fullPage } = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 },
});
await writeFile(path.join(output, "00-full-page-2560.png"), Buffer.from(fullPage, "base64"));

await send("Page.navigate", { url: `${origin}/homepage-prototype?lang=ar#top` });
await wait(1900);
await send("Runtime.evaluate", { expression: `document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0)` });
await wait(500);
await capture("10a-arabic-hero-2560x1440.png");
const { cssContentSize: arabicSize } = await send("Page.getLayoutMetrics");
const { data: arabicFullPage } = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: { x: 0, y: 0, width: arabicSize.width, height: arabicSize.height, scale: 1 },
});
await writeFile(path.join(output, "10b-arabic-full-page-2560.png"), Buffer.from(arabicFullPage, "base64"));

const { result: verification } = await send("Runtime.evaluate", {
  expression: `({
    canvases: document.querySelectorAll("canvas").length,
    sections: [...document.querySelectorAll("main section")].map((section) => section.id),
    language: document.documentElement.lang,
    direction: document.documentElement.dir,
    scrollHeight: document.documentElement.scrollHeight
  })`,
  returnByValue: true,
});
console.log({ verification: verification.value, browserIssues });
await send("Browser.close");
if (browserIssues.length) process.exitCode = 1;
