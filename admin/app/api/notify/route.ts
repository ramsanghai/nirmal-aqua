import { NextResponse } from 'next/server';
import { adminServices } from '@/lib/server/firebaseAdmin';
import { sendEmail, sendPush, sendSms, type ChannelResult } from '@/lib/server/channels';
import * as M from '@/lib/server/messages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: CORS });

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const svc = adminServices();
  if (!svc) return json({ error: 'Server is not configured' }, 500);

  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return json({ error: 'Missing token' }, 401);

  let uid: string;
  try {
    uid = (await svc.auth.verifyIdToken(token)).uid;
  } catch {
    return json({ error: 'Invalid token' }, 401);
  }

  let body: { kind?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const { kind, id } = body;
  if (!kind || !id || typeof id !== 'string' || id.includes('/')) {
    return json({ error: 'kind and id are required' }, 400);
  }

  const { db, messaging } = svc;
  const callerSnap = await db.doc(`users/${uid}`).get();
  const isAdmin = callerSnap.data()?.role === 'Admin';

  // Resolve the document, recipient, caller authorization and message per kind.
  let target: any = null; // user doc of the recipient
  let targetUid = '';
  let msg: M.Msg;
  let adminMsg: M.Msg | null = null;
  let data: Record<string, string> = { kind, id };

  try {
    if (kind === 'order_placed' || kind === 'order_status') {
      const snap = await db.doc(`orders/${id}`).get();
      if (!snap.exists) return json({ error: 'Not found' }, 404);
      const o = snap.data()!;
      if (kind === 'order_placed' ? o.userId !== uid : !isAdmin) {
        return json({ error: 'Forbidden' }, 403);
      }
      targetUid = o.userId;
      msg = kind === 'order_placed' ? M.orderPlaced(id, o) : M.orderStatus(id, o);
      if (kind === 'order_placed') adminMsg = M.adminNewOrder(id, o);
      data = { ...data, status: String(o.status || '') };
      target = { ...o, name: o.userName, email: o.userEmail, phone: o.userPhone };
    } else if (kind === 'service_booked' || kind === 'service_update') {
      const snap = await db.doc(`services/${id}`).get();
      if (!snap.exists) return json({ error: 'Not found' }, 404);
      const s = snap.data()!;
      if (kind === 'service_booked' ? s.userId !== uid : !isAdmin) {
        return json({ error: 'Forbidden' }, 403);
      }
      targetUid = s.userId;
      msg = kind === 'service_booked' ? M.serviceBooked(id, s) : M.serviceUpdate(id, s);
      if (kind === 'service_booked') adminMsg = M.adminNewService(id, s);
      data = { ...data, status: String(s.status || '') };
      target = { ...s, name: s.userName, email: s.userEmail, phone: s.userPhone };
    } else if (kind === 'dealer_decision') {
      const snap = await db.doc(`users/${id}`).get();
      if (!snap.exists) return json({ error: 'Not found' }, 404);
      const u = snap.data()!;
      // Admin decides; a dealer may also trigger the "new application" admin alert for themselves.
      const self = id === uid && u.role === 'Dealer' && u.dealerStatus === 'pending';
      if (!isAdmin && !self) return json({ error: 'Forbidden' }, 403);
      targetUid = id;
      msg = M.dealerDecision(u);
      if (self) adminMsg = M.adminNewDealer(u);
      data = { ...data, status: String(u.dealerStatus || '') };
      target = u;
    } else if (kind === 'referral_claim') {
      // id = referral code typed at sign-up. Server validates and credits both users (clients cannot write credits).
      const code = id.toUpperCase();
      const me = callerSnap.data();
      if (!me || me.role === 'Admin' || me.referredBy) return json({ error: 'Not eligible' }, 400);
      if (Date.now() - (me.createdAt || 0) > 24 * 3600 * 1000) return json({ error: 'Code can only be applied on a new account' }, 400);
      if (me.referralCode === code) return json({ error: 'You cannot use your own code' }, 400);
      const found = await db.collection('users').where('referralCode', '==', code).limit(1).get();
      if (found.empty) return json({ error: 'Invalid referral code' }, 404);
      const refDoc = found.docs[0];
      const { FieldValue } = await import('firebase-admin/firestore');
      const batch = db.batch();
      batch.update(db.doc(`users/${uid}`), { referredBy: code, referralCredits: FieldValue.increment(100) });
      batch.update(refDoc.ref, { referralCredits: FieldValue.increment(100) });
      await batch.commit();
      targetUid = refDoc.id;
      target = refDoc.data();
      msg = { title: 'Referral bonus: ₹100 added', body: `${me.name || 'A friend'} joined Nirmal Aqua with your code. ₹100 is now in your credits.` };
    } else {
      return json({ error: 'Unknown kind' }, 400);
    }
  } catch {
    return json({ error: 'Failed to load data' }, 500);
  }

  // Recipient token comes from the users doc (orders/services do not carry it).
  let fcmToken: string | undefined;
  try {
    fcmToken = (await db.doc(`users/${targetUid}`).get()).data()?.fcmToken;
  } catch {
    /* best effort */
  }

  const [push, email, sms] = await Promise.all([
    sendPush(messaging, fcmToken, msg, data),
    sendEmail({ email: target.email, name: target.name }, msg),
    sendSms(target.phone, msg),
  ]);

  // Alert admins (push only).
  if (adminMsg) {
    try {
      const admins = await db.collection('users').where('role', '==', 'Admin').get();
      await Promise.all(
        admins.docs.map((d) => sendPush(messaging, d.data().fcmToken, adminMsg!, data)),
      );
    } catch {
      /* best effort */
    }
  }

  const result: Record<string, ChannelResult> = { push, email, sms };
  return json(result);
}
