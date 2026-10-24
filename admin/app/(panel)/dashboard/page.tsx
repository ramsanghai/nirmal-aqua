'use client';

import { useMemo } from 'react';
import { useCollection, where } from '@/lib/useCollection';
import { inr, startOfDay } from '@/lib/format';
import type { OrderDoc, ServiceDoc, UserDoc } from '@/lib/types';
import BarChart from '@/components/BarChart';

export default function Dashboard() {
  const orders = useCollection<OrderDoc>('orders');
  const dealers = useCollection<UserDoc>('users', where('role', '==', 'Dealer'));
  const services = useCollection<ServiceDoc>('services');

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { start: startOfDay(d), label: d.toLocaleDateString('en-IN', { weekday: 'short' }), value: 0 };
    });
    let revenue = 0;
    let todayCount = 0;
    for (const o of orders.data) {
      const t = o.createdAt ?? 0;
      if (t >= today) todayCount++;
      if (o.paymentStatus === 'paid' && o.status !== 'cancelled') revenue += o.total || 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (t >= days[i].start) { days[i].value++; break; }
      }
    }
    return {
      todayCount,
      revenue,
      pending: dealers.data.filter((d) => d.dealerStatus === 'pending').length,
      open: services.data.filter((s) => s.status === 'requested' || s.status === 'scheduled').length,
      days,
    };
  }, [orders.data, dealers.data, services.data]);

  const err = orders.error || dealers.error || services.error;

  return (
    <>
      <div className="page-head"><h1>Dashboard</h1><span className="label">Live</span></div>
      {err && <p className="err">{err}</p>}
      <div className="stats">
        <div className="stat"><div className="label">Orders today</div><div className="v num">{stats.todayCount}</div></div>
        <div className="stat"><div className="label">Revenue (paid)</div><div className="v num">{inr(stats.revenue)}</div></div>
        <div className="stat"><div className="label">Pending dealers</div><div className="v num">{stats.pending}</div></div>
        <div className="stat"><div className="label">Open service requests</div><div className="v num">{stats.open}</div></div>
      </div>
      <div className="panel">
        <div className="label" style={{ marginBottom: 8 }}>Orders, last 7 days</div>
        <BarChart data={stats.days} />
      </div>
    </>
  );
}
