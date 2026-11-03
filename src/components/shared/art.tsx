import { Building2, Compass, FileText, MessagesSquare, Wallet, type LucideIcon } from "lucide-react";
import { hash } from "@/lib/stats";
import { cn } from "@/lib/utils";

const BG = ["#fff4c7", "#f4ce73", "#30343b", "#ebe4cc"];
const FG = ["#f4ce73", "#fff4c7", "#f4ce73", "#d9cfae"];

/** Banner trang trí sinh từ màu + mã (không dùng ảnh ngoài). */
export function BannerArt({ tone = 0, seed = "x", className }: { tone?: number; seed?: string; className?: string }) {
  const t = tone % 4; const h = hash(seed); const bg = BG[t], fg = FG[t];
  const cx = 60 + (h % 40), r = 90 + (h % 50);
  return (
    <svg aria-hidden preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 200" className={cn("h-full w-full", className)}>
      <rect width="800" height="200" fill={bg} />
      <circle cx={cx * 8} cy="40" r={r} fill={fg} opacity=".55" />
      <circle cx={80 + (h % 120)} cy="190" r={70 + (h % 40)} fill={fg} opacity=".35" />
      <path d={`M0 ${150 + (h % 20)} Q 200 ${100 + (h % 40)} 400 ${150} T 800 ${130 + (h % 30)} V200 H0Z`} fill={fg} opacity=".5" />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={560 + i * 26} cy={30 + ((h >> i) % 3) * 14} r="3" fill={t === 2 ? "#fff4c7" : "#30343b"} opacity=".18" />)}
    </svg>
  );
}

const ICONS: Record<string, LucideIcon> = { "Viết CV": FileText, "Phỏng vấn": MessagesSquare, "Định hướng nghề nghiệp": Compass, "Lương & phúc lợi": Wallet, "Dành cho nhà tuyển dụng": Building2 };
const COVER: Record<string, number> = { "Viết CV": 0, "Phỏng vấn": 1, "Định hướng nghề nghiệp": 3, "Lương & phúc lợi": 0, "Dành cho nhà tuyển dụng": 2 };
export function ArticleCover({ category, slug, className }: { category: string; slug: string; className?: string }) {
  const I = ICONS[category] ?? FileText; const t = COVER[category] ?? 0;
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: BG[t] }} aria-hidden>
      <BannerArt tone={t} seed={slug} className="absolute inset-0" />
      <I className="absolute bottom-3 right-4 h-14 w-14 opacity-90" style={{ color: t === 2 ? "#f4ce73" : "#30343b" }} strokeWidth={1.4} />
    </div>
  );
}

/** Minh họa trang chủ: mặt trời mọc và các đường chân trời. */
export function SunriseArt({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 520 420" className={className}>
      <circle cx="260" cy="210" r="170" fill="#f4ce73" opacity=".35" />
      <circle cx="260" cy="210" r="115" fill="#f4ce73" opacity=".6" />
      <circle cx="260" cy="210" r="64" fill="#f4ce73" />
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={260 + Math.cos(a) * 190} y1={210 + Math.sin(a) * 190} x2={260 + Math.cos(a) * 215} y2={210 + Math.sin(a) * 215} stroke="#30343b" strokeWidth="3" strokeLinecap="round" opacity=".25" />; })}
      <path d="M0 300 Q130 250 260 290 T520 280 V420 H0Z" fill="#30343b" />
      <path d="M0 340 Q150 310 300 340 T520 330 V420 H0Z" fill="#fff4c7" opacity=".9" />
    </svg>
  );
}
