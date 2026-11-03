import { ArrowLeft, CalendarDays, FileText, Mail, MapPin, Phone, Briefcase, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form";
import { APP_STATUS, AppStatusBadge, EmptyState } from "@/components/shared/common";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/utils";
import type { AppStatus } from "@/lib/types";

const ORDER: AppStatus[] = ["new", "reviewing", "interview", "closed"];
export default function ApplicantDetail() {
  const { id } = useParams(); const { applications, jobs, company, setAppStatus, setAppNote } = useStore();
  const a = applications.find((x) => x.id === id); const job = a && jobs.find((j) => j.id === a.jobId && j.companyId === company?.id);
  const [note, setNote] = useState(a?.note ?? ""); const [busy, setBusy] = useState(false); const [stBusy, setStBusy] = useState<AppStatus | "">("");
  useEffect(() => setNote(a?.note ?? ""), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!a || !job) return <EmptyState title="Không tìm thấy hồ sơ ứng viên" text="Hồ sơ không tồn tại hoặc không thuộc tin của doanh nghiệp bạn." action={<Link to="/nha-tuyen-dung/ung-vien"><Button>Về danh sách ứng viên</Button></Link>} />;
  const others = applications.filter((x) => x.id !== a.id && (x.candidateId === a.candidateId || x.email === a.email) && jobs.find((j) => j.id === x.jobId)?.companyId === company?.id);
  const change = async (s: AppStatus) => { if (s === a.status) return; setStBusy(s); try { await setAppStatus(a.id, s); toast.success(`Đã chuyển sang “${APP_STATUS[s].label}”`); } catch (e) { toast.error("Chưa cập nhật được trạng thái", { description: (e as Error).message }); } finally { setStBusy(""); } };
  const saveNote = async () => { if (note.length > 500) return void toast.error("Ghi chú tối đa 500 ký tự"); setBusy(true); try { await setAppNote(a.id, note.trim()); toast.success("Đã lưu ghi chú nội bộ"); } catch (e) { toast.error("Chưa lưu được ghi chú", { description: (e as Error).message }); } finally { setBusy(false); } };
  return (
    <div>
      <Link to="/nha-tuyen-dung/ung-vien" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" />Danh sách ứng viên</Link>
      <Card className="mb-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gold text-2xl font-bold">{a.name.split(" ").slice(-1)[0][0]}</span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{a.name}</h1><AppStatusBadge s={a.status} /></div><p className="text-ink-soft">{a.headline} · {a.years > 0 ? `${a.years} năm kinh nghiệm` : "Chưa có kinh nghiệm"}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft"><span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-ink-mute" />{a.email}</span><span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-ink-mute" />{a.phone}</span><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-ink-mute" />{a.location || "—"}</span></div></div></div>
        <div role="group" aria-label="Chuyển trạng thái tuyển dụng" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[460px]">{ORDER.map((s) => <Button key={s} size="sm" variant={a.status === s ? "dark" : "outline"} aria-pressed={a.status === s} loading={stBusy === s} onClick={() => change(s)}>{APP_STATUS[s].label}</Button>)}</div></div></Card>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card><h2 className="mb-1 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" />CV mẫu · {a.cvName}</h2><p className="mb-4 text-xs text-ink-mute">Tạo từ dữ liệu giả lập — không phải tệp thật.</p>
            <div className="rounded-card border border-line bg-white p-6 sm:p-8" aria-label="Xem trước CV mẫu"><p className="text-2xl font-bold">{a.name}</p><p className="text-ink-soft">{a.headline}</p><p className="mt-1 text-xs text-ink-mute">{a.email} · {a.phone}</p><hr className="my-5 border-line-soft" />
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold-ink">Kỹ năng</p><div className="mb-5 flex flex-wrap gap-1.5">{a.skills.map((s) => <span key={s} className="rounded bg-butter px-2.5 py-1 text-xs font-medium">{s}</span>)}</div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold-ink">Kinh nghiệm</p><p className="text-sm leading-relaxed text-ink-soft">{a.years > 0 ? `${a.years} năm kinh nghiệm trong lĩnh vực ${a.headline.toLowerCase()}, tham gia các dự án từ phân tích yêu cầu đến vận hành.` : "Ứng viên mới tốt nghiệp hoặc chưa có kinh nghiệm chính thức; có dự án cá nhân và thực tập ngắn hạn."}</p>
              <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-gold-ink">Học vấn</p><p className="text-sm text-ink-soft">Đại học chuyên ngành liên quan (trường mẫu).</p></div></Card>
          <Card><h2 className="mb-3 font-semibold">Thư giới thiệu</h2><p className="rounded-ctl bg-butter-soft p-4 text-sm leading-relaxed text-ink-soft">{a.cover || "Ứng viên không gửi thư giới thiệu."}</p></Card>
        </div>
        <div className="space-y-6">
          <Card><h2 className="mb-3 font-semibold">Vị trí ứng tuyển</h2><Link to={`/nha-tuyen-dung/tin/${job.id}/hieu-qua`} className="flex items-start gap-3 rounded-ctl bg-butter-soft p-3 hover:bg-butter"><Briefcase className="mt-0.5 h-5 w-5 text-gold-ink" /><span><span className="block font-semibold leading-snug">{job.title}</span><span className="text-sm text-ink-soft">Nộp ngày {fmtDate(a.appliedAt)}</span></span></Link>
            {others.length > 0 && <><h3 className="mb-2 mt-5 text-sm font-semibold">Còn ứng tuyển ({others.length})</h3><ul className="space-y-2">{others.map((o) => <li key={o.id}><Link to={`/nha-tuyen-dung/ung-vien/${o.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-gold-ink"><span className="truncate">{jobs.find((j) => j.id === o.jobId)?.title}</span><AppStatusBadge s={o.status} /></Link></li>)}</ul></>}</Card>
          <Card><Field label="Ghi chú nội bộ" hint={`Chỉ nhà tuyển dụng thấy · ${note.length}/500`}>{(p) => <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Đã gọi điện, hẹn phỏng vấn thứ Năm…" {...p} />}</Field>
            <div className="mt-3 flex justify-end"><Button onClick={saveNote} loading={busy} disabled={note.trim() === a.note}>Lưu ghi chú</Button></div></Card>
          <Card><h2 className="mb-4 font-semibold">Lịch sử xử lý</h2><ol>{a.timeline.map((t, i) => <li key={i} className="relative flex gap-3 pb-5 last:pb-0"><span className="relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold"><CheckCircle2 className="h-3.5 w-3.5" /></span>{i < a.timeline.length - 1 && <span aria-hidden className="absolute left-[9px] top-5 h-full w-0.5 bg-line" />}<div><p className="text-sm font-medium">{t.text}</p><p className="inline-flex items-center gap-1 text-xs text-ink-mute"><CalendarDays className="h-3 w-3" />{fmtDate(t.at)}</p></div></li>)}</ol></Card>
        </div>
      </div>
    </div>
  );
}
