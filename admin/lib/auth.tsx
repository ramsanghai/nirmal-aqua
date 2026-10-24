'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists() && snap.data().role === 'Admin') {
          setError('');
          setUser(u);
        } else {
          setError('This account does not have admin access. You have been signed out.');
          setUser(null);
          await signOut(auth);
        }
      } catch {
        setError('Could not verify admin access. Check your connection and try again.');
        setUser(null);
        await signOut(auth);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Incorrect email or password.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return <Ctx.Provider value={{ user, loading, error, login, logout }}>{children}</Ctx.Provider>;
}
