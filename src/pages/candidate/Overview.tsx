import { ArrowRight, Bell, Bookmark, CalendarCheck, Send, Sparkles, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppStatusBadge, EmptyState, ErrorState, PageHeader, Skeleton, Stat } from "@/components/shared/common";
import { JobCard } from "@/components/shared/job";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, profileCompletion, recommend, relTime } from "@/lib/utils";

export default function Overview() {
  const { profile, user, savedIds, applications, jobs, companies, myNotifications } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  if (!profile || !user) return null;
  const mine = applications.filter((a) => a.candidateId === user.id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const pct = profileCompletion(profile); const unread = myNotifications.filter((n) => !n.read);
  const recs = recommend(profile, jobs.filter((j) => companies.find((c) => c.id === j.companyId)?.status === "approved"), mine.map((a) => a.jobId));
  const missing = [!profile.phone && "số điện thoại", !profile.summary && "giới thiệu bản thân", !profile.cv && "CV", !profile.skills.length && "kỹ năng", !profile.desiredTitle && "vị trí mong muốn"].filter(Boolean) as string[];
  const R = 34, C = 2 * Math.PI * R;
  return (
    <div>
      <PageHeader title={`Xin chào, ${profile.fullName.split(" ").slice(-1)[0]}`} desc="Tổng quan hoạt động tìm việc của bạn." actions={<Link to="/viec-lam"><Button>Tìm việc làm</Button></Link>} />
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="space-y-4"><Skeleton className="h-36" /><div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div></div> : (<>
        <div className="mb-6 flex flex-col gap-5 rounded-card bg-butter p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="relative h-20 w-20 shrink-0" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Mức hoàn thiện hồ sơ">
            <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90"><circle cx="40" cy="40" r={R} fill="none" stroke="#fffcf3" strokeWidth="8" /><circle cx="40" cy="40" r={R} fill="none" stroke="#30343b" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} /></svg>
            <span className="absolute inset-0 grid place-items-center text-lg font-bold">{pct}%</span></div>
          <div className="min-w-0 flex-1"><h2 className="text-lg font-bold">Hồ sơ của bạn đã hoàn thiện {pct}%</h2><p className="mt-1 text-sm text-ink-soft">{missing.length ? `Bổ sung ${missing.join(", ")} để nhà tuyển dụng hiểu rõ hơn về bạn.` : "Hồ sơ đầy đủ. Bạn sẵn sàng để ứng tuyển."}</p></div>
          <Link to="/ung-vien/ho-so"><Button variant="dark"><UserRoundCheck className="h-4 w-4" />Cập nhật hồ sơ</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/ung-vien/da-luu"><Stat icon={<Bookmark className="h-5 w-5" />} label="Việc đã lưu" value={savedIds.length} /></Link>
          <Link to="/ung-vien/da-ung-tuyen"><Stat icon={<Send className="h-5 w-5" />} label="Hồ sơ đã ứng tuyển" value={mine.length} /></Link>
          <Link to="/ung-vien/da-ung-tuyen"><Stat icon={<CalendarCheck className="h-5 w-5" />} label="Lời mời phỏng vấn" value={mine.filter((a) => a.status === "interview").length} /></Link>
          <Link to="/ung-vien/tai-khoan?tab=notifications"><Stat icon={<Bell className="h-5 w-5" />} label="Thông báo chưa đọc" value={unread.length} /></Link>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <section aria-labelledby="h-rec"><div className="mb-4 flex items-center justify-between"><h2 id="h-rec" className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-gold-ink" />Gợi ý việc làm cho bạn</h2><span className="text-xs text-ink-mute">Gợi ý mẫu theo hồ sơ</span></div>
            {recs.length ? <div className="space-y-3">{recs.map(({ j }) => <JobCard key={j.id} job={j} company={companies.find((c) => c.id === j.companyId)} compact />)}</div> : <EmptyState title="Chưa có gợi ý" text="Cập nhật vị trí mong muốn để nhận gợi ý phù hợp." />}</section>
          <div className="space-y-6">
            <Card><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Hồ sơ gần đây</h2><Link to="/ung-vien/da-ung-tuyen" className="flex items-center gap-1 text-sm font-medium text-gold-ink hover:underline">Tất cả<ArrowRight className="h-3.5 w-3.5" /></Link></div>
              {mine.length === 0 ? <p className="py-4 text-sm text-ink-mute">Bạn chưa ứng tuyển vị trí nào.</p> : <ul className="divide-y divide-line-soft">{mine.slice(0, 4).map((a) => <li key={a.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{jobs.find((j) => j.id === a.jobId)?.title}</p><p className="text-xs text-ink-mute">{fmtDate(a.appliedAt)}</p></div><AppStatusBadge s={a.status} /></li>)}</ul>}</Card>
            <Card><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Thông báo mới</h2><Link to="/ung-vien/tai-khoan?tab=notifications" className="flex items-center gap-1 text-sm font-medium text-gold-ink hover:underline">Xem<ArrowRight className="h-3.5 w-3.5" /></Link></div>
              <ul className="space-y-3">{myNotifications.slice(0, 3).map((n) => <li key={n.id} className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-gold"}`} /><div><p className="text-sm font-medium leading-snug">{n.title}</p><p className="text-xs text-ink-mute">{relTime(n.at)}</p></div></li>)}</ul></Card>
          </div></div></>)}
    </div>
  );
}
