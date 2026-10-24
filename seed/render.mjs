import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { products } from './catalog.mjs';
import { renderSvg } from './art.mjs';

const OUT = new URL('../admin/public/products/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
for (const p of products) {
  const svg = renderSvg(p.category, p._art.type, p._art.args).replace('width="1000" height="1000"', 'width="800" height="800"');
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: OUT + p.id + '.jpg', type: 'jpeg', quality: 84 });
}
await browser.close();
console.log('rendered', products.length);
