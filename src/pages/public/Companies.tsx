import { Building2, MapPin, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { EmptyState, ErrorState, Pagination, Skeleton } from "@/components/shared/common";
import { CompanyCard } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { matches } from "@/lib/utils";

const PER = 8;
export default function Companies() {
  const { companies, jobs, catalogs } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [sp, setSp] = useSearchParams(); const g = (k: string) => sp.get(k) ?? "";
  const [kw, setKw] = useState(g("q")); useEffect(() => setKw(g("q")), [sp.get("q")]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); if (!("page" in patch)) n.delete("page"); setSp(n, { replace: true }); };
  const open = (id: string) => jobs.filter((j) => j.companyId === id && j.status === "approved").length;
  const list = useMemo(() => {
    let r = companies.filter((c) => c.status === "approved");
    if (g("q")) r = r.filter((c) => matches(`${c.name} ${c.industry}`, g("q")));
    if (g("ind")) r = r.filter((c) => c.industry === g("ind")); if (g("city")) r = r.filter((c) => c.city === g("city"));
    return [...r].sort((a, b) => (g("sort") === "name" ? a.name.localeCompare(b.name, "vi") : open(b.id) - open(a.id)));
  }, [companies, jobs, sp]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(list.length / PER)); const page = Math.min(Math.max(1, Number(g("page")) || 1), pages); const shown = list.slice((page - 1) * PER, page * PER);
  const total = companies.filter((c) => c.status === "approved").length;
  return (
    <div>
      <section className="bg-butter"><div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
        <h1 className="text-2xl font-bold sm:text-4xl">Danh sách công ty</h1><p className="mt-1.5 text-ink-soft">{total} doanh nghiệp đã được xác minh trên nền tảng.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); set({ q: kw.trim() }); }} className="mt-5 grid gap-2 rounded-2xl bg-paper p-2.5 shadow-pop md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="relative block"><span className="sr-only">Tên công ty</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-mute" aria-hidden /><Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Tìm theo tên công ty" className="h-12 border-transparent bg-cream pl-11" /></label>
          <Select aria-label="Ngành nghề" className="h-12 border-transparent bg-cream" value={g("ind")} onChange={(e) => set({ ind: e.target.value })}><option value="">Mọi ngành nghề</option>{catalogs.categories.filter((c) => c.active).map((c) => <option key={c.id}>{c.name}</option>)}</Select>
          <Select aria-label="Địa điểm" className="h-12 border-transparent bg-cream" value={g("city")} onChange={(e) => set({ city: e.target.value })}><option value="">Mọi địa điểm</option>{catalogs.locations.filter((c) => c.active && c.name !== "Làm việc từ xa").map((c) => <option key={c.id}>{c.name}</option>)}</Select>
          <Button type="submit" size="lg" className="h-12">Tìm công ty</Button>
        </form></div></section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-[15px] text-ink-soft"><b className="text-ink">{loading ? "…" : list.length}</b> công ty</p>
          <label className="flex items-center gap-2 text-sm"><span className="text-ink-soft">Sắp xếp</span><Select aria-label="Sắp xếp công ty" className="h-9 w-48" value={g("sort")} onChange={(e) => set({ sort: e.target.value })}><option value="">Nhiều việc làm nhất</option><option value="name">Tên A → Z</option></Select></label></div>
        {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div> : shown.length === 0 ? (
          <EmptyState icon={<Building2 className="h-6 w-6" />} title="Không tìm thấy công ty phù hợp" text="Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc." action={<Button onClick={() => { setSp(new URLSearchParams(), { replace: true }); setKw(""); }}>Xóa bộ lọc</Button>} />
        ) : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shown.map((c) => <CompanyCard key={c.id} company={c} openJobs={open(c.id)} />)}</div><Pagination page={page} pages={pages} onChange={(p) => { set({ page: String(p) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></>}
      </div>
    </div>
  );
}
export { MapPin };
