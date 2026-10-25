#!/usr/bin/env node
// Nirmal Aqua - daily product post. Dependency-free (Node 20+). Mirrors workflows/daily-product-post.json.
//
//   node scripts/post-daily.mjs [--dry-run] [--no-ai] [--csv path] [--id N] [--force]
//
//   --dry-run  skip ImgBB / Instagram / WAHA calls (and never mark the row posted); print what would be posted
//   --no-ai    templated caption + the product's existing "image" URL (works fully offline)
//   --csv      products CSV path (default: SHEET_CSV_URL env, else ./products.csv)
//   --id       post this product id instead of the first unposted one
//   --force    ignore the "posted" column when picking

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const DRY = flag('--dry-run');
const NO_AI = flag('--no-ai');

// ---------- tiny .env loader (does not override real env vars) ----------
for (const f of [path.join(ROOT, '.env'), path.join(process.cwd(), '.env')]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    let v = m[2];
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1); else v = v.replace(/\s+#.*$/, '').replace(/^#.*$/, '');
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
const env = (k, d = '') => (process.env[k] ?? '').trim() || d;
const need = k => { const v = env(k); if (!v) throw new Error(`Missing env var ${k} (see .env.example)`); return v; };
const log = (...a) => console.log(...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- CSV ----------
function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += ch;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  const nonEmpty = rows.filter(r => r.some(c => c.trim() !== ''));
  const header = nonEmpty.shift().map(h => h.trim().toLowerCase());
  return { header, rows: nonEmpty.map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()]))) };
}
const csvCell = v => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
function writeCsv(file, header, rows) {
  writeFileSync(file, [header.join(','), ...rows.map(r => header.map(h => csvCell(String(r[h] ?? ''))).join(','))].join('\n') + '\n');
}

async function loadProducts() {
  const url = env('SHEET_CSV_URL');
  const csvArg = opt('--csv');
  if (!csvArg && url) {
    const res = await http(url, {}, 'Sheet CSV');
    return { ...parseCsv(await res.text()), file: null };
  }
  const file = path.resolve(csvArg || path.join(ROOT, 'products.csv'));
  if (!existsSync(file)) throw new Error(`No products file at ${file}. Copy sample/products.sample.csv to products.csv or set SHEET_CSV_URL.`);
  return { ...parseCsv(readFileSync(file, 'utf8')), file };
}

// ---------- shared prompt/caption logic (same as the n8n Code nodes) ----------
function buildProduct(row) {
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const brand = env('BRAND_NAME', 'Nirmal Aqua');
  const name = clean(row.name), category = clean(row.category) || 'water purifier', description = clean(row.description);
  const rawPrice = clean(row.price);
  const price = /^[\d.,\s]+$/.test(rawPrice) ? '₹' + rawPrice : rawPrice;
  const imagePrompt =
    `Clean, realistic studio product photograph of a ${category} for home drinking water (${name}). ` +
    (description ? description.slice(0, 140) + '. ' : '') +
    'Seamless white background, soft diffused lighting, subtle floor reflection, centered, sharp focus, ' +
    'photorealistic, square composition. No text, no letters, no logos, no watermark, no people.';
  const groqSystem = `You write Instagram captions for ${brand}, a friendly Indian water purifier e-commerce brand. Reply with ONLY a JSON object: {"caption": string, "hashtags": string[]}.`;
  const groqUser =
    `Product: ${name}\nCategory: ${category}\nPrice: ${price}\nDescription: ${description}\n\n` +
    'Rules for "caption": friendly, human tone; 2-3 short lines separated by \\n; mention the price exactly as given; ' +
    'end with a clear call to action (e.g. order now / link in bio); at most 2 emojis in total; do NOT include hashtags in the caption. ' +
    'Rules for "hashtags": 8 to 12 relevant hashtags, each starting with # and with no spaces, mixing brand, category and healthy-water topics.';
  return { ...row, name, category, description, price, brand, imagePrompt, groqSystem, groqUser };
}

function finalizeCaption(p, data) {
  let caption = String(data.caption || '').replace(/#\w+/g, '').replace(/[ \t]+\n/g, '\n').trim();
  if (!caption) throw new Error('Caption is empty');
  let n = 0;
  caption = caption.replace(/\p{Extended_Pictographic}️?/gu, m => (++n <= 2 ? m : ''));
  const raw = Array.isArray(data.hashtags) ? data.hashtags : String(data.hashtags || '').split(/\s+/);
  const seen = new Set();
  const tags = ['#' + p.brand.replace(/[^A-Za-z0-9]/g, ''), ...raw]
    .map(t => String(t).trim().replace(/[^\p{L}\p{N}_#]/gu, ''))
    .filter(t => t.replace('#', '').length > 0)
    .map(t => (t.startsWith('#') ? t : '#' + t))
    .filter(t => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 12);
  let finalCaption = caption + '\n\n' + tags.join(' ');
  if (finalCaption.length > 2200) finalCaption = finalCaption.slice(0, 2200);
  return { caption, hashtags: tags, finalCaption };
}

function templatedCaption(p) {
  const shop = env('SHOP_URL');
  const slug = p.category.replace(/[^A-Za-z0-9]/g, '');
  const data = {
    caption: `${p.name}: ${p.description || 'clean, safe drinking water for your family'}.\nJust ${p.price} – pure water, every glass.\n${shop ? 'Order now: ' + shop : 'Order now, link in bio!'}`,
    hashtags: [slug, 'WaterPurifier', 'PureWater', 'CleanDrinkingWater', 'HealthyLiving', 'SafeWater', 'HomeEssentials', 'ROPurifier', 'MadeInIndia', 'FamilyHealth'],
  };
  return finalizeCaption(p, data);
}

// ---------- HTTP ----------
async function http(url, init = {}, label = url, timeout = 60000) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 400);
    throw new Error(`${label} failed: HTTP ${res.status} ${body}`);
  }
  return res;
}
const json = (url, body, headers = {}, label, timeout) =>
  http(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }, label, timeout).then(r => r.json());

// ---------- AI ----------
async function groqCaption(p) {
  const data = await json('https://api.groq.com/openai/v1/chat/completions', {
    model: env('GROQ_MODEL', 'llama-3.3-70b-versatile'), temperature: 0.8, max_tokens: 4000, ...(/gpt-oss/.test(env('GROQ_MODEL')) ? { reasoning_effort: 'low' } : {}),
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: p.groqSystem }, { role: 'user', content: p.groqUser }],
  }, { Authorization: `Bearer ${need('GROQ_API_KEY')}` }, 'Groq');
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');
  return finalizeCaption(p, JSON.parse(content));
}

const isJpeg = b => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

async function hfImage(p) {
  const url = env('HF_IMAGE_URL', 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell');
  const res = await json0(url, { inputs: p.imagePrompt, parameters: { width: 1024, height: 1024, num_inference_steps: 4 } }, { Authorization: `Bearer ${need('HF_TOKEN')}` }, 'Hugging Face', 120000);
  return Buffer.from(await res.arrayBuffer());
}
const json0 = (url, body, headers, label, timeout) =>
  http(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }, label, timeout);

async function pollinationsImage(p) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p.imagePrompt)}?width=1080&height=1080&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
  let err;
  for (let i = 0; i < 2; i++) {
    try { return Buffer.from(await (await http(url, {}, 'Pollinations', 120000)).arrayBuffer()); } catch (e) { err = e; await sleep(5000); }
  }
  throw err;
}

async function generateImage(p) {
  if (env('HF_TOKEN')) {
    try {
      const buf = await hfImage(p);
      if (isJpeg(buf)) return { buf, source: 'huggingface' };
      // No image library in a dependency-free script, and Instagram only accepts JPEG.
      log('! HF returned a non-JPEG image; using Pollinations (JPEG) instead.');
    } catch (e) { log(`! HF failed (${e.message.slice(0, 160)}); falling back to Pollinations.`); }
  } else log('! HF_TOKEN not set; using Pollinations.');
  return { buf: await pollinationsImage(p), source: 'pollinations' };
}

async function uploadImgbb(buf, p) {
  const body = new URLSearchParams({ key: need('IMGBB_API_KEY'), image: buf.toString('base64'), name: `nirmal-aqua-${p.id}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}` });
  const res = await http('https://api.imgbb.com/1/upload', { method: 'POST', body }, 'ImgBB', 60000);
  const j = await res.json();
  if (!j?.data?.url) throw new Error('ImgBB response had no data.url');
  return j.data.url;
}

// ---------- Instagram + WAHA ----------
async function postInstagram(imageUrl, caption) {
  const v = env('GRAPH_API_VERSION', 'v21.0'), uid = need('IG_USER_ID'), token = need('IG_ACCESS_TOKEN');
  const base = `${env('IG_API_BASE', 'https://graph.facebook.com')}/${v}`;
  const c = await json(`${base}/${uid}/media`, { image_url: imageUrl, caption, access_token: token }, {}, 'IG create container');
  log(`  container ${c.id}; waiting 10s...`);
  await sleep(10000);
  for (let i = 0; i < 6; i++) { // poll until Instagram has finished processing the image
    const s = await (await http(`${base}/${c.id}?fields=status_code&access_token=${encodeURIComponent(token)}`, {}, 'IG status')).json();
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`IG container status ${s.status_code}`);
    await sleep(5000);
  }
  const pub = await json(`${base}/${uid}/media_publish`, { creation_id: c.id, access_token: token }, {}, 'IG publish');
  return pub.id;
}

async function postWaha(imageUrl, caption) {
  const session = env('WAHA_SESSION', 'default');
  const base = env('WAHA_URL', 'http://localhost:3000').replace(/\/$/, '');
  return json(`${base}/api/${session}/status/image`,
    { file: { mimetype: 'image/jpeg', url: imageUrl, filename: 'product.jpg' }, caption },
    { 'X-Api-Key': need('WHATSAPP_API_KEY') }, 'WAHA status', 90000);
}

// ---------- main ----------
async function main() {
  const { header, rows, file } = await loadProducts();
  for (const col of ['id', 'name', 'category', 'price', 'description', 'image']) {
    if (!header.includes(col)) throw new Error(`products CSV is missing column "${col}"`);
  }
  let row;
  if (opt('--id')) row = rows.find(r => r.id === opt('--id'));
  else {
    const open = flag('--force') ? rows : rows.filter(r => !String(r.posted || '').trim());
    // Read-only URL source cannot be marked posted, so rotate by day to avoid repeating the same product.
    row = file || !open.length ? open[0] : open[Math.floor(Date.now() / 86400000) % open.length];
  }
  if (!row) { log('No unposted product found. Nothing to do.'); return; }

  const p = buildProduct(row);
  log(`Product #${p.id}: ${p.name} (${p.category}, ${p.price})`);

  const cap = NO_AI ? templatedCaption(p) : await groqCaption(p);
  log(`Caption source: ${NO_AI ? 'template (--no-ai)' : 'Groq'}`);

  let imageUrl = p.image, buf = null, source = 'existing product image (--no-ai)';
  if (!NO_AI) {
    ({ buf, source } = await generateImage(p));
    log(`Image source: ${source}, ${(buf.length / 1024).toFixed(0)} KB, JPEG=${isJpeg(buf)}`);
    if (DRY) {
      const out = path.join(ROOT, 'out'); mkdirSync(out, { recursive: true });
      const f = path.join(out, `preview-${p.id}.jpg`); writeFileSync(f, buf); log(`Preview saved: ${f}`);
    }
  }

  if (DRY) {
    log('\n=== DRY RUN: nothing is uploaded or posted ===');
    log(JSON.stringify({
      product: { id: p.id, name: p.name, price: p.price },
      imagePrompt: NO_AI ? '(not used with --no-ai)' : p.imagePrompt,
      imageSource: source, imageUrl: NO_AI ? imageUrl : '(would be the ImgBB URL)',
      instagramCaption: cap.finalCaption,
      whatsappStatusCaption: cap.caption,
      wouldCall: ['ImgBB upload', 'IG /media', 'IG /media_publish', `WAHA /api/${env('WAHA_SESSION', 'default')}/status/image`, 'mark posted'].filter(x => !(NO_AI && x === 'ImgBB upload')),
    }, null, 2));
    return;
  }

  if (!NO_AI) { imageUrl = await uploadImgbb(buf, p); log(`ImgBB: ${imageUrl}`); }

  const [ig, wa] = await Promise.allSettled([
    env('IG_USER_ID') && env('IG_ACCESS_TOKEN') ? postInstagram(imageUrl, cap.finalCaption) : Promise.resolve('SKIPPED (no Instagram credentials yet)'),
    env('WHATSAPP_API_KEY') && env('WAHA_DISABLED') !== '1' ? postWaha(imageUrl, cap.caption) : Promise.reject(new Error('skipped (no WHATSAPP_API_KEY)')),
  ]);
  log(ig.status === 'fulfilled' ? `Instagram published: media id ${ig.value}` : `Instagram FAILED: ${ig.reason.message}`);
  log(wa.status === 'fulfilled' ? 'WhatsApp status posted' : `WhatsApp status not posted: ${wa.reason.message}`);
  if (ig.status !== 'fulfilled') process.exitCode = 1;
  else if (file) {
    const all = parseCsv(readFileSync(file, 'utf8'));
    const hdr = all.header.includes('posted') ? all.header : [...all.header, 'posted'];
    all.rows.find(r => r.id === row.id).posted = new Date().toISOString().slice(0, 10);
    writeCsv(file, hdr, all.rows);
    log(`Marked product ${row.id} as posted in ${file}`);
  } else log('Source is a read-only CSV URL: the row cannot be marked posted (rotation by day is used instead).');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
