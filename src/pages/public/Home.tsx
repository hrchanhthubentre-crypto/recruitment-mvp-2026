import { ArrowRight, Briefcase, Building2, Calculator, CheckCircle2, CodeXml, ConciergeBell, Factory, GraduationCap, Handshake, MapPin, Megaphone, Palette, Search, Truck, Users, Layers, type LucideIcon } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Badge, CompanyLogo, EmptyState, ErrorState, ListSkeleton, Skeleton } from "@/components/shared/common";
import { JobCard, JobTile } from "@/components/shared/job";
import { ArticleCard, CompanyCard, SectionHead } from "@/components/shared/cards";
import { SunriseArt } from "@/components/shared/art";
import { ARTICLES } from "@/lib/articles";
import { isFeatured } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { salaryText } from "@/lib/utils";

export const CAT_ICON: Record<string, LucideIcon> = {
  "Công nghệ thông tin": CodeXml, "Kinh doanh – Bán hàng": Handshake, "Marketing – Truyền thông": Megaphone, "Kế toán – Tài chính": Calculator,
  "Nhân sự – Hành chính": Users, "Thiết kế – Sáng tạo": Palette, "Vận hành – Logistics": Truck, "Giáo dục – Đào tạo": GraduationCap,
  "Dịch vụ – Khách sạn": ConciergeBell, "Sản xuất – Kỹ thuật": Factory,
};

export default function Home() {
  const { jobs, companies, catalogs, role } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [loc, setLoc] = useState(""); const [tabLoc, setTabLoc] = useState("");
  const { loading, error, retry } = useFakeLoad(450);
  const cos = (id: string) => companies.find((c) => c.id === id);
  const live = useMemo(() => jobs.filter((j) => j.status === "approved" && cos(j.companyId)?.status === "approved"), [jobs, companies]); // eslint-disable-line react-hooks/exhaustive-deps
  const latest = useMemo(() => [...live].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 6), [live]);
  const featured = useMemo(() => live.filter(isFeatured).sort((a, b) => b.salaryMax - a.salaryMax).slice(0, 6), [live]);
  const featuredCos = useMemo(() => companies.filter((c) => c.status === "approved").map((c) => ({ c, n: live.filter((j) => j.companyId === c.id).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4), [companies, live]);
  const cats = catalogs.categories.filter((c) => c.active); const locs = catalogs.locations.filter((l) => l.active);
  const hotLocs = useMemo(() => locs.map((l) => ({ name: l.name, n: live.filter((j) => j.location === l.name).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5), [locs, live]);
  const activeLoc = tabLoc || hotLocs[0]?.name || "";
  const byLoc = live.filter((j) => j.location === activeLoc).slice(0, 4);
  const search = (e: FormEvent) => { e.preventDefault(); const p = new URLSearchParams(); if (q.trim()) p.set("q", q.trim()); if (cat) p.set("cat", cat); if (loc) p.set("loc", loc); nav(`/viec-lam?${p}`); };
  const guides = [...ARTICLES].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 3);
  const Section = ({ children, tint, id }: { children: React.ReactNode; tint?: boolean; id?: string }) => <section id={id} className={tint ? "bg-butter-soft py-16 sm:py-20" : "py-16 sm:py-20"}><div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div></section>;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-butter">
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cream/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-cream/80 px-3.5 py-1.5 text-[13px] font-semibold text-gold-ink"><span className="h-2 w-2 rounded-full bg-gold" />{live.length} việc làm · {companies.filter((c) => c.status === "approved").length} doanh nghiệp đang tuyển</p>
            <h1 className="max-w-2xl text-[36px] font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[56px]">Tìm công việc phù hợp, <span className="relative whitespace-nowrap">bắt đầu từ hôm nay<svg aria-hidden className="absolute -bottom-1.5 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none"><path d="M2 7c40-6 100-6 196-1" stroke="#f4ce73" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span></h1>
            <p className="mt-5 max-w-lg text-base text-ink-soft sm:text-lg">Khám phá cơ hội từ những doanh nghiệp đã được xác minh, trên khắp cả nước — từ thực tập sinh đến quản lý.</p>
            <form onSubmit={search} role="search" aria-label="Tìm việc làm" className="mt-8 rounded-2xl bg-paper p-2.5 shadow-pop lg:max-w-[760px]">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]">
                <label className="relative block sm:col-span-2 xl:col-span-1"><span className="sr-only">Từ khóa</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chức danh, kỹ năng, công ty" className="h-12 w-full rounded-ctl bg-cream pl-11 pr-3 text-sm placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-gold" /></label>
                <label className="relative block"><span className="sr-only">Ngành nghề</span><Layers className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
                  <Select value={cat} onChange={(e) => setCat(e.target.value)} className="h-12 border-transparent bg-cream pl-11"><option value="">Mọi ngành nghề</option>{cats.map((c) => <option key={c.id}>{c.name}</option>)}</Select></label>
                <label className="relative block"><span className="sr-only">Địa điểm</span><MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
                  <Select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-12 border-transparent bg-cream pl-11"><option value="">Mọi địa điểm</option>{locs.map((l) => <option key={l.id}>{l.name}</option>)}</Select></label>
              </div>
              <Button type="submit" size="lg" className="mt-2 h-12 w-full">Tìm việc ngay</Button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm"><span className="text-ink-soft">Phổ biến:</span>
              {["React", "Kế toán", "Giáo viên", "Kinh doanh", "Thiết kế"].map((t) => <Link key={t} to={`/viec-lam?q=${encodeURIComponent(t)}`} className="rounded-full bg-cream/80 px-3.5 py-1.5 font-medium hover:bg-paper">{t}</Link>)}</div>
          </div>
          {/* Minh họa + thẻ việc làm nổi bật */}
          <div aria-hidden className="relative mx-auto hidden w-full max-w-[460px] lg:block">
            <SunriseArt className="w-full" />
            {featured.slice(0, 2).map((j, i) => { const c = cos(j.companyId); return (
              <div key={j.id} className={`absolute w-64 rounded-card bg-paper p-4 shadow-pop ${i ? "-left-6 bottom-12" : "-right-4 top-8"}`} style={{ transform: `rotate(${i ? -3 : 3}deg)` }}>
                <div className="flex items-center gap-3"><CompanyLogo name={c?.name ?? "?"} tone={c?.tone} size={40} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{j.title}</p><p className="truncate text-xs text-ink-soft">{c?.name}</p></div></div>
                <div className="mt-3 flex items-center justify-between text-xs"><b>{salaryText(j.salaryMin, j.salaryMax)}</b><Badge tone="gold">{j.location}</Badge></div>
              </div>); })}
          </div>
        </div>
      </section>

      {/* Ngành nghề phổ biến */}
      <Section>
        <SectionHead id="h-cat" eyebrow="Ngành nghề phổ biến" title="Khám phá theo lĩnh vực" desc="Chọn ngành bạn quan tâm để xem ngay các vị trí đang mở." to="/viec-lam" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map((c) => { const I = CAT_ICON[c.name] ?? Briefcase; const n = live.filter((j) => j.category === c.name).length; return (
            <Link key={c.id} to={`/viec-lam?cat=${encodeURIComponent(c.name)}`} className="group flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-butter-soft sm:p-5">
              <span className="grid h-11 w-11 place-items-center rounded-ctl bg-butter text-gold-ink transition-colors group-hover:bg-gold group-hover:text-ink"><I className="h-5 w-5" /></span>
              <span><span className="block text-[15px] font-semibold leading-snug">{c.name}</span><span className="mt-0.5 block text-[13px] text-ink-mute">{n} việc làm</span></span>
            </Link>); })}
        </div>
      </Section>

      {/* Việc làm nổi bật */}
      <Section tint>
        <SectionHead id="h-feat" eyebrow="Việc làm nổi bật" title="Cơ hội đáng chú ý tuần này" desc="Những vị trí có mức thu nhập hấp dẫn từ doanh nghiệp đang tuyển gấp." to="/viec-lam?sort=salary" />
        {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}</div> :
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((j) => <JobTile key={j.id} job={j} company={cos(j.companyId)} />)}</div>}
      </Section>

      {/* Việc làm mới nhất */}
      <Section>
        <SectionHead id="h-new" eyebrow="Mới đăng" title="Việc làm mới nhất" desc="Cập nhật liên tục từ các doanh nghiệp đã được xác minh." to="/viec-lam" />
        {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : <div className="grid gap-4 md:grid-cols-2">{latest.map((j) => <JobCard key={j.id} job={j} company={cos(j.companyId)} />)}</div>}
        <div className="mt-8 text-center sm:hidden"><Link to="/viec-lam"><Button variant="outline">Xem tất cả việc làm</Button></Link></div>
      </Section>

      {/* Việc làm theo địa điểm */}
      <Section tint>
        <SectionHead id="h-loc" eyebrow="Theo địa điểm" title="Việc làm theo khu vực" to={`/viec-lam?loc=${encodeURIComponent(activeLoc)}`} toLabel={`Tất cả việc tại ${activeLoc}`} />
        <div role="tablist" aria-label="Chọn khu vực" className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {hotLocs.map((l) => <button key={l.name} role="tab" aria-selected={activeLoc === l.name} onClick={() => setTabLoc(l.name)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${activeLoc === l.name ? "border-ink bg-ink text-cream" : "border-line bg-paper hover:border-gold"}`}><MapPin className="h-4 w-4" />{l.name}<span className={`rounded-full px-2 text-xs ${activeLoc === l.name ? "bg-white/20" : "bg-butter"}`}>{l.n}</span></button>)}
        </div>
        {byLoc.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{byLoc.map((j) => <JobTile key={j.id} job={j} company={cos(j.companyId)} />)}</div> : <EmptyState title="Chưa có việc làm tại khu vực này" />}
      </Section>

      {/* Doanh nghiệp nổi bật */}
      <Section id="doanh-nghiep">
        <SectionHead id="h-co" eyebrow="Nhà tuyển dụng" title="Doanh nghiệp nổi bật" desc="Những công ty đang mở nhiều vị trí nhất." to="/cong-ty" toLabel="Xem tất cả công ty" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredCos.map(({ c, n }) => <CompanyCard key={c.id} company={c} openJobs={n} />)}</div>
        <div className="mt-8 text-center sm:hidden"><Link to="/cong-ty"><Button variant="outline">Xem tất cả công ty</Button></Link></div>
      </Section>

      {/* Cẩm nang */}
      <Section tint>
        <SectionHead id="h-guide" eyebrow="Cẩm nang nghề nghiệp" title="Gợi ý cho hành trình của bạn" desc="Bài viết mẫu về CV, phỏng vấn, lương và định hướng nghề nghiệp." to="/cam-nang" />
        <div className="grid gap-4 md:grid-cols-3">{guides.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
        <p className="mt-4 text-xs text-ink-mute">Bài viết trong bản xem trước là nội dung mẫu, không phải tin tức thật.</p>
      </Section>

      {/* Nhà tuyển dụng */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20" aria-labelledby="h-emp">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-cream sm:px-12 sm:py-14">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold"><Building2 className="h-4 w-4" />Dành cho nhà tuyển dụng</p>
              <h2 id="h-emp" className="text-2xl font-bold leading-snug sm:text-3xl">Đăng tin và quản lý ứng viên ở cùng một nơi</h2>
              <p className="mt-3 max-w-lg text-cream/75">Tạo tin tuyển dụng, theo dõi hiệu quả từng tin, quản lý hồ sơ và cập nhật trạng thái cho từng ứng viên — gọn gàng, không rườm rà.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => nav(role === "employer" ? "/nha-tuyen-dung" : "/dang-ky?tab=employer")}>{role === "employer" ? "Vào khu vực tuyển dụng" : "Đăng ký nhà tuyển dụng"}</Button>
                {role === "guest" && <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-cream hover:bg-white/10 hover:text-cream" onClick={() => nav("/dang-nhap?tab=employer")}>Đã có tài khoản</Button>}
              </div>
            </div>
            <ul className="space-y-3.5 text-[15px]">
              {["Soạn tin, lưu nháp và xem trước trước khi gửi duyệt", "Xem số lượt xem và ứng tuyển của từng tin (số liệu mẫu)", "Cập nhật trạng thái và ghi chú nội bộ cho từng ứng viên"].map((t) => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />{t}</li>)}
            </ul>
          </div>
        </div>
      </section>
      <div className="h-4" />
    </div>
  );
}
export { ArrowRight };
