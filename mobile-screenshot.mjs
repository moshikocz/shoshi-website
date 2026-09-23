import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

async function getPuppeteer() {
  // Try known locations in order
  const locations = [
    'C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer',
    'C:/Users/moshi/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer',
  ];
  for (const loc of locations) {
    try {
      return require(loc);
    } catch {}
  }
  try {
    return (await import('puppeteer')).default;
  } catch {}
  console.error('Puppeteer not found. Install with: npm install puppeteer');
  process.exit(1);
}

async function takeMobileScreenshot(url, label, { width, height, scrollY, fullPage }) {
  const screenshotDir = path.join(__dirname, 'temporary screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const files = fs.existsSync(screenshotDir) ? fs.readdirSync(screenshotDir) : [];
  const nums = files
    .map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0'))
    .filter(n => n > 0);
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

  const filename = label
    ? `screenshot-${nextNum}-${label}.png`
    : `screenshot-${nextNum}.png`;
  const filepath = path.join(screenshotDir, filename);

  const puppeteer = await getPuppeteer();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  if (scrollY) await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.screenshot({ path: filepath, fullPage });

  await browser.close();
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

// Usage: node mobile-screenshot.mjs <url> [label] [--width=390] [--height=844] [--scrollY=0] [--full]
const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const url = positional[0] || 'http://localhost:3000';
const label = positional[1];
const width = parseInt(flags.width) || 390;
const height = parseInt(flags.height) || 844;
const scrollY = parseInt(flags.scrollY) || 0;
const fullPage = !!flags.full;

takeMobileScreenshot(url, label, { width, height, scrollY, fullPage }).catch(console.error);
