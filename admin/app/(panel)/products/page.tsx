'use client';

import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import type { ProductDoc } from '@/lib/types';
import { useToast } from '@/components/Toast';

type Field = 'price' | 'wholesalePrice' | 'stock';

function NumCell({ p, field, onSave }: { p: ProductDoc; field: Field; onSave: (p: ProductDoc, f: Field, v: number) => void }) {
  const current = p[field] ?? 0;
  const [val, setVal] = useState<string | null>(null);
  const shown = val ?? String(current);
  const commit = () => {
    if (val === null) return;
    const n = Number(val);
    if (val.trim() !== '' && Number.isFinite(n) && n >= 0 && n !== current) onSave(p, field, n);
    setVal(null);
  };
  return (
    <input
      className="input num"
      type="number"
      min={0}
      value={shown}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') setVal(null);
      }}
      aria-label={`${field} for ${p.name}`}
    />
  );
}

export default function ProductsPage() {
  const { data, loading, error } = useCollection<ProductDoc>('products');
  const [q, setQ] = useState('');
  const toast = useToast();

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data
      .filter((p) => !s || [p.name, p.id, p.category, p.brand].some((v) => v?.toLowerCase().includes(s)))
      .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name));
  }, [data, q]);

  async function save(p: ProductDoc, field: Field, value: number) {
    try {
      await updateDoc(doc(db, 'products', p.id), { [field]: value });
      toast.show(`${p.name}: ${field} saved`);
    } catch {
      toast.show('Save failed');
    }
  }

  return (
    <>
      <div className="page-head"><h1>Products</h1><span className="label num">{rows.length} items</span></div>
      <div className="toolbar">
        <input className="input" placeholder="Search name, category, brand" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="muted" style={{ marginTop: 0 }}>Edit a cell and press Enter or click away to save.</p>
      {error && <p className="err">{error}</p>}
      <div className="tablewrap">
        <table className="ledger">
          <thead>
            <tr><th>Product</th><th>Category</th><th className="r">MRP</th><th className="r">Price</th><th className="r">Wholesale</th><th className="r">Stock</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.name}</b><br /><span className="muted">{p.brand} / {p.id}</span></td>
                <td>{p.category}</td>
                <td className="r num">{p.mrp ?? '-'}</td>
                <td className="r"><NumCell p={p} field="price" onSave={save} /></td>
                <td className="r"><NumCell p={p} field="wholesalePrice" onSave={save} /></td>
                <td className="r"><NumCell p={p} field="stock" onSave={save} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">{loading ? 'Loading products...' : 'No products.'}</div>}
      </div>
      {toast.node}
    </>
  );
}
