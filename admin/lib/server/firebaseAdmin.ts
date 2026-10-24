import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

function parseServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  const candidates = [raw];
  try {
    candidates.push(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    /* ignore */
  }
  for (const c of candidates) {
    try {
      const j = JSON.parse(c);
      if (j && j.project_id) {
        if (typeof j.private_key === 'string') j.private_key = j.private_key.replace(/\\n/g, '\n');
        return j;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0];
  const sa = parseServiceAccount();
  if (!sa) return null;
  return initializeApp({ credential: cert(sa as never) });
}

export function adminServices() {
  const app = getAdminApp();
  if (!app) return null;
  return { auth: getAuth(app), db: getFirestore(app), messaging: getMessaging(app) };
}
