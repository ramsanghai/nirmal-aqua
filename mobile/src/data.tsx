import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import type { Order, Product, ServiceReq } from './types';

interface Ctx { products: Product[]; loading: boolean; byId: Record<string, Product>; orders: Order[]; services: ServiceReq[] }
const DataCtx = createContext<Ctx>({ products: [], loading: true, byId: {}, orders: [], services: [] });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceReq[]>([]);

  useEffect(() => {
    if (!user) { setProducts([]); setOrders([]); setServices([]); return; }
    setLoading(true);
    const u1 = onSnapshot(collection(db, 'products'), (s) => { setProducts(s.docs.map((d) => ({ ...(d.data() as Product), id: d.id }))); setLoading(false); }, () => setLoading(false));
    const u2 = onSnapshot(query(collection(db, 'orders'), where('userId', '==', user.uid)), (s) =>
      setOrders(s.docs.map((d) => ({ ...(d.data() as Order), id: d.id })).sort((a, b) => b.createdAt - a.createdAt)));
    const u3 = onSnapshot(query(collection(db, 'services'), where('userId', '==', user.uid)), (s) =>
      setServices(s.docs.map((d) => ({ ...(d.data() as ServiceReq), id: d.id })).sort((a, b) => b.createdAt - a.createdAt)));
    return () => { u1(); u2(); u3(); };
  }, [user?.uid]);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  return <DataCtx.Provider value={{ products, loading, byId, orders, services }}>{children}</DataCtx.Provider>;
}
export const useData = () => useContext(DataCtx);
