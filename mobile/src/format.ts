export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
export const shortId = (id: string) => id.slice(-6).toUpperCase();
export const pctOff = (mrp: number, price: number) => Math.max(0, Math.round(((mrp - price) / mrp) * 100));
export const dateFmt = (ms: number) =>
  new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const genCode = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join('');
};
export const nextDays = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { iso: d.toISOString().slice(0, 10), dow: d.toLocaleDateString('en-IN', { weekday: 'short' }), dom: d.getDate(), mon: d.toLocaleDateString('en-IN', { month: 'short' }) };
  });
