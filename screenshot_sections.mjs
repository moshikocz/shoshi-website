import puppeteer from './node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const browser = await puppeteer.launch({headless:'new'});
const page = await browser.newPage();
await page.setViewport({width:1280, height:800});
await page.goto('http://localhost:3000', {waitUntil:'networkidle2'});

const labels = [
  '01-home',
  '02-about',
  '03-services',
  '04-service-cards',
  '05-cta-band',
  '06-testimonials',
  '07-contact',
];

const sections = await page.$$('section');

for (let i = 0; i < sections.length; i++) {
  const label = labels[i] || ('section-' + i);
  await sections[i].screenshot({path:`./temporary screenshots/screenshot-${label}.png`});
  console.log('Saved:', label);
}

await browser.close();
