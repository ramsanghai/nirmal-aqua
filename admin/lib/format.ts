export const inr = (n: number | undefined) =>
  '₹' + Math.round(n ?? 0).toLocaleString('en-IN');

export const shortId = (id: string) => id.slice(-6).toUpperCase();

export const fmtDate = (ms?: number) =>
  ms
    ? new Date(ms).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};
