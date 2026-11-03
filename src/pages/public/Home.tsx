import { ArrowRight, Briefcase, Building2, Calculator, ConciergeBell, Factory, GraduationCap, Handshake, MapPin, Megaphone, Palette, Search, Truck, Users, CodeXml, CheckCircle2, type LucideIcon } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { CompanyLogo, ErrorState, ListSkeleton } from "@/components/shared/common";
import { JobCard } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";

export const CAT_ICON: Record<string, LucideIcon> = {
  "Công nghệ thông tin": CodeXml, "Kinh doanh – Bán hàng": Handshake, "Marketing – Truyền thông": Megaphone, "Kế toán – Tài chính": Calculator,
  "Nhân sự – Hành chính": Users, "Thiết kế – Sáng tạo": Palette, "Vận hành – Logistics": Truck, "Giáo dục – Đào tạo": GraduationCap,
  "Dịch vụ – Khách sạn": ConciergeBell, "Sản xuất – Kỹ thuật": Factory,
};

export default function Home() {
  const { jobs, companies, catalogs, role } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState(""); const [loc, setLoc] = useState("");
  const { loading, error, retry } = useFakeLoad(400);
  const live = useMemo(() => jobs.filter((j) => j.status === "approved"), [jobs]);
  const latest = useMemo(() => [...live].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 6), [live]);
  const approvedCompanies = companies.filter((c) => c.status === "approved");
  const featured = useMemo(() => approvedCompanies.map((c) => ({ c, n: live.filter((j) => j.companyId === c.id).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 6), [approvedCompanies, live]);
  const cats = catalogs.categories.filter((c) => c.active);
  const search = (e: FormEvent) => { e.preventDefault(); const p = new URLSearchParams(); if (q.trim()) p.set("q", q.trim()); if (loc) p.set("loc", loc); nav(`/viec-lam?${p}`); };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-butter">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-gold/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-cream/70 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cream/80 px-3.5 py-1.5 text-[13px] font-semibold text-gold-ink"><span className="h-2 w-2 rounded-full bg-gold" />{live.length} việc làm đang tuyển</p>
          <h1 className="max-w-3xl text-[34px] font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[56px]">Việc tốt, đến sớm <span className="relative whitespace-nowrap">như nắng mai<svg aria-hidden className="absolute -bottom-1.5 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none"><path d="M2 7c40-6 100-6 196-1" stroke="#f4ce73" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span></h1>
          <p className="mt-5 max-w-xl text-base text-ink-soft sm:text-lg">Tìm vị trí phù hợp với kỹ năng và mong muốn của bạn — từ doanh nghiệp đang cần người ngay hôm nay.</p>
          <form onSubmit={search} role="search" className="mt-9 grid max-w-4xl gap-2 rounded-2xl bg-paper p-2.5 shadow-pop sm:grid-cols-[1.5fr_1fr_auto]">
            <label className="relative block"><span className="sr-only">Từ khóa</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chức danh, kỹ năng hoặc công ty" className="h-12 border-transparent pl-11" /></label>
            <label className="relative block"><span className="sr-only">Địa điểm</span><MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
              <Select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-12 border-transparent pl-11"><option value="">Tất cả địa điểm</option>{catalogs.locations.filter((l) => l.active).map((l) => <option key={l.id}>{l.name}</option>)}</Select></label>
            <Button type="submit" size="lg" className="h-12">Tìm việc</Button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm"><span className="text-ink-soft">Gợi ý:</span>
            {["React", "Kế toán", "Giáo viên", "Kinh doanh", "Thiết kế"].map((t) => <Link key={t} to={`/viec-lam?q=${encodeURIComponent(t)}`} className="rounded-full bg-cream/80 px-3.5 py-1.5 font-medium hover:bg-paper">{t}</Link>)}
          </div>
        </div>
      </section>

      {/* Ngành nghề */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="h-cat">
        <div className="mb-8 flex items-end justify-between gap-4"><div><h2 id="h-cat" className="text-2xl font-bold sm:text-3xl">Khám phá theo ngành nghề</h2><p className="mt-1.5 text-ink-soft">Chọn lĩnh vực bạn quan tâm để xem ngay các vị trí phù hợp.</p></div></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map((c) => { const I = CAT_ICON[c.name] ?? Briefcase; const n = live.filter((j) => j.category === c.name).length; return (
            <Link key={c.id} to={`/viec-lam?cat=${encodeURIComponent(c.name)}`} className="group flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-butter-soft sm:p-5">
              <span className="grid h-11 w-11 place-items-center rounded-ctl bg-butter text-gold-ink transition-colors group-hover:bg-gold group-hover:text-ink"><I className="h-5 w-5" /></span>
              <span><span className="block text-[15px] font-semibold leading-snug">{c.name}</span><span className="mt-0.5 block text-[13px] text-ink-mute">{n} việc làm</span></span>
            </Link>); })}
        </div>
      </section>

      {/* Việc mới nhất */}
      <section className="bg-butter-soft py-16" aria-labelledby="h-new">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4"><div><h2 id="h-new" className="text-2xl font-bold sm:text-3xl">Việc làm mới nhất</h2><p className="mt-1.5 text-ink-soft">Cập nhật từ các doanh nghiệp đã được xác minh.</p></div>
            <Link to="/viec-lam" className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold hover:text-gold-ink sm:flex">Xem tất cả <ArrowRight className="h-4 w-4" /></Link></div>
          {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> :
            <div className="grid gap-4 md:grid-cols-2">{latest.map((j) => <JobCard key={j.id} job={j} company={companies.find((c) => c.id === j.companyId)} />)}</div>}
          <div className="mt-8 text-center sm:hidden"><Link to="/viec-lam"><Button variant="outline">Xem tất cả việc làm</Button></Link></div>
        </div>
      </section>

      {/* Doanh nghiệp nổi bật */}
      <section id="doanh-nghiep" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:px-6" aria-labelledby="h-co">
        <h2 id="h-co" className="text-2xl font-bold sm:text-3xl">Doanh nghiệp nổi bật</h2>
        <p className="mb-8 mt-1.5 text-ink-soft">Những nhà tuyển dụng đang mở nhiều vị trí nhất.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ c, n }) => (
            <Link key={c.id} to={`/cong-ty/${c.id}`} className="flex items-center gap-4 rounded-card border border-line bg-paper p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-pop">
              <CompanyLogo name={c.name} tone={c.tone} size={56} />
              <span className="min-w-0"><span className="block truncate font-semibold">{c.name}</span><span className="block truncate text-sm text-ink-soft">{c.industry} · {c.city}</span><span className="mt-1 inline-block text-sm font-semibold text-gold-ink">{n} vị trí đang tuyển</span></span>
            </Link>))}
        </div>
      </section>

      {/* Nhà tuyển dụng */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-labelledby="h-emp">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-cream sm:px-12 sm:py-14">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold"><Building2 className="h-4 w-4" />Dành cho nhà tuyển dụng</p>
              <h2 id="h-emp" className="text-2xl font-bold leading-snug sm:text-3xl">Đăng tin và quản lý ứng viên ở cùng một nơi</h2>
              <p className="mt-3 max-w-lg text-cream/75">Tạo tin tuyển dụng, theo dõi hồ sơ và cập nhật trạng thái từng ứng viên — gọn gàng, không rườm rà.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => nav(role === "employer" ? "/nha-tuyen-dung" : "/dang-nhap?tab=employer")}>{role === "employer" ? "Vào khu vực tuyển dụng" : "Đăng ký nhà tuyển dụng"}</Button>
              </div>
            </div>
            <ul className="space-y-3.5 text-[15px]">
              {["Soạn tin, lưu nháp và xem trước trước khi gửi duyệt", "Quản lý hồ sơ theo từng vị trí tuyển dụng", "Cập nhật trạng thái và ghi chú nội bộ cho từng ứng viên"].map((t) => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />{t}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
