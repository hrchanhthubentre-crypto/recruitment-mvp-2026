import { Bookmark, BriefcaseBusiness, CalendarClock, Clock, MapPin, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, daysLeft, fmtDate, relTime, salaryText } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Company, Job } from "@/lib/types";
import { Badge, CompanyLogo } from "./common";

/** Hành vi lưu tin dùng chung — khách được nhắc đăng nhập, vai trò khác được báo rõ. */
export function useSave() {
  const { role, savedIds, toggleSave, switchRole } = useStore();
  const nav = useNavigate();
  return {
    isSaved: (id: string) => savedIds.includes(id),
    toggle: (id: string) => {
      if (role === "candidate") { const was = savedIds.includes(id); toggleSave(id); toast.success(was ? "Đã bỏ lưu tin" : "Đã lưu tin vào danh sách của bạn"); return; }
      if (role === "guest") toast("Đăng nhập để lưu tin", { description: "Dùng chế độ ứng viên mô phỏng để trải nghiệm.", action: { label: "Đăng nhập", onClick: () => nav("/dang-nhap") }, cancel: { label: "Vào bằng ứng viên", onClick: () => { switchRole("candidate"); toast.success("Đang xem với vai trò Ứng viên (mô phỏng)"); } } });
      else toast.info("Chỉ tài khoản ứng viên mới lưu được tin.");
    },
  };
}

export function SaveButton({ jobId, className, label }: { jobId: string; className?: string; label?: boolean }) {
  const { isSaved, toggle } = useSave(); const s = isSaved(jobId);
  return (
    <button type="button" aria-pressed={s} aria-label={s ? "Bỏ lưu tin" : "Lưu tin"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(jobId); }}
      className={cn("inline-flex items-center justify-center gap-2 rounded-ctl border text-sm font-semibold transition-colors", label ? "h-12 px-4" : "h-10 w-10", s ? "border-gold bg-butter text-gold-ink" : "border-line bg-paper text-ink-soft hover:border-gold hover:text-ink", className)}>
      <Bookmark className={cn("h-[18px] w-[18px]", s && "fill-current")} />{label && (s ? "Đã lưu" : "Lưu tin")}
    </button>
  );
}

export function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-ink-mute">{icon}{children}</span>;
}

export function JobCard({ job, company, compact }: { job: Job; company?: Company; compact?: boolean }) {
  const dl = daysLeft(job.deadline);
  return (
    <article className="group relative flex gap-4 rounded-card border border-line bg-paper p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-pop sm:p-5">
      <CompanyLogo name={company?.name ?? "?"} tone={company?.tone} size={compact ? 44 : 52} />
      <div className="min-w-0 flex-1">
        <h3 className="pr-12 text-base font-semibold leading-snug">
          <Link to={`/viec-lam/${job.id}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-gold-ink focus-visible:after:rounded-card">{job.title}</Link>
        </h3>
        <p className="mt-0.5 truncate text-sm text-ink-soft">{company?.name}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Meta icon={<Wallet />}><span className="font-semibold text-ink">{salaryText(job.salaryMin, job.salaryMax)}</span></Meta>
          <Meta icon={<MapPin />}>{job.location}</Meta>
          {!compact && <Meta icon={<BriefcaseBusiness />}>{job.experience}</Meta>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="gold">{job.type}</Badge>
          {dl >= 0 && dl <= 7 && <Badge tone="bad"><Clock className="h-3 w-3" />Còn {dl} ngày</Badge>}
          <span className="text-xs text-ink-mute">{relTime(job.postedAt)}</span>
        </div>
      </div>
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4"><SaveButton jobId={job.id} /></div>
    </article>
  );
}

/** Nội dung tin tuyển dụng dùng cho trang chi tiết và cho “Xem trước” của nhà tuyển dụng / quản trị viên. */
export function JobBody({ job }: { job: Job }) {
  const S = ({ t, items }: { t: string; items: string[] }) => (
    <section className="mt-7 first:mt-0"><h3 className="mb-3 text-lg font-semibold">{t}</h3>
      <ul className="space-y-2.5">{items.filter(Boolean).map((x, i) => <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{x}</li>)}</ul></section>
  );
  return <div><S t="Mô tả công việc" items={job.description} /><S t="Yêu cầu ứng viên" items={job.requirements} /><S t="Quyền lợi" items={job.benefits} /></div>;
}

export function JobPreview({ job, company }: { job: Job; company?: Company }) {
  return (
    <div>
      <div className="flex gap-4">
        <CompanyLogo name={company?.name ?? "?"} tone={company?.tone} size={56} />
        <div><h2 className="text-xl font-bold leading-snug">{job.title || "(Chưa có tiêu đề)"}</h2><p className="text-sm text-ink-soft">{company?.name}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-card bg-butter-soft p-4">
        <Meta icon={<Wallet />}><b className="text-ink">{salaryText(job.salaryMin, job.salaryMax)}</b></Meta>
        <Meta icon={<MapPin />}>{job.location || "—"}</Meta>
        <Meta icon={<BriefcaseBusiness />}>{job.experience || "—"}</Meta>
        <Meta icon={<CalendarClock />}>Hạn nộp: {job.deadline ? fmtDate(job.deadline) : "—"}</Meta>
      </div>
      <div className="mt-6"><JobBody job={job} /></div>
    </div>
  );
}
export { Button };
