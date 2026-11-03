import { ArrowRight, Clock3, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Article, Company } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { Badge, CompanyLogo } from "./common";
import { ArticleCover, BannerArt } from "./art";

export function SectionHead({ eyebrow, title, desc, to, toLabel = "Xem tất cả", id }: { eyebrow?: string; title: string; desc?: string; to?: string; toLabel?: string; id?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-ink">{eyebrow}</p>}<h2 id={id} className="text-2xl font-bold tracking-tight sm:text-[32px]">{title}</h2>{desc && <p className="mt-2 max-w-xl text-ink-soft">{desc}</p>}</div>
      {to && <Link to={to} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold hover:text-gold-ink sm:flex">{toLabel}<ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

export function CompanyCard({ company, openJobs }: { company: Company; openJobs: number }) {
  return (
    <Link to={`/cong-ty/${company.id}`} className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper shadow-soft transition-all hover:-translate-y-1 hover:border-gold hover:shadow-pop">
      <div className="h-20"><BannerArt tone={company.banner ?? company.tone} seed={company.id} /></div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <CompanyLogo name={company.name} tone={company.tone} size={56} className="-mt-8 border-4 border-paper shadow-soft" />
        <h3 className="mt-3 font-semibold leading-snug group-hover:text-gold-ink">{company.name}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">{company.industry}</p>
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{company.about.split("\n")[0]}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[13px] text-ink-mute">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.city}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{company.size.replace(" nhân sự", "")}</span>
        </div>
        <div className="mt-3"><Badge tone={openJobs ? "ok" : "neutral"}>{openJobs ? `${openJobs} vị trí đang tuyển` : "Chưa có vị trí mở"}</Badge></div>
      </div>
    </Link>
  );
}

export function ArticleCard({ a, large }: { a: Article; large?: boolean }) {
  return (
    <Link to={`/cam-nang/${a.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper shadow-soft transition-all hover:-translate-y-1 hover:border-gold hover:shadow-pop">
      <ArticleCover category={a.category} slug={a.slug} className={large ? "h-48" : "h-36"} />
      <div className="flex flex-1 flex-col p-5">
        <Badge tone="gold" className="self-start">{a.category}</Badge>
        <h3 className={`mt-3 font-semibold leading-snug group-hover:text-gold-ink ${large ? "text-xl" : "text-base"}`}>{a.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{a.excerpt}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-ink-mute"><Clock3 className="h-3.5 w-3.5" />{a.minutes} phút đọc · {fmtDate(a.date)}</p>
      </div>
    </Link>
  );
}
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`rounded-card border border-line bg-paper p-5 shadow-soft sm:p-6 ${className}`}>{children}</div>;
