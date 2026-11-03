import { useState } from "react";
import { fmtDate } from "@/lib/utils";

interface P { label: string; value: number }
const W = 640, H = 220, L = 36, B = 26, T = 12, R = 8;
const nice = (m: number) => { if (m <= 5) return 5; const p = 10 ** Math.floor(Math.log10(m)); const n = m / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };

function Frame({ max, children, label }: { max: number; children: React.ReactNode; label: string }) {
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {ticks.map((t) => { const y = T + (1 - t / max) * (H - T - B); return <g key={t}><line x1={L} x2={W - R} y1={y} y2={y} stroke="#ece2bd" strokeDasharray="3 4" /><text x={L - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7079">{t}</text></g>; })}
      {children}
    </svg>
  );
}

export function BarChart({ data, color = "#f4ce73", unit, label }: { data: P[]; color?: string; unit: string; label: string }) {
  const [hi, setHi] = useState<number | null>(null);
  const max = nice(Math.max(1, ...data.map((d) => d.value))); const bw = (W - L - R) / data.length; const every = Math.ceil(data.length / 8);
  return (
    <div className="relative">
      <Frame max={max} label={label}>
        {data.map((d, i) => { const h = (d.value / max) * (H - T - B); const x = L + i * bw; return (
          <g key={i} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
            <rect x={x} y={T} width={bw} height={H - T - B} fill="transparent" />
            <rect x={x + bw * 0.18} y={T + (H - T - B) - h} width={bw * 0.64} height={Math.max(h, d.value ? 2 : 0)} rx="3" fill={hi === i ? "#30343b" : color} />
            {i % every === 0 && <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7079">{d.label}</text>}
          </g>); })}
      </Frame>
      {hi !== null && <Tip left={((L + hi * bw + bw / 2) / W) * 100} text={`${data[hi].label}: ${data[hi].value} ${unit}`} />}
    </div>
  );
}

export function LineChart({ data, color = "#30343b", fill = "#f4ce73", unit, label }: { data: P[]; color?: string; fill?: string; unit: string; label: string }) {
  const [hi, setHi] = useState<number | null>(null);
  const max = nice(Math.max(1, ...data.map((d) => d.value))); const step = (W - L - R) / Math.max(1, data.length - 1); const every = Math.ceil(data.length / 7);
  const pt = (i: number) => [L + i * step, T + (1 - data[i].value / max) * (H - T - B)] as const;
  const line = data.map((_, i) => pt(i).join(",")).join(" ");
  return (
    <div className="relative">
      <Frame max={max} label={label}>
        <polygon points={`${L},${H - B} ${line} ${L + (data.length - 1) * step},${H - B}`} fill={fill} opacity=".35" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        {data.map((d, i) => { const [x, y] = pt(i); return (
          <g key={i} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
            <rect x={x - step / 2} y={T} width={step} height={H - T - B} fill="transparent" />
            {(hi === i || i === data.length - 1) && <circle cx={x} cy={y} r="4.5" fill="#fffcf3" stroke={color} strokeWidth="2.2" />}
            {i % every === 0 && <text x={x} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7079">{d.label}</text>}
          </g>); })}
      </Frame>
      {hi !== null && <Tip left={((L + hi * step) / W) * 100} text={`${data[hi].label}: ${data[hi].value} ${unit}`} />}
    </div>
  );
}
const Tip = ({ left, text }: { left: number; text: string }) => <div className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-cream shadow-pop" style={{ left: `${Math.min(88, Math.max(12, left))}%` }}>{text}</div>;

/** Danh sách thanh ngang (số liệu theo vị trí / ngành). */
export function HBars({ rows, unit }: { rows: { label: string; value: number; sub?: string }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">{rows.map((r) => (
      <li key={r.label}><div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium">{r.label}</span><span className="shrink-0 tabular-nums text-ink-soft"><b className="text-ink">{r.value}</b> {unit}</span></div>
        <div className="h-2.5 overflow-hidden rounded-full bg-butter"><div className="h-full rounded-full bg-gold" style={{ width: `${(r.value / max) * 100}%` }} /></div>{r.sub && <p className="mt-1 text-xs text-ink-mute">{r.sub}</p>}</li>))}</ul>
  );
}
export const shortDate = (iso: string) => fmtDate(iso).slice(0, 5);
