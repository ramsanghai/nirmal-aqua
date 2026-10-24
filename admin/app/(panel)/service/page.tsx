'use client';

import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { notify } from '@/lib/notify';
import { fmtDate, shortId } from '@/lib/format';
import type { ServiceDoc, ServiceStatus } from '@/lib/types';
import StatusChip from '@/components/StatusChip';
import Drawer from '@/components/Drawer';
import { useToast } from '@/components/Toast';

const STATUSES: ServiceStatus[] = ['requested', 'scheduled', 'completed', 'cancelled'];

export default function ServicePage() {
  const { data, loading, error } = useCollection<ServiceDoc>('services');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const rows = useMemo(
    () =>
      data
        .filter((s) => filter === 'all' || s.status === filter)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
    [data, filter],
  );
  const open = data.find((s) => s.id === openId) || null;

  function openRow(s: ServiceDoc) {
    setNote(s.adminNote || '');
    setOpenId(s.id);
  }

  async function setStatus(s: ServiceDoc, status: ServiceStatus) {
    setBusy(true);
    try {
      await updateDoc(doc(db, 'services', s.id), { status, adminNote: note.trim(), updatedAt: Date.now() });
      const ok = await notify('service_update', s.id);
      toast.show(ok ? `Request ${status}` : `Request ${status} (notification failed)`);
    } catch {
      toast.show('Update failed');
    }
    setBusy(false);
  }

  return (
    <>
      <div className="page-head"><h1>Service desk</h1><span className="label num">{rows.length} shown</span></div>
      <div className="toolbar">
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="tablewrap">
        <table className="ledger">
          <thead>
            <tr><th>Ref</th><th>Type</th><th>Product</th><th>Customer</th><th>Visit</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="click" onClick={() => openRow(s)}>
                <td className="num"><b>#{shortId(s.id)}</b></td>
                <td>{s.type}</td>
                <td>{s.productName}</td>
                <td>{s.userName}<br /><span className="muted">{s.userPhone}</span></td>
                <td className="num">{s.date} / {s.slot}</td>
                <td><StatusChip status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">{loading ? 'Loading requests...' : 'No service requests.'}</div>}
      </div>

      {open && (
        <Drawer title={`${open.type || 'Service'} #${shortId(open.id)}`} eyebrow="Service request" onClose={() => setOpenId(null)}>
          <StatusChip status={open.status} />
          <dl className="kv">
            <dt className="label">Customer</dt><dd>{open.userName}<br />{open.userEmail}<br />{open.userPhone}</dd>
            <dt className="label">Product</dt><dd>{open.productName}</dd>
            <dt className="label">Visit</dt><dd className="num">{open.date} / {open.slot}</dd>
            <dt className="label">Address</dt><dd>{open.address?.line}</dd>
            <dt className="label">Notes</dt><dd>{open.notes || '-'}</dd>
            <dt className="label">Raised</dt><dd>{fmtDate(open.createdAt)}</dd>
          </dl>
          <label>
            <div className="label" style={{ marginBottom: 6 }}>Note to customer (sent with the update)</div>
            <textarea className="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="actions">
            {open.status !== 'scheduled' && <button className="btn primary" disabled={busy} onClick={() => setStatus(open, 'scheduled')}>Schedule</button>}
            {open.status !== 'completed' && <button className="btn primary" disabled={busy} onClick={() => setStatus(open, 'completed')}>Complete</button>}
            {open.status !== 'cancelled' && <button className="btn danger" disabled={busy} onClick={() => setStatus(open, 'cancelled')}>Cancel</button>}
          </div>
        </Drawer>
      )}
      {toast.node}
    </>
  );
}
