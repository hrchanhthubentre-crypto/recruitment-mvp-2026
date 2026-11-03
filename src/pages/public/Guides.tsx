import { ChevronRight, Clock3, FileSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge, EmptyState, ErrorState, Pagination, Skeleton } from "@/components/shared/common";
import { ArticleCover } from "@/components/shared/art";
import { ArticleCard } from "@/components/shared/cards";
import { ARTICLES, ARTICLE_CATEGORIES } from "@/lib/articles";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, matches } from "@/lib/utils";

const PER = 6;
export function Guides() {
  const [sp, setSp] = useSearchParams(); const g = (k: string) => sp.get(k) ?? ""; const { loading, error, retry } = useFakeLoad(350);
  const [kw, setKw] = useState(g("q")); useEffect(() => setKw(g("q")), [sp.get("q")]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); if (!("page" in patch)) n.delete("page"); setSp(n, { replace: true }); };
  const filtered = useMemo(() => ARTICLES.filter((a) => (!g("cat") || a.category === g("cat")) && (!g("q") || matches(`${a.title} ${a.excerpt}`, g("q")))).sort((a, b) => b.date.localeCompare(a.date)), [sp]); // eslint-disable-line react-hooks/exhaustive-deps
  const hero = !g("q") && !g("cat") ? ARTICLES.find((a) => a.featured) : undefined;
  const rest = filtered.filter((a) => a !== hero); const pages = Math.max(1, Math.ceil(rest.length / PER)); const page = Math.min(Math.max(1, Number(g("page")) || 1), pages); const shown = rest.slice((page - 1) * PER, page * PER);
  return (
    <div>
      <section className="bg-butter"><div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
        <h1 className="text-2xl font-bold sm:text-4xl">Cẩm nang nghề nghiệp</h1><p className="mt-1.5 max-w-xl text-ink-soft">Bài viết mẫu giúp bạn viết CV, chuẩn bị phỏng vấn và định hướng nghề nghiệp.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); set({ q: kw.trim() }); }} className="mt-5 flex gap-2 rounded-2xl bg-paper p-2.5 shadow-pop sm:max-w-xl">
          <label className="relative block flex-1"><span className="sr-only">Tìm bài viết</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden /><Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Tìm bài viết…" className="h-12 border-transparent bg-cream pl-11" /></label><Button type="submit" size="lg" className="h-12">Tìm</Button></form>
        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Chủ đề">
          {["", ...ARTICLE_CATEGORIES].map((c) => <button key={c || "all"} aria-pressed={g("cat") === c} onClick={() => set({ cat: c })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${g("cat") === c ? "bg-ink text-cream" : "bg-cream/80 hover:bg-paper"}`}>{c || "Tất cả chủ đề"}</button>)}</div></div></section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div> : filtered.length === 0 ? (
          <EmptyState icon={<FileSearch className="h-6 w-6" />} title="Không tìm thấy bài viết" text="Hãy thử từ khóa khác hoặc chọn chủ đề khác." action={<Button onClick={() => { setSp(new URLSearchParams(), { replace: true }); setKw(""); }}>Xóa bộ lọc</Button>} />
        ) : (<>
          {hero && page === 1 && (
            <Link to={`/cam-nang/${hero.slug}`} className="group mb-8 grid overflow-hidden rounded-card border border-line bg-paper shadow-soft transition-shadow hover:shadow-pop md:grid-cols-2">
              <ArticleCover category={hero.category} slug={hero.slug} className="h-56 md:h-full md:min-h-[280px]" />
              <div className="flex flex-col justify-center p-6 sm:p-9"><div className="flex gap-2"><Badge tone="gold">Bài viết nổi bật</Badge><Badge>{hero.category}</Badge></div><h2 className="mt-4 text-2xl font-bold leading-snug group-hover:text-gold-ink">{hero.title}</h2><p className="mt-3 leading-relaxed text-ink-soft">{hero.excerpt}</p><p className="mt-5 flex items-center gap-1.5 text-sm text-ink-mute"><Clock3 className="h-4 w-4" />{hero.minutes} phút đọc · {fmtDate(hero.date)}</p></div>
            </Link>)}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
          <Pagination page={page} pages={pages} onChange={(p) => { set({ page: String(p) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          <p className="mt-8 text-center text-xs text-ink-mute">Bài viết trong bản xem trước là nội dung mẫu để minh họa giao diện, không phải tin tức hay số liệu thật.</p></>)}
      </div>
    </div>
  );
}

export function GuideDetail() {
  const { slug } = useParams(); const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return <div className="mx-auto max-w-xl px-4 py-24"><EmptyState title="Không tìm thấy bài viết" action={<Link to="/cam-nang"><Button>Về cẩm nang</Button></Link>} /></div>;
  const related = ARTICLES.filter((x) => x.slug !== a.slug && x.category === a.category).concat(ARTICLES.filter((x) => x.category !== a.category)).slice(0, 3);
  return (
    <div>
      <ArticleCover category={a.category} slug={a.slug} className="h-40 sm:h-56" />
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft"><Link to="/cam-nang" className="hover:text-ink">Cẩm nang</Link><ChevronRight className="h-3.5 w-3.5" /><Link to={`/cam-nang?cat=${encodeURIComponent(a.category)}`} className="hover:text-ink">{a.category}</Link></nav>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">{a.title}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-mute"><Clock3 className="h-4 w-4" />{a.minutes} phút đọc · {fmtDate(a.date)} · Ban biên tập mẫu</p>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">{a.excerpt}</p>
        <div className="mt-6 space-y-4">{a.body.map((p, i) => p.startsWith("## ") ? <h2 key={i} className="pt-4 text-xl font-bold">{p.slice(3)}</h2> : <p key={i} className="text-[17px] leading-[1.75]">{p}</p>)}</div>
        <p className="mt-10 rounded-ctl bg-butter-soft p-4 text-sm text-ink-soft">Đây là bài viết mẫu dùng để minh họa giao diện cẩm nang, không phải tin tức hay tư vấn thật.</p>
      </article>
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6"><h2 className="mb-5 text-xl font-bold">Bài viết liên quan</h2><div className="grid gap-4 md:grid-cols-3">{related.map((x) => <ArticleCard key={x.slug} a={x} />)}</div></section>
    </div>
  );
}
