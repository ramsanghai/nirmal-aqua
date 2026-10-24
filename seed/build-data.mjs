// Writes products.json (Firestore seed) and products.csv (Google Sheet for the Instagram automation).
import { writeFileSync } from 'node:fs';
import { products } from './catalog.mjs';
const BASE = (process.env.IMAGE_BASE || 'https://YOUR-ADMIN.vercel.app').replace(/\/$/, '');
const out = products.map(({ _art, ...p }) => ({ ...p, image: `${BASE}/products/${p.id}.jpg`, images: [`${BASE}/products/${p.id}.jpg`], createdAt: Date.now() }));
writeFileSync(new URL('products.json', import.meta.url), JSON.stringify(out, null, 2));
const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
const csv = ['id,name,category,price,description,image,posted', ...out.map((p) => [p.id, p.name, p.category, p.price, p.description, p.image, ''].map(esc).join(','))].join('\n');
writeFileSync(new URL('products.csv', import.meta.url), csv);
console.log(out.length, 'products');
