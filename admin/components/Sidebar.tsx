'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/dealers', label: 'Dealers' },
  { href: '/service', label: 'Service desk' },
  { href: '/products', label: 'Products' },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">Nirmal Aqua</div>
        <button className="btn" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
      </div>
      {open && <div className="scrim" style={{ zIndex: 45 }} onClick={() => setOpen(false)} />}
      <nav className={`side ${open ? 'open' : ''}`}>
        <div className="brand">
          Nirmal Aqua
          <small className="label">Back office</small>
          <i />
        </div>
        <div className="nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? 'on' : ''} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="side-foot">
          <span className="muted" style={{ wordBreak: 'break-all' }}>{user?.email}</span>
          <button className="btn" onClick={logout}>Sign out</button>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
