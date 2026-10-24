// Usage: node scripts/make-admin.mjs <email>
// Needs FIREBASE_SERVICE_ACCOUNT_JSON (JSON string or base64) in the environment.
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/make-admin.mjs <email>');
  process.exit(1);
}
const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) {
  console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON first.');
  process.exit(1);
}
let sa;
for (const c of [raw, Buffer.from(raw, 'base64').toString('utf8')]) {
  try { sa = JSON.parse(c); if (sa?.project_id) break; } catch {}
}
if (!sa?.project_id) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON or base64 JSON.');
  process.exit(1);
}
initializeApp({ credential: cert(sa) });

const user = await getAuth().getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`No Firebase Auth user with email ${email}. Create it in Authentication first (or sign up in the app).`);
  process.exit(1);
}
const ref = getFirestore().doc(`users/${user.uid}`);
const snap = await ref.get();
if (snap.exists) {
  await ref.update({ role: 'Admin' });
} else {
  await ref.set({
    name: user.displayName || 'Admin',
    email,
    phone: user.phoneNumber || '',
    role: 'Admin',
    dealerStatus: 'none',
    referralCode: user.uid.slice(0, 6).toUpperCase(),
    referralCredits: 0,
    createdAt: Date.now(),
  });
}
console.log(`users/${user.uid} (${email}) is now Admin.`);
