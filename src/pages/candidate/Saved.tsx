import { Bookmark, Eye, MapPin, Wallet, BookmarkX, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { CompanyLogo, EmptyState, ErrorState, ListSkeleton, PageHeader, Badge } from "@/components/shared/common";
import { Meta } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { daysLeft, fmtDate, matches, salaryText } from "@/lib/utils";

export default function Saved() {
  const { savedIds, jobs, companies, toggleSave } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [sort, setSort] = useState("");
  const all = savedIds.map((id) => jobs.find((j) => j.id === id)).filter(Boolean) as typeof jobs;
  const items = all.filter((j) => (!cat || j.category === cat) && (!q || matches(`${j.title} ${companies.find((c) => c.id === j.companyId)?.name}`, q))).sort((a, b) => sort === "salary" ? b.salaryMax - a.salaryMax : sort === "deadline" ? a.deadline.localeCompare(b.deadline) : 0);
  const cats = [...new Set(all.map((j) => j.category))];
  const unsave = (id: string, title: string) => { toggleSave(id); toast(`Đã bỏ lưu “${title}”`, { action: { label: "Hoàn tác", onClick: () => toggleSave(id) } }); };
  return (
    <div>
      <PageHeader title="Việc làm đã lưu" desc="Những tin bạn quan tâm, sẵn sàng để quay lại ứng tuyển." />
      {all.length > 0 && <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_180px]">
        <label className="relative"><span className="sr-only">Tìm trong việc đã lưu</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm trong việc đã lưu…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <Select aria-label="Lọc theo ngành" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Mọi ngành nghề</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select aria-label="Sắp xếp" value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Lưu gần đây</option><option value="salary">Lương cao nhất</option><option value="deadline">Sắp hết hạn</option></Select></div>}
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={3} /> : all.length > 0 && items.length === 0 ? <EmptyState title="Không có tin phù hợp bộ lọc" action={<Button variant="outline" onClick={() => { setQ(""); setCat(""); }}>Xóa bộ lọc</Button>} /> : items.length === 0 ? (
        <EmptyState icon={<Bookmark className="h-6 w-6" />} title="Bạn chưa lưu việc làm nào" text="Bấm biểu tượng đánh dấu trên tin tuyển dụng để lưu lại và xem sau." action={<Link to="/viec-lam"><Button>Tìm việc làm</Button></Link>} />
      ) : (
        <ul className="space-y-3">
          {items.map((j) => { const co = companies.find((c) => c.id === j.companyId); const live = j.status === "approved"; const dl = daysLeft(j.deadline);
            return (
              <li key={j.id} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 flex-1 gap-4"><CompanyLogo name={co?.name ?? "?"} tone={co?.tone} size={48} />
                  <div className="min-w-0"><h3 className="font-semibold leading-snug">{j.title}</h3><p className="text-sm text-ink-soft">{co?.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1"><Meta icon={<Wallet />}>{salaryText(j.salaryMin, j.salaryMax)}</Meta><Meta icon={<MapPin />}>{j.location}</Meta>
                      {live ? <span className="text-[13px] text-ink-mute">Hạn nộp {fmtDate(j.deadline)}{dl >= 0 && dl <= 7 ? ` · còn ${dl} ngày` : ""}</span> : <Badge tone="neutral">Tin đã ngừng hiển thị</Badge>}</div></div></div>
                <div className="flex shrink-0 gap-2">
                  {live && <Link to={`/viec-lam/${j.id}`} className="flex-1 sm:flex-none"><Button variant="soft" className="w-full"><Eye className="h-4 w-4" />Xem tin</Button></Link>}
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => unsave(j.id, j.title)}><BookmarkX className="h-4 w-4" />Bỏ lưu</Button>
                </div>
              </li>); })}
        </ul>)}
    </div>
  );
}
