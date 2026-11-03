import { ArrowRight, ClipboardList, Clock3, Eye, FilePlus2, Inbox, Activity as ActIcon, Send, UserPlus, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppStatusBadge, ErrorState, PageHeader, Skeleton, Stat, EmptyState } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { relTime } from "@/lib/utils";

export default function Dashboard() {
  const { company, jobs, applications, activity, user } = useStore(); const nav = useNavigate(); const { loading, error, retry } = useFakeLoad(400);
  const mine = jobs.filter((j) => j.companyId === company?.id); const ids = new Set(mine.map((j) => j.id));
  const apps = applications.filter((a) => ids.has(a.jobId)).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const kinds = { apply: <UserPlus />, job: <ClipboardList />, system: <ShieldCheck /> };
  return (
    <div>
      <PageHeader title={`Xin chào, ${user?.name.split(" ").slice(-1)[0]}`} desc={`Tổng quan tuyển dụng của ${company?.name}.`}
        actions={<><Button variant="outline" onClick={() => nav("/nha-tuyen-dung/ung-vien")}><Inbox className="h-4 w-4" />Xem ứng viên</Button><Button onClick={() => nav("/nha-tuyen-dung/tin-tuyen-dung?new=1")}><FilePlus2 className="h-4 w-4" />Đăng tin mới</Button></>} />
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<ClipboardList className="h-5 w-5" />} label="Tổng tin tuyển dụng" value={mine.length} hint="Gồm cả bản nháp và tin đã đóng" />
            <Stat icon={<Eye className="h-5 w-5" />} label="Tin đang hiển thị" value={mine.filter((j) => j.status === "approved").length} hint="Ứng viên có thể nhìn thấy" />
            <Stat icon={<Clock3 className="h-5 w-5" />} label="Tin chờ duyệt" value={mine.filter((j) => j.status === "pending").length} hint="Đang chờ quản trị viên" />
            <Stat icon={<Send className="h-5 w-5" />} label="Hồ sơ ứng viên mới" value={apps.filter((a) => a.status === "new").length} hint="Chưa được xem xét" />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-card border border-line bg-paper p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Hồ sơ mới nhất</h2><Link to="/nha-tuyen-dung/ung-vien" className="flex items-center gap-1 text-sm font-medium text-gold-ink hover:underline">Xem tất cả<ArrowRight className="h-3.5 w-3.5" /></Link></div>
              {apps.length === 0 ? <EmptyState title="Chưa có hồ sơ ứng tuyển" text="Khi có ứng viên nộp hồ sơ, bạn sẽ thấy tại đây." /> :
                <ul className="divide-y divide-line-soft">{apps.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-butter text-sm font-bold text-gold-ink">{a.name.split(" ").slice(-1)[0][0]}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.name}</p><p className="truncate text-[13px] text-ink-soft">{jobs.find((j) => j.id === a.jobId)?.title}</p></div>
                    <div className="text-right"><AppStatusBadge s={a.status} /><p className="mt-1 text-xs text-ink-mute">{relTime(a.appliedAt)}</p></div></li>))}</ul>}
            </section>
            <section className="rounded-card border border-line bg-paper p-5 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 font-semibold"><ActIcon className="h-4 w-4 text-ink-mute" />Hoạt động gần đây</h2>
              <ul className="space-y-4">{activity.slice(0, 7).map((x) => (
                <li key={x.id} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-butter text-gold-ink [&>svg]:h-4 [&>svg]:w-4">{kinds[x.kind]}</span><div><p className="text-sm leading-snug">{x.text}</p><p className="mt-0.5 text-xs text-ink-mute">{relTime(x.at)}</p></div></li>))}</ul>
            </section>
          </div>
        </>)}
    </div>
  );
}
