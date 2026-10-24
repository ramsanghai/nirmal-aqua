'use client';

import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection, where } from '@/lib/useCollection';
import { notify } from '@/lib/notify';
import { fmtDate } from '@/lib/format';
import type { UserDoc } from '@/lib/types';
import StatusChip from '@/components/StatusChip';
import { useToast } from '@/components/Toast';

export default function DealersPage() {
  const { data, loading, error } = useCollection<UserDoc>('users', where('role', '==', 'Dealer'));
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState('');
  const toast = useToast();

  const rows = useMemo(
    () =>
      data
        .filter((d) => filter === 'all' || d.dealerStatus === filter)
        .sort((a, b) => (a.dealerStatus === 'pending' ? -1 : 0) - (b.dealerStatus === 'pending' ? -1 : 0) || (b.createdAt ?? 0) - (a.createdAt ?? 0)),
    [data, filter],
  );

  async function decide(u: UserDoc, dealerStatus: 'approved' | 'rejected') {
    setBusy(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), { dealerStatus });
      const ok = await notify('dealer_decision', u.id);
      toast.show(ok ? `Dealer ${dealerStatus}` : `Dealer ${dealerStatus} (notification failed)`);
    } catch {
      toast.show('Update failed');
    }
    setBusy('');
  }

  return (
    <>
      <div className="page-head"><h1>Dealers</h1><span className="label num">{rows.length} shown</span></div>
      <div className="toolbar">
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="tablewrap">
        <table className="ledger">
          <thead>
            <tr><th>Business</th><th>Contact</th><th>GSTIN</th><th>City</th><th>Joined</th><th>Status</th><th>Decision</th></tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td><b>{u.businessName || u.name || '-'}</b></td>
                <td>{u.name}<br /><span className="muted">{u.email} {u.phone}</span></td>
                <td className="num">{u.gstin || '-'}</td>
                <td>{u.city || '-'}</td>
                <td className="num">{fmtDate(u.createdAt)}</td>
                <td><StatusChip status={u.dealerStatus} /></td>
                <td>
                  <div className="actions">
                    {u.dealerStatus !== 'approved' && <button className="btn primary" disabled={busy === u.id} onClick={() => decide(u, 'approved')}>Approve</button>}
                    {u.dealerStatus !== 'rejected' && <button className="btn danger" disabled={busy === u.id} onClick={() => decide(u, 'rejected')}>Reject</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">{loading ? 'Loading dealers...' : 'No dealers.'}</div>}
      </div>
      {toast.node}
    </>
  );
}
