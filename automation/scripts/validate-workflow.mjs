#!/usr/bin/env node
// Sanity-checks workflows/daily-product-post.json: valid JSON, unique names/ids, every connection
// endpoint exists, no hardcoded secrets, and every $env.X used is documented in .env.example.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(path.join(root, 'workflows/daily-product-post.json'), 'utf8');
const wf = JSON.parse(raw);
const errors = [];
const names = new Set(), ids = new Set();

for (const n of wf.nodes) {
  for (const k of ['id', 'name', 'type', 'typeVersion', 'position', 'parameters']) if (n[k] === undefined) errors.push(`node ${n.name || n.id}: missing ${k}`);
  if (names.has(n.name)) errors.push(`duplicate node name: ${n.name}`); names.add(n.name);
  if (ids.has(n.id)) errors.push(`duplicate node id: ${n.id}`); ids.add(n.id);
  if (!/^n8n-nodes-base\./.test(n.type)) errors.push(`${n.name}: unexpected type ${n.type}`);
}
let edges = 0;
for (const [src, out] of Object.entries(wf.connections)) {
  if (!names.has(src)) errors.push(`connection source not a node: ${src}`);
  for (const [kind, outputs] of Object.entries(out))
    outputs.forEach(list => (list || []).forEach(t => { edges++; if (!names.has(t.node)) errors.push(`${src} -> missing node "${t.node}"`); if (t.type !== kind) errors.push(`${src}: type mismatch ${t.type}/${kind}`); }));
}
const targets = new Set(Object.values(wf.connections).flatMap(o => Object.values(o).flat(2)).map(t => t.node));
for (const n of wf.nodes) {
  if (n.type.endsWith('stickyNote') || n.type.endsWith('scheduleTrigger')) continue;
  if (!targets.has(n.name)) errors.push(`unreachable node (no incoming connection): ${n.name}`);
}
for (const m of raw.matchAll(/\$\('([^']+)'\)/g)) if (!names.has(m[1])) errors.push(`expression references unknown node "${m[1]}"`);
for (const re of [/gsk_[A-Za-z0-9]{10,}/, /hf_[A-Za-z0-9]{20,}/, /EAA[A-Za-z0-9]{20,}/, /\b[a-f0-9]{32}\b/]) if (re.test(raw)) errors.push(`possible hardcoded secret matching ${re}`);

const envExample = readFileSync(path.join(root, '.env.example'), 'utf8');
const used = new Set([...raw.matchAll(/\$env\.([A-Z0-9_]+)/g)].map(m => m[1]));
for (const v of used) if (!new RegExp(`^${v}=`, 'm').test(envExample)) errors.push(`$env.${v} is not listed in .env.example`);

const has = t => wf.nodes.some(n => n.type === t);
for (const t of ['scheduleTrigger', 'googleSheets', 'code', 'httpRequest', 'if', 'wait']) if (!has('n8n-nodes-base.' + t)) errors.push(`missing node type ${t}`);

console.log(`nodes: ${wf.nodes.length}, connections: ${edges}, env vars used: ${[...used].join(', ')}`);
if (errors.length) { console.error('INVALID:\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('OK: workflow JSON parses, all connections reference existing nodes, no hardcoded secrets.');
