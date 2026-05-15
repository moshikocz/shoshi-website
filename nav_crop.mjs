import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(__dirname, 'node_modules/puppeteer'));

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
const el = await page.$('[id="services"]');
const box = el ? await el.boundingBox() : null;
if (box) {
  await page.screenshot({ path: path.join(__dirname, 'temporary screenshots/screenshot-43-circles.png'), clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 900) } });
} else {
  await page.screenshot({ path: path.join(__dirname, 'temporary screenshots/screenshot-43-circles.png'), fullPage: false });
}
await browser.close();
console.log('done');
