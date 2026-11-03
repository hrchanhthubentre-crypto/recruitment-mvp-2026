import { ClipboardList, Eye, FlaskConical, Percent, Send, Briefcase } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Select } from "@/components/ui/form";
import { BarChart, HBars, LineChart, shortDate } from "@/components/ui/chart";
import { EmptyState, ErrorState, PageHeader, Skeleton, Stat, APP_STATUS } from "@/components/shared/common";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { lastDays, series, sum, viewsOn } from "@/lib/stats";

export default function Reports() {
  const { jobs, applications, company } = useStore(); const { loading, error, retry } = useFakeLoad(450); const [days, setDays] = useState(30); const [metric, setMetric] = useState<"views" | "applies">("applies");
  const mine = useMemo(() => jobs.filter((j) => j.companyId === company?.id), [jobs, company]);
  const ids = new Set(mine.map((j) => j.id)); const dates = lastDays(days); const from = dates[0];
  const data = useMemo(() => series(mine, applications, days), [mine, applications, days]);
  const inRange = applications.filter((a) => ids.has(a.jobId) && a.appliedAt >= from);
  const views = sum(data.map((d) => d.views));
  const perJob = mine.map((j) => ({ j, v: sum(dates.map((d) => viewsOn(j, d))), a: inRange.filter((x) => x.jobId === j.id).length })).filter((r) => r.v || r.a).sort((x, y) => y.a - x.a || y.v - x.v);
  const funnel = (["new", "reviewing", "interview", "closed"] as const).map((s) => ({ label: APP_STATUS[s].label, value: inRange.filter((a) => a.status === s).length }));
  const byStatus = (s: string) => mine.filter((j) => j.status === s).length;
  return (
    <div>
      <PageHeader title="Báo cáo tuyển dụng" desc="Tổng hợp tin đăng, lượt xem và hồ sơ ứng tuyển theo khoảng thời gian." actions={<label className="flex items-center gap-2 text-sm"><span className="text-ink-soft">Khoảng thời gian</span><Select aria-label="Khoảng thời gian báo cáo" className="h-10 w-40" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={7}>7 ngày qua</option><option value={30}>30 ngày qua</option><option value={90}>90 ngày qua</option></Select></label>} />
      <p className="mb-5 flex items-start gap-2 rounded-ctl bg-info-bg p-3 text-[13px] text-info"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />Số liệu mô phỏng: lượt xem sinh từ mã tin; tin đăng và hồ sơ lấy từ cùng dữ liệu mẫu với các màn hình khác.</p>
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div> : mine.length === 0 ? <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="Chưa có dữ liệu báo cáo" text="Đăng tin tuyển dụng để bắt đầu theo dõi hiệu quả." action={<Link to="/nha-tuyen-dung/tin/moi" className="font-semibold text-gold-ink hover:underline">Tạo tin mới →</Link>} /> : (<>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<ClipboardList className="h-5 w-5" />} label="Tin đăng" value={mine.length} hint={`${byStatus("approved")} đang hiển thị · ${byStatus("pending")} chờ duyệt · ${byStatus("draft")} nháp`} />
          <Stat icon={<Send className="h-5 w-5" />} label={`Hồ sơ (${days} ngày)`} value={inRange.length} hint={`Tổng tất cả: ${applications.filter((a) => ids.has(a.jobId)).length}`} />
          <Stat icon={<Eye className="h-5 w-5" />} label={`Lượt xem (${days} ngày)`} value={views.toLocaleString("vi-VN")} />
          <Stat icon={<Percent className="h-5 w-5" />} label="Tỷ lệ ứng tuyển / xem" value={views ? `${((inRange.length / views) * 100).toFixed(1)}%` : "—"} />
        </div>
        <Card className="mt-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Xu hướng theo ngày</h2>
          <div role="group" aria-label="Chọn chỉ số" className="flex gap-1 rounded-xl bg-butter p-1">{([["applies", "Hồ sơ ứng tuyển"], ["views", "Lượt xem"]] as const).map(([k, l]) => <button key={k} aria-pressed={metric === k} onClick={() => setMetric(k)} className={`rounded-lg px-3.5 py-1.5 text-sm font-medium ${metric === k ? "bg-paper font-semibold shadow-sm" : "text-ink-soft"}`}>{l}</button>)}</div></div>
          {metric === "applies" ? <BarChart label="Hồ sơ ứng tuyển theo ngày" unit="hồ sơ" data={data.map((d) => ({ label: shortDate(d.date), value: d.applies }))} /> : <LineChart label="Lượt xem theo ngày" unit="lượt xem" data={data.map((d) => ({ label: shortDate(d.date), value: d.views }))} />}</Card>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card><h2 className="mb-4 flex items-center gap-2 font-semibold"><Briefcase className="h-4 w-4" />Hồ sơ theo vị trí</h2>
            {perJob.length === 0 ? <p className="py-6 text-center text-sm text-ink-mute">Chưa có hoạt động trong khoảng thời gian này.</p> : <HBars unit="hồ sơ" rows={perJob.slice(0, 7).map(({ j, v, a }) => ({ label: j.title, value: a, sub: `${v} lượt xem · ${v ? ((a / v) * 100).toFixed(1) : 0}% chuyển đổi` }))} />}</Card>
          <Card><h2 className="mb-4 font-semibold">Tình trạng hồ sơ trong kỳ</h2><HBars unit="hồ sơ" rows={funnel} /></Card>
        </div></>)}
    </div>
  );
}
