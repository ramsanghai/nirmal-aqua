import { auth, API_URL } from './firebase';

/** Calls the Vercel notify endpoint (FCM push + EmailJS + TextBee). Best-effort: never throws. */
export async function notify(kind: string, id: string) {
  try {
    const u = auth.currentUser;
    if (!u || !API_URL) return;
    const token = await u.getIdToken();
    await fetch(`${API_URL}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kind, id }),
    });
  } catch {
    /* notifications are non-critical */
  }
}
