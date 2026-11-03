import { CalendarDays, ChevronDown, Search, Users, StickyNote } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Menu, MenuContent, MenuItem, MenuTrigger, Tabs, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { APP_STATUS, AppStatusBadge, EmptyState, ErrorState, ListSkeleton, PageHeader, Pagination } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { matches, relTime } from "@/lib/utils";
import type { AppStatus, Application } from "@/lib/types";

const ORDER: AppStatus[] = ["new", "reviewing", "interview", "closed"]; const PER = 10;

export default function Applicants() {
  const { applications, jobs, company, setAppStatus } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [sp, setSp] = useSearchParams(); const jobId = sp.get("job") ?? ""; const [q, setQ] = useState(""); const [tab, setTab] = useState("all"); const [page, setPage] = useState(1);
  const mineJobs = useMemo(() => jobs.filter((j) => j.companyId === company?.id && j.status !== "draft"), [jobs, company]);
  const ids = new Set(jobs.filter((j) => j.companyId === company?.id).map((j) => j.id));
  const all = applications.filter((a) => ids.has(a.jobId) && (!jobId || a.jobId === jobId) && (!q || matches(`${a.name} ${a.email} ${a.headline} ${a.skills.join(" ")}`, q))).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const list = all.filter((a) => tab === "all" || a.status === tab); const pages = Math.max(1, Math.ceil(list.length / PER)); const cur = Math.min(page, pages); const shown = list.slice((cur - 1) * PER, cur * PER);
  const title = (a: Application) => jobs.find((j) => j.id === a.jobId)?.title ?? "—";
  const change = async (a: Application, s: AppStatus) => { if (a.status === s) return; try { await setAppStatus(a.id, s); toast.success(`Đã chuyển ${a.name} sang “${APP_STATUS[s].label}”`); } catch (e) { toast.error("Chưa cập nhật được trạng thái", { description: (e as Error).message }); } };
  const count = (s: string) => all.filter((a) => s === "all" || a.status === s).length;
  const setJob = (v: string) => { const n = new URLSearchParams(sp); v ? n.set("job", v) : n.delete("job"); setSp(n, { replace: true }); setPage(1); };
  return (
    <div>
      <PageHeader title="Danh sách ứng viên" desc="Tìm kiếm, lọc theo tin đăng và cập nhật trạng thái cho từng ứng viên." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="relative"><span className="sr-only">Tìm ứng viên</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên, email, kỹ năng…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
        <Select aria-label="Lọc theo tin tuyển dụng" value={jobId} onChange={(e) => setJob(e.target.value)}><option value="">Tất cả tin tuyển dụng</option>{mineJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</Select>
      </div>
      <Tabs value={tab} onValueChange={(t) => { setTab(t); setPage(1); }}><TabsList className="mb-5"><TabsTrigger value="all">Tất cả ({count("all")})</TabsTrigger>{ORDER.map((s) => <TabsTrigger key={s} value={s}>{APP_STATUS[s].label} ({count(s)})</TabsTrigger>)}</TabsList></Tabs>
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title={all.length === 0 && !q && !jobId ? "Chưa có ứng viên nào" : "Không tìm thấy ứng viên phù hợp"} text={all.length === 0 && !q && !jobId ? "Hồ sơ sẽ xuất hiện khi ứng viên ứng tuyển vào tin của bạn." : "Thử đổi từ khóa, tin tuyển dụng hoặc trạng thái."} action={(q || jobId || tab !== "all") ? <Button variant="outline" onClick={() => { setQ(""); setJob(""); setTab("all"); }}>Xóa bộ lọc</Button> : undefined} />
      ) : (<>
        <ul className="space-y-3">{shown.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-butter font-bold text-gold-ink">{a.name.split(" ").slice(-1)[0][0]}</span>
              <div className="min-w-0"><Link to={`/nha-tuyen-dung/ung-vien/${a.id}`} className="font-semibold hover:text-gold-ink">{a.name}</Link><p className="truncate text-sm text-ink-soft">{a.headline} · {a.years > 0 ? `${a.years} năm KN` : "Chưa có KN"}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] text-ink-mute"><span className="truncate">Ứng tuyển: {title(a)}</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{relTime(a.appliedAt)}</span>{a.note && <span className="inline-flex items-center gap-1 text-gold-ink"><StickyNote className="h-3 w-3" />Có ghi chú</span>}</p></div></div>
            <div className="flex items-center gap-2">
              <Menu><MenuTrigger asChild><Button variant="outline" size="sm" aria-label={`Đổi trạng thái của ${a.name}`}><AppStatusBadge s={a.status} /><ChevronDown className="h-4 w-4" /></Button></MenuTrigger>
                <MenuContent>{ORDER.map((s) => <MenuItem key={s} disabled={s === a.status} onSelect={() => change(a, s)}>{APP_STATUS[s].label}</MenuItem>)}</MenuContent></Menu>
              <Link to={`/nha-tuyen-dung/ung-vien/${a.id}`}><Button size="sm" variant="soft">Xem hồ sơ</Button></Link>
            </div></li>))}</ul>
        <Pagination page={cur} pages={pages} onChange={setPage} /></>)}
    </div>
  );
}
