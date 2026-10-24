import React, { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { notify } from './api';
import { genCode } from './format';
import type { DealerStatus, Product, Role, UserDoc } from './types';

interface SignUp { name: string; email: string; password: string; phone: string; role: 'Customer' | 'Dealer'; businessName?: string; gstin?: string; city?: string; referral?: string }
interface Ctx {
  user: User | null; profile: UserDoc | null; ready: boolean;
  signIn: (e: string, p: string) => Promise<void>; signUp: (d: SignUp) => Promise<void>; signOut: () => Promise<void>;
  reset: (e: string) => Promise<void>; update: (patch: Partial<UserDoc>) => Promise<void>;
  isDealer: boolean; unitPrice: (p: Product) => number; minQty: (p: Product) => number;
}
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); if (!u) { setProfile(null); setReady(true); } }), []);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (s) => { setProfile(s.exists() ? (s.data() as UserDoc) : null); setReady(true); }, () => setReady(true));
  }, [user?.uid]);

  const signIn = async (e: string, p: string) => { await signInWithEmailAndPassword(auth, e.trim(), p); };
  const signUp = async (d: SignUp) => {
    const cred = await createUserWithEmailAndPassword(auth, d.email.trim(), d.password);
    const dealer = d.role === 'Dealer';
    const data: UserDoc = {
      name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone.trim(), role: d.role as Role,
      dealerStatus: (dealer ? 'pending' : 'none') as DealerStatus,
      ...(dealer ? { businessName: d.businessName?.trim() || '', gstin: d.gstin?.trim() || '', city: d.city?.trim() || '' } : {}),
      referralCode: genCode(), referralCredits: 0, createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), data);
    if (dealer) notify('dealer_decision', cred.user.uid); // tells admins a new dealer applied
    if (d.referral?.trim()) notify('referral_claim', d.referral.trim().toUpperCase());
  };
  const signOut = async () => { await fbSignOut(auth); };
  const reset = async (e: string) => { await sendPasswordResetEmail(auth, e.trim()); };
  const update = async (patch: Partial<UserDoc>) => { if (user) await updateDoc(doc(db, 'users', user.uid), patch as any); };

  const isDealer = profile?.role === 'Dealer' && profile.dealerStatus === 'approved';
  const unitPrice = (p: Product) => (isDealer ? p.wholesalePrice : p.price);
  const minQty = (p: Product) => (isDealer ? p.minBulkQty : 1);

  return <AuthCtx.Provider value={{ user, profile, ready, signIn, signUp, signOut, reset, update, isDealer, unitPrice, minQty }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
