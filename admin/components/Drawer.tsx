'use client';

import { useEffect, type ReactNode } from 'react';

export default function Drawer({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <div className="drawer-head">
          <div>
            {eyebrow && <div className="label">{eyebrow}</div>}
            <h2>{title}</h2>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {children}
      </aside>
    </>
  );
}
