// node seed.mjs  (needs FIREBASE_SERVICE_ACCOUNT_JSON env or ./serviceAccount.json; IMAGE_BASE=https://your-admin.vercel.app)
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
execSync('node build-data.mjs', { stdio: 'inherit', env: process.env });
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (existsSync('serviceAccount.json') && readFileSync('serviceAccount.json', 'utf8'));
if (!raw) throw new Error('Provide FIREBASE_SERVICE_ACCOUNT_JSON or serviceAccount.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString())) });
const db = admin.firestore();
const products = JSON.parse(readFileSync('products.json', 'utf8'));
const batch = db.batch();
products.forEach((p) => batch.set(db.collection('products').doc(p.id), p));
await batch.commit();
console.log('Seeded', products.length, 'products');
