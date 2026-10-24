'use client';

import { useCallback, useState } from 'react';

export function useToast() {
  const [msg, setMsg] = useState('');
  const show = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  }, []);
  const node = msg ? <div className="toast" role="status">{msg}</div> : null;
  return { show, node };
}
