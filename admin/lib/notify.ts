import { auth } from './firebase';
import type { NotifyKind } from './types';

/** Fire-and-forget call to our own /api/notify. Never throws. */
export async function notify(kind: NotifyKind, id: string): Promise<boolean> {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return false;
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind, id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
