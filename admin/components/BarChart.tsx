export default function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 560, H = 190, padL = 28, padB = 24, padT = 14;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (W - padL) / data.length;
  const ch = H - padB - padT;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Orders in the last 7 days">
      <line className="axis" x1={padL} x2={W} y1={H - padB} y2={H - padB} />
      <text x={0} y={padT + 4}>{max}</text>
      <text x={0} y={H - padB}>0</text>
      {data.map((d, i) => {
        const h = (d.value / max) * ch;
        const x = padL + i * bw + bw * 0.2;
        return (
          <g key={i}>
            <rect className={i === data.length - 1 ? 'bar today' : 'bar'} x={x} y={H - padB - h} width={bw * 0.6} height={h} />
            <text x={x + bw * 0.3} y={H - padB - h - 4} textAnchor="middle">{d.value}</text>
            <text x={x + bw * 0.3} y={H - 7} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
