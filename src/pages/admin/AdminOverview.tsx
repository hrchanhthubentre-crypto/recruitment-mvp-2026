import { ArrowRight, BadgeCheck, Building2, ClipboardList, Flag, FlaskConical, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, HBars, LineChart, shortDate } from "@/components/ui/chart";
import { CompanyLogo, ErrorState, PageHeader, Skeleton, Stat } from "@/components/shared/common";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { series, sum } from "@/lib/stats";
import { relTime } from "@/lib/utils";

export default function AdminOverview() {
  const { users, companies, jobs, applications, reports, modLog } = useStore(); const { loading, error, retry } = useFakeLoad(450); const [m, setM] = useState<"applies" | "views">("applies");
  const cands = users.filter((u) => u.role === "candidate"); const pendJobs = jobs.filter((j) => j.status === "pending"); const pendCos = companies.filter((c) => c.status === "pending"); const openReports = reports.filter((r) => r.status === "open");
  const live = jobs.filter((j) => j.status === "approved"); const data = series(live, applications, 14);
  const cats = Object.entries(live.reduce<Record<string, number>>((a, j) => ({ ...a, [j.category]: (a[j.category] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <div>
      <PageHeader title="Tổng quan quản trị" desc="Tình hình hệ thống và các việc cần xử lý." />
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div> : (<>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<Users className="h-5 w-5" />} label="Ứng viên" value={cands.length} hint={`${cands.filter((u) => u.status === "locked").length} tài khoản bị khóa`} />
          <Stat icon={<Building2 className="h-5 w-5" />} label="Doanh nghiệp" value={companies.length} hint={`${companies.filter((c) => c.status === "approved").length} đã duyệt`} />
          <Stat icon={<ClipboardList className="h-5 w-5" />} label="Tin tuyển dụng" value={jobs.length} hint={`${live.length} đang hiển thị`} />
          <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Tin chờ duyệt" value={pendJobs.length} hint={`${pendCos.length} doanh nghiệp chờ duyệt`} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[[`/quan-tri/kiem-duyet`, <ShieldCheck key="a" />, `${pendJobs.length} tin chờ duyệt`], [`/quan-tri/doanh-nghiep`, <BadgeCheck key="b" />, `${pendCos.length} doanh nghiệp chờ duyệt`], [`/quan-tri/nguoi-dung`, <Flag key="c" />, `${openReports.length} báo cáo vi phạm chưa xử lý`]].map(([to, ic, t]) => (
            <Link key={to as string} to={to as string} className="group flex items-center gap-3 rounded-card border border-gold bg-butter p-4 transition-colors hover:bg-gold/50"><span className="grid h-10 w-10 place-items-center rounded-ctl bg-cream [&>svg]:h-5 [&>svg]:w-5">{ic}</span><span className="flex-1 font-semibold">{t}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>))}
        </div>
        <Card className="mt-6"><div className="mb-1 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Hoạt động 14 ngày qua</h2>
          <div role="group" aria-label="Chỉ số" className="flex gap-1 rounded-xl bg-butter p-1">{([["applies", "Hồ sơ ứng tuyển"], ["views", "Lượt xem tin"]] as const).map(([k, l]) => <button key={k} aria-pressed={m === k} onClick={() => setM(k)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${m === k ? "bg-paper font-semibold shadow-sm" : "text-ink-soft"}`}>{l}</button>)}</div></div>
          <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-mute"><FlaskConical className="h-3.5 w-3.5" />Thống kê mô phỏng · tổng {sum(data.map((d) => (m === "applies" ? d.applies : d.views)))} {m === "applies" ? "hồ sơ" : "lượt xem"}</p>
          {m === "applies" ? <BarChart label="Hồ sơ ứng tuyển toàn hệ thống" unit="hồ sơ" data={data.map((d) => ({ label: shortDate(d.date), value: d.applies }))} /> : <LineChart label="Lượt xem toàn hệ thống" unit="lượt xem" data={data.map((d) => ({ label: shortDate(d.date), value: d.views }))} />}</Card>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card><h2 className="mb-4 font-semibold">Tin đang hiển thị theo ngành</h2><HBars unit="tin" rows={cats.map(([label, value]) => ({ label, value }))} /></Card>
          <Card><h2 className="mb-4 font-semibold">Hoạt động kiểm duyệt gần đây</h2>
            <ul className="space-y-3.5">{modLog.slice(0, 6).map((l) => { const j = jobs.find((x) => x.id === l.jobId); const c = companies.find((x) => x.id === j?.companyId); return (
              <li key={l.id} className="flex items-center gap-3"><CompanyLogo name={c?.name ?? "?"} tone={c?.tone} size={36} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{j?.title ?? "Tin đã xóa"}</p><p className="text-xs text-ink-mute">{{ approved: "Đã duyệt", rejected: "Đã từ chối", hidden: "Đã ẩn", restored: "Hiển thị lại" }[l.action]} · {relTime(l.at)}</p></div></li>); })}</ul></Card>
        </div></>)}
    </div>
  );
}
