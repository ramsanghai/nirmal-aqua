import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth';
import { useData } from './data';
import type { Product } from './types';

interface Ctx {
  lines: { product: Product; qty: number; unit: number }[]; count: number; subtotal: number;
  add: (p: Product, qty?: number) => void; setQty: (id: string, q: number) => void; remove: (id: string) => void; clear: () => void;
}
const CartCtx = createContext<Ctx>(null as unknown as Ctx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, unitPrice, minQty } = useAuth();
  const { byId } = useData();
  const [items, setItems] = useState<Record<string, number>>({});
  const key = user ? `cart:${user.uid}` : '';

  useEffect(() => {
    if (!key) { setItems({}); return; }
    AsyncStorage.getItem(key).then((v) => v && setItems(JSON.parse(v))).catch(() => {});
  }, [key]);
  const persist = (n: Record<string, number>) => { setItems(n); if (key) AsyncStorage.setItem(key, JSON.stringify(n)).catch(() => {}); };

  const lines = useMemo(
    () => Object.entries(items).filter(([id]) => byId[id]).map(([id, qty]) => ({ product: byId[id], qty, unit: unitPrice(byId[id]) })),
    [items, byId, unitPrice],
  );
  const value: Ctx = {
    lines, count: lines.reduce((a, l) => a + l.qty, 0), subtotal: lines.reduce((a, l) => a + l.qty * l.unit, 0),
    add: (p, qty) => persist({ ...items, [p.id]: Math.min(p.stock || 99, (items[p.id] || 0) + (qty ?? minQty(p))) }),
    setQty: (id, q) => persist({ ...items, [id]: q }),
    remove: (id) => { const n = { ...items }; delete n[id]; persist(n); },
    clear: () => persist({}),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);
