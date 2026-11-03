import { CalendarDays, CheckCircle2, FileText, Phone, Send, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Drawer } from "@/components/ui/overlay";
import { AppStatusBadge, CompanyLogo, EmptyState, ErrorState, ListSkeleton, PageHeader } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, salaryText } from "@/lib/utils";
import type { AppStatus } from "@/lib/types";

const HINT: Record<AppStatus, string> = { new: "Hồ sơ đã được gửi, đang chờ nhà tuyển dụng xem.", reviewing: "Nhà tuyển dụng đang xem xét hồ sơ của bạn.", interview: "Bạn được mời phỏng vấn — nhà tuyển dụng sẽ liên hệ qua số điện thoại đã cung cấp.", closed: "Quy trình tuyển dụng cho hồ sơ này đã kết thúc." };

export default function Applications() {
  const { applications, user, jobs, companies } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [flt, setFlt] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const mine = applications.filter((a) => a.candidateId === user?.id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const list = mine.filter((a) => !flt || a.status === flt);
  const sel = mine.find((a) => a.id === open); const sj = sel && jobs.find((j) => j.id === sel.jobId); const sc = sj && companies.find((c) => c.id === sj.companyId);
  return (
    <div>
      <PageHeader title="Việc làm đã ứng tuyển" desc="Theo dõi trạng thái xử lý từng hồ sơ bạn đã gửi."
        actions={mine.length > 0 ? <label className="flex items-center gap-2 text-sm"><span className="text-ink-soft">Trạng thái</span><Select aria-label="Lọc theo trạng thái" className="h-10 w-44" value={flt} onChange={(e) => setFlt(e.target.value)}><option value="">Tất cả</option><option value="new">Mới nhận</option><option value="reviewing">Đang xem xét</option><option value="interview">Phỏng vấn</option><option value="closed">Kết thúc</option></Select></label> : undefined} />
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={3} /> : mine.length === 0 ? (
        <EmptyState icon={<Send className="h-6 w-6" />} title="Bạn chưa ứng tuyển vị trí nào" text="Khi bạn gửi hồ sơ, trạng thái xử lý sẽ hiển thị tại đây." action={<Link to="/viec-lam"><Button>Tìm việc làm</Button></Link>} />
      ) : list.length === 0 ? <EmptyState title="Không có hồ sơ ở trạng thái này" action={<Button variant="outline" onClick={() => setFlt("")}>Xem tất cả</Button>} /> : (
        <ul className="space-y-3">{list.map((a) => { const j = jobs.find((x) => x.id === a.jobId); const co = j && companies.find((c) => c.id === j.companyId);
          return (
            <li key={a.id} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 gap-4"><CompanyLogo name={co?.name ?? "?"} tone={co?.tone} size={48} />
                <div className="min-w-0"><h3 className="font-semibold leading-snug">{j?.title ?? "Tin đã bị xóa"}</h3><p className="text-sm text-ink-soft">{co?.name}</p><p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-mute"><CalendarDays className="h-3.5 w-3.5" />Nộp ngày {fmtDate(a.appliedAt)}</p></div></div>
              <div className="flex items-center justify-between gap-3 sm:justify-end"><AppStatusBadge s={a.status} /><Button variant="outline" size="sm" onClick={() => setOpen(a.id)}>Xem chi tiết</Button></div>
            </li>); })}</ul>)}

      <Drawer open={!!sel} onOpenChange={(o) => !o && setOpen(null)} title="Chi tiết hồ sơ đã nộp" description={sj ? `${sj.title} · ${sc?.name}` : undefined}>
        {sel && (<div className="space-y-6">
          <div className="rounded-card border border-line bg-butter-soft p-4"><div className="mb-2"><AppStatusBadge s={sel.status} /></div><p className="text-sm text-ink-soft">{HINT[sel.status]}</p></div>
          <section><h3 className="mb-3 font-semibold">Tiến trình</h3><ol className="space-y-0">{sel.timeline.map((t, i) => (
            <li key={i} className="relative flex gap-3 pb-5 last:pb-0"><span className="relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold"><CheckCircle2 className="h-3.5 w-3.5" /></span>{i < sel.timeline.length - 1 && <span aria-hidden className="absolute left-[9px] top-5 h-full w-0.5 bg-line" />}<div><p className="text-sm font-medium">{t.text}</p><p className="text-xs text-ink-mute">{fmtDate(t.at)}</p></div></li>))}</ol></section>
          <section className="space-y-3 text-sm"><h3 className="font-semibold">Thông tin đã gửi</h3>
            <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-ink-mute" />{sel.cvName}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-mute" />{sel.phone}</p>
            <div><p className="mb-1 text-ink-mute">Thư giới thiệu</p><p className="rounded-ctl bg-paper p-3 leading-relaxed text-ink-soft">{sel.cover || "Không có thư giới thiệu."}</p></div>
            {sj && <p className="text-ink-soft">Mức lương: <b className="text-ink">{salaryText(sj.salaryMin, sj.salaryMax)}</b> · {sj.location}</p>}</section>
          {sj?.status === "approved" && <Link to={`/viec-lam/${sj.id}`}><Button variant="soft" className="w-full"><ExternalLink className="h-4 w-4" />Xem lại tin tuyển dụng</Button></Link>}
        </div>)}
      </Drawer>
    </div>
  );
}
