'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { user, loading, error, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await login(email.trim(), password);
    setBusy(false);
  };

  return (
    <div className="login">
      <form onSubmit={submit}>
        <div>
          <span className="label">Nirmal Aqua</span>
          <h1>Back office</h1>
        </div>
        <label>
          <span className="label">Email</span>
          <input className="input" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span className="label">Password</span>
          <input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn primary" disabled={busy || loading}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
