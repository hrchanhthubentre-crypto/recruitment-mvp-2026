import { ArrowLeft, Eye, FlaskConical, Percent, Users, CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { BarChart, HBars, LineChart, shortDate } from "@/components/ui/chart";
import { AppStatusBadge, EmptyState, ErrorState, JobStatusBadge, PageHeader, Skeleton, Stat, APP_STATUS } from "@/components/shared/common";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { series, sum, viewsTotal } from "@/lib/stats";
import { fmtDate, relTime, salaryText } from "@/lib/utils";

export default function JobStats() {
  const { id } = useParams(); const { jobs, applications, company } = useStore(); const { loading, error, retry } = useFakeLoad(450); const [days, setDays] = useState(14);
  const job = jobs.find((j) => j.id === id && j.companyId === company?.id);
  const apps = useMemo(() => applications.filter((a) => a.jobId === id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)), [applications, id]);
  const data = useMemo(() => (job ? series([job], applications, days) : []), [job, applications, days]);
  if (!job) return <EmptyState title="Không tìm thấy tin tuyển dụng" text="Tin không tồn tại hoặc không thuộc doanh nghiệp của bạn." action={<Link to="/nha-tuyen-dung/tin-tuyen-dung"><Button>Về danh sách tin</Button></Link>} />;
  const views = sum(data.map((d) => d.views)), applies = sum(data.map((d) => d.applies));
  const funnel = (["new", "reviewing", "interview", "closed"] as const).map((s) => ({ label: APP_STATUS[s].label, value: apps.filter((a) => a.status === s).length }));
  return (
    <div>
      <PageHeader title="Hiệu quả tin tuyển dụng" desc={job.title} back={<Link to="/nha-tuyen-dung/tin-tuyen-dung" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" />Danh sách tin</Link>}
        actions={<label className="flex items-center gap-2 text-sm"><span className="text-ink-soft">Khoảng thời gian</span><Select aria-label="Khoảng thời gian" className="h-10 w-40" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={7}>7 ngày qua</option><option value={14}>14 ngày qua</option><option value={30}>30 ngày qua</option></Select></label>} />
      <p className="mb-5 flex items-start gap-2 rounded-ctl bg-info-bg p-3 text-[13px] text-info"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />Lượt xem là số liệu mô phỏng sinh từ mã tin. Lượt ứng tuyển lấy từ danh sách hồ sơ thật trong dữ liệu mẫu.</p>
      <Card className="mb-6"><div className="flex flex-wrap items-center gap-x-6 gap-y-2"><JobStatusBadge s={job.status} /><span className="text-sm text-ink-soft">{job.location} · {salaryText(job.salaryMin, job.salaryMax)}</span><span className="inline-flex items-center gap-1.5 text-sm text-ink-soft"><CalendarClock className="h-4 w-4" />Đăng {fmtDate(job.postedAt)} · hạn {fmtDate(job.deadline)}</span>
        {job.status === "approved" && <Link to={`/viec-lam/${job.id}`} className="ml-auto text-sm font-semibold text-gold-ink hover:underline">Xem tin công khai →</Link>}</div></Card>
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : (<>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<Eye className="h-5 w-5" />} label={`Lượt xem (${days} ngày)`} value={views} hint={`Tổng từ khi đăng: ${viewsTotal(job)}`} />
          <Stat icon={<Users className="h-5 w-5" />} label={`Ứng tuyển (${days} ngày)`} value={applies} hint={`Tổng hồ sơ: ${apps.length}`} />
          <Stat icon={<Percent className="h-5 w-5" />} label="Tỷ lệ ứng tuyển / xem" value={views ? `${((applies / views) * 100).toFixed(1)}%` : "—"} />
          <Stat icon={<Users className="h-5 w-5" />} label="Đang chờ xử lý" value={apps.filter((a) => a.status === "new").length} hint="Hồ sơ mới nhận" />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card><h2 className="mb-3 font-semibold">Lượt xem theo ngày</h2><LineChart label="Biểu đồ lượt xem theo ngày" unit="lượt xem" data={data.map((d) => ({ label: shortDate(d.date), value: d.views }))} /></Card>
          <Card><h2 className="mb-3 font-semibold">Hồ sơ ứng tuyển theo ngày</h2><BarChart label="Biểu đồ hồ sơ ứng tuyển theo ngày" unit="hồ sơ" data={data.map((d) => ({ label: shortDate(d.date), value: d.applies }))} /></Card>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <Card><h2 className="mb-4 font-semibold">Hồ sơ theo giai đoạn</h2><HBars unit="hồ sơ" rows={funnel} /></Card>
          <Card><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Ứng viên của tin này</h2><Link to={`/nha-tuyen-dung/ung-vien?job=${job.id}`} className="text-sm font-medium text-gold-ink hover:underline">Quản lý tất cả</Link></div>
            {apps.length === 0 ? <p className="py-6 text-center text-sm text-ink-mute">Chưa có hồ sơ nào cho tin này.</p> : <ul className="divide-y divide-line-soft">{apps.slice(0, 6).map((a) => (
              <li key={a.id}><Link to={`/nha-tuyen-dung/ung-vien/${a.id}`} className="flex items-center gap-3 rounded-ctl px-1 py-3 hover:bg-butter-soft"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-butter text-sm font-bold text-gold-ink">{a.name.split(" ").slice(-1)[0][0]}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.name}</p><p className="truncate text-xs text-ink-soft">{a.headline} · {relTime(a.appliedAt)}</p></div><AppStatusBadge s={a.status} /></Link></li>))}</ul>}</Card>
        </div></>)}
    </div>
  );
}
