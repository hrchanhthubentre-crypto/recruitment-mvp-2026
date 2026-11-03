import { MapPin, SlidersHorizontal, Search, X, SearchX } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, Radio, Select } from "@/components/ui/form";
import { Drawer } from "@/components/ui/overlay";
import { EmptyState, ErrorState, ListSkeleton, Pagination } from "@/components/shared/common";
import { JobCard } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { matches } from "@/lib/utils";
import type { Job } from "@/lib/types";

const SAL = [
  { id: "lt10", label: "Dưới 10 triệu", t: (j: Job) => j.salaryMax > 0 && j.salaryMax < 10 },
  { id: "10-20", label: "10 – 20 triệu", t: (j: Job) => j.salaryMax >= 10 && j.salaryMin <= 20 && j.salaryMax > 0 },
  { id: "20-30", label: "20 – 30 triệu", t: (j: Job) => j.salaryMax >= 20 && j.salaryMin <= 30 && j.salaryMax > 0 },
  { id: "30-50", label: "30 – 50 triệu", t: (j: Job) => j.salaryMax >= 30 && j.salaryMin <= 50 && j.salaryMax > 0 },
  { id: "gt50", label: "Trên 50 triệu", t: (j: Job) => j.salaryMax > 50 },
  { id: "neg", label: "Thỏa thuận", t: (j: Job) => !j.salaryMin && !j.salaryMax },
];

export default function Jobs() {
  const { jobs, companies, catalogs, settings } = useStore();
  const [sp, setSp] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const { loading, error, retry } = useFakeLoad(400);
  const g = (k: string) => sp.get(k) ?? "";
  const [kw, setKw] = useState(g("q"));
  useEffect(() => setKw(g("q")), [sp.get("q")]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); if (!("page" in patch)) n.delete("page"); setSp(n, { replace: true }); };

  const list = useMemo(() => {
    const q = g("q"), cat = g("cat"), loc = g("loc"), sal = g("sal"), exp = g("exp"), type = g("type"), sort = g("sort");
    const co = (j: Job) => companies.find((c) => c.id === j.companyId);
    let r = jobs.filter((j) => j.status === "approved" && co(j)?.status === "approved");
    if (q) r = r.filter((j) => matches(`${j.title} ${co(j)?.name} ${j.category}`, q));
    if (cat) r = r.filter((j) => j.category === cat);
    if (loc) r = r.filter((j) => j.location === loc);
    if (exp) r = r.filter((j) => j.experience === exp);
    if (type) r = r.filter((j) => j.type === type);
    if (sal) r = r.filter(SAL.find((s) => s.id === sal)!.t);
    if (sort === "salary") r = [...r].sort((a, b) => b.salaryMax - a.salaryMax);
    else if (sort === "deadline") r = [...r].sort((a, b) => a.deadline.localeCompare(b.deadline));
    else r = [...r].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    return r;
  }, [jobs, companies, sp]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = jobs.filter((j) => j.status === "approved" && companies.find((c) => c.id === j.companyId)?.status === "approved");
  const per = settings.perPage; const pages = Math.max(1, Math.ceil(list.length / per));
  const page = Math.min(Math.max(1, Number(g("page")) || 1), pages);
  const shown = list.slice((page - 1) * per, page * per);
  const active = ["cat", "loc", "sal", "exp", "type"].filter((k) => g(k));
  const chips: [string, string][] = [...(g("q") ? [["q", `“${g("q")}”`] as [string, string]] : []), ...active.map((k) => [k, k === "sal" ? SAL.find((s) => s.id === g(k))!.label : g(k)] as [string, string])];

  const Filters = (
    <div className="space-y-6">
      <FG title="Ngành nghề"><Radio name="cat" checked={!g("cat")} onChange={() => set({ cat: "" })}>Tất cả ngành nghề</Radio>
        {catalogs.categories.filter((c) => c.active).map((c) => <Radio key={c.id} name="cat" checked={g("cat") === c.name} onChange={() => set({ cat: c.name })}>{c.name}</Radio>)}</FG>
      <FG title="Địa điểm"><Select aria-label="Địa điểm" value={g("loc")} onChange={(e) => set({ loc: e.target.value })}><option value="">Tất cả địa điểm</option>{catalogs.locations.filter((l) => l.active).map((l) => <option key={l.id}>{l.name}</option>)}</Select></FG>
      <FG title="Mức lương"><Radio name="sal" checked={!g("sal")} onChange={() => set({ sal: "" })}>Tất cả mức lương</Radio>{SAL.map((s) => <Radio key={s.id} name="sal" checked={g("sal") === s.id} onChange={() => set({ sal: s.id })}>{s.label}</Radio>)}</FG>
      <FG title="Kinh nghiệm"><Radio name="exp" checked={!g("exp")} onChange={() => set({ exp: "" })}>Tất cả</Radio>{catalogs.experiences.filter((e) => e.active).map((e) => <Radio key={e.id} name="exp" checked={g("exp") === e.name} onChange={() => set({ exp: e.name })}>{e.name}</Radio>)}</FG>
      <FG title="Hình thức làm việc"><Radio name="type" checked={!g("type")} onChange={() => set({ type: "" })}>Tất cả</Radio>{catalogs.types.filter((t) => t.active).map((t) => <Radio key={t.id} name="type" checked={g("type") === t.name} onChange={() => set({ type: t.name })}>{t.name}</Radio>)}</FG>
    </div>
  );

  return (
    <div>
      <div className="bg-butter">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
          <h1 className="text-2xl font-bold sm:text-4xl">Tìm việc làm</h1>
          <p className="mt-1.5 text-ink-soft">{live.length} vị trí đang mở từ các doanh nghiệp đã được xác minh.</p>
          <form role="search" onSubmit={(e) => { e.preventDefault(); set({ q: kw.trim() }); }} className="mt-5 grid gap-2 rounded-2xl bg-paper p-2.5 shadow-pop sm:grid-cols-[1fr_220px_auto]">
            <label className="relative block"><span className="sr-only">Từ khóa</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
              <Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Chức danh, kỹ năng hoặc công ty" className="h-12 border-transparent bg-cream pl-11" /></label>
            <label className="relative block"><span className="sr-only">Địa điểm</span><MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden />
              <Select value={g("loc")} onChange={(e) => set({ loc: e.target.value })} className="h-12 border-transparent bg-cream pl-11"><option value="">Mọi địa điểm</option>{catalogs.locations.filter((l) => l.active).map((l) => <option key={l.id}>{l.name}</option>)}</Select></label>
            <Button type="submit" size="lg" className="h-12">Tìm kiếm</Button>
          </form>
          <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Lọc nhanh theo ngành">
            <button onClick={() => set({ cat: "" })} aria-pressed={!g("cat")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${!g("cat") ? "bg-ink text-cream" : "bg-cream/80 hover:bg-paper"}`}>Tất cả</button>
            {catalogs.categories.filter((c) => c.active).map((c) => <button key={c.id} onClick={() => set({ cat: c.name })} aria-pressed={g("cat") === c.name} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${g("cat") === c.name ? "bg-ink text-cream" : "bg-cream/80 hover:bg-paper"}`}>{c.name}</button>)}
          </div>
        </div>
      </div>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto rounded-card border border-line bg-paper p-5 shadow-soft"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Bộ lọc</h2>{(active.length > 0) && <button onClick={() => set({ cat: "", loc: "", sal: "", exp: "", type: "" })} className="text-sm font-medium text-gold-ink hover:underline">Xóa lọc</button>}</div>{Filters}</div></aside>

        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-soft"><b className="text-ink">{loading ? "…" : list.length}</b> việc làm phù hợp</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal className="h-4 w-4" />Bộ lọc{active.length > 0 && ` (${active.length})`}</Button>
              <label className="flex items-center gap-2 text-sm"><span className="hidden text-ink-soft sm:inline">Sắp xếp</span>
                <Select aria-label="Sắp xếp kết quả" className="h-9 w-44" value={g("sort")} onChange={(e) => set({ sort: e.target.value })}><option value="">Mới nhất</option><option value="salary">Lương cao nhất</option><option value="deadline">Sắp hết hạn</option></Select></label>
            </div>
          </div>
          {chips.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{chips.map(([k, v]) => <button key={k} onClick={() => set({ [k]: "" })} className="inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1.5 text-sm font-medium hover:bg-gold/60" aria-label={`Bỏ lọc ${v}`}>{v}<X className="h-3.5 w-3.5" /></button>)}</div>}

          {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={5} /> : shown.length === 0 ? (
            <EmptyState icon={<SearchX className="h-6 w-6" />} title="Không tìm thấy việc làm phù hợp" text="Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm kết quả."
              action={<Button onClick={() => { setSp(new URLSearchParams(), { replace: true }); setKw(""); }}>Xóa tất cả bộ lọc</Button>} />
          ) : (
            <>
              <div className="space-y-3">{shown.map((j) => <JobCard key={j.id} job={j} company={companies.find((c) => c.id === j.companyId)} />)}</div>
              <Pagination page={page} pages={pages} onChange={(p) => { set({ page: String(p) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </section>
      </div>

      <Drawer open={drawer} onOpenChange={setDrawer} title="Bộ lọc việc làm" width="max-w-sm"
        footer={<><Button variant="outline" onClick={() => set({ cat: "", loc: "", sal: "", exp: "", type: "" })}>Xóa lọc</Button><Button onClick={() => setDrawer(false)}>Xem {list.length} kết quả</Button></>}>{Filters}</Drawer>
    </div>
    </div>
  );
}
const FG = ({ title, children }: { title: string; children: React.ReactNode }) => <fieldset><legend className="mb-2 text-sm font-semibold">{title}</legend><div className="space-y-0.5">{children}</div></fieldset>;
