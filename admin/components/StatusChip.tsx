const SHAPES: Record<string, React.ReactNode> = {
  placed: <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  confirmed: <circle cx="6" cy="6" r="5" fill="currentColor" />,
  scheduled: <circle cx="6" cy="6" r="5" fill="currentColor" />,
  shipped: <path d="M1 1 L11 6 L1 11 Z" fill="currentColor" />,
  requested: <path d="M1 1 L11 6 L1 11 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />,
  delivered: <path d="M1.5 6.5 L4.8 9.8 L10.5 2.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  completed: <path d="M1.5 6.5 L4.8 9.8 L10.5 2.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  approved: <path d="M1.5 6.5 L4.8 9.8 L10.5 2.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  cancelled: <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2" />,
  rejected: <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2" />,
  pending: <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.8" />,
  none: <path d="M1 6 H11" stroke="currentColor" strokeWidth="2" />,
};

export default function StatusChip({ status }: { status?: string }) {
  const s = status || 'none';
  return (
    <span className={`chip ${s}`}>
      <svg viewBox="0 0 12 12" aria-hidden="true">{SHAPES[s] ?? SHAPES.none}</svg>
      {s}
    </span>
  );
}
