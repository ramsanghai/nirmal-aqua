'use client';

import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { notify } from '@/lib/notify';
import { fmtDate, inr, shortId } from '@/lib/format';
import type { OrderDoc, OrderStatus } from '@/lib/types';
import StatusChip from '@/components/StatusChip';
import Drawer from '@/components/Drawer';
import { useToast } from '@/components/Toast';

const STATUSES: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

export default function OrdersPage() {
  const { data, loading, error } = useCollection<OrderDoc>('orders');
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data
      .filter((o) => status === 'all' || o.status === status)
      .filter((o) => kind === 'all' || (kind === 'dealer' ? o.role === 'Dealer' || o.isBulk : o.role !== 'Dealer' && !o.isBulk))
      .filter(
        (o) =>
          !s ||
          [o.id, shortId(o.id), o.userName, o.userEmail, o.userPhone, o.paymentId].some((v) => v?.toLowerCase().includes(s)),
      )
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [data, status, kind, q]);

  const open = data.find((o) => o.id === openId) || null;

  async function setOrderStatus(o: OrderDoc, next: OrderStatus) {
    if (next === 'cancelled' && !confirm(`Cancel order #${shortId(o.id)}?`)) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'orders', o.id), { status: next, updatedAt: Date.now() });
      const ok = await notify('order_status', o.id);
      toast.show(ok ? `Order marked ${next}` : `Order marked ${next} (notification failed)`);
    } catch {
      toast.show('Update failed');
    }
    setBusy(false);
  }

  return (
    <>
      <div className="page-head"><h1>Orders</h1><span className="label num">{rows.length} of {data.length}</span></div>
      <div className="toolbar">
        <input className="input" placeholder="Search id, name, email, phone, payment id" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">Customers and dealers</option>
          <option value="customer">Customer</option>
          <option value="dealer">Dealer / bulk</option>
        </select>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="tablewrap">
        <table className="ledger">
          <thead>
            <tr><th>Order</th><th>Placed</th><th>Buyer</th><th>Type</th><th className="r">Total</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="click" onClick={() => setOpenId(o.id)}>
                <td className="num"><b>#{shortId(o.id)}</b></td>
                <td className="num">{fmtDate(o.createdAt)}</td>
                <td>{o.userName || o.userEmail || '-'}</td>
                <td>{o.role === 'Dealer' || o.isBulk ? 'Dealer' : 'Customer'}</td>
                <td className="r num">{inr(o.total)}</td>
                <td>{o.paymentMethod || '-'} / {o.paymentStatus || '-'}</td>
                <td><StatusChip status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">{loading ? 'Loading orders...' : 'No orders match.'}</div>}
      </div>

      {open && (
        <Drawer title={`Order #${shortId(open.id)}`} eyebrow="Order" onClose={() => setOpenId(null)}>
          <StatusChip status={open.status} />
          <dl className="kv">
            <dt className="label">Buyer</dt><dd>{open.userName} ({open.role})</dd>
            <dt className="label">Contact</dt><dd>{open.userEmail}<br />{open.userPhone}</dd>
            <dt className="label">Placed</dt><dd>{fmtDate(open.createdAt)}</dd>
            <dt className="label">Payment</dt><dd>{open.paymentMethod} / {open.paymentStatus}<br /><span className="num muted">{open.paymentId || 'no payment id'}</span></dd>
            <dt className="label">Ship to</dt>
            <dd>{open.address?.label && <b>{open.address.label}<br /></b>}{open.address?.line}<br />{open.address?.phone}</dd>
          </dl>
          <div>
            <div className="label">Items</div>
            <table className="items">
              <tbody>
                {open.items?.map((it, i) => (
                  <tr key={i}>
                    <td>{it.name}</td>
                    <td className="num" style={{ textAlign: 'right' }}>{it.qty} x {inr(it.unitPrice)}</td>
                    <td className="num" style={{ textAlign: 'right' }}>{inr(it.qty * it.unitPrice)}</td>
                  </tr>
                ))}
                {!!open.discount && (
                  <tr><td colSpan={2} className="muted">Referral credit</td><td className="num" style={{ textAlign: 'right' }}>-{inr(open.discount)}</td></tr>
                )}
                <tr><td colSpan={2}><b>Total</b></td><td className="num" style={{ textAlign: 'right' }}><b>{inr(open.total)}</b></td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Update status</div>
            <div className="actions">
              {NEXT[open.status] && (
                <button className="btn primary" disabled={busy} onClick={() => setOrderStatus(open, NEXT[open.status]!)}>
                  Mark {NEXT[open.status]}
                </button>
              )}
              {open.status !== 'cancelled' && open.status !== 'delivered' && (
                <button className="btn danger" disabled={busy} onClick={() => setOrderStatus(open, 'cancelled')}>Cancel order</button>
              )}
              {(open.status === 'delivered' || open.status === 'cancelled') && <span className="muted">Final state.</span>}
            </div>
          </div>
        </Drawer>
      )}
      {toast.node}
    </>
  );
}
