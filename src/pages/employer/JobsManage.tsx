import { BarChart3, Ban, Eye, FilePlus2, MoreHorizontal, Pencil, RotateCcw, Search, Send, Trash2, ClipboardList, CalendarClock, MapPin, Wallet, Users, AlertCircle, MousePointerClick } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Menu, MenuContent, MenuItem, MenuSep, MenuTrigger, Modal } from "@/components/ui/overlay";
import { ConfirmDialog, EmptyState, ErrorState, JobStatusBadge, JOB_STATUS, ListSkeleton, PageHeader } from "@/components/shared/common";
import { JobPreview, Meta } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { viewsTotal } from "@/lib/stats";
import { fmtDate, matches, salaryText } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

export default function JobsManage() {
  const { jobs, company, applications, setJobStatus, deleteJob } = useStore(); const { loading, error, retry } = useFakeLoad(400); const nav = useNavigate();
  const [q, setQ] = useState(""); const [st, setSt] = useState<"" | JobStatus>("");
  const [preview, setPreview] = useState<Job | null>(null); const [confirm, setConfirm] = useState<{ job: Job; act: "close" | "delete" } | null>(null);
  const mine = useMemo(() => jobs.filter((j) => j.companyId === company?.id), [jobs, company]);
  const list = mine.filter((j) => (!st || j.status === st) && (!q || matches(j.title, q)));
  const run = async (fn: () => Promise<void>, ok: string) => { try { await fn(); toast.success(ok); } catch (er) { toast.error("Thao tác không thành công", { description: (er as Error).message }); } };
  const submitExisting = (j: Job) => { if (company?.status !== "approved") return void toast.error("Doanh nghiệp chưa được duyệt nên chưa thể gửi duyệt tin."); run(() => setJobStatus(j.id, "pending"), "Đã gửi duyệt tin (mô phỏng)"); };
  const statuses: JobStatus[] = ["approved", "pending", "draft", "rejected", "closed", "hidden"];
  const newBtn = <Link to="/nha-tuyen-dung/tin/moi"><Button><FilePlus2 className="h-4 w-4" />Tạo tin mới</Button></Link>;
  return (
    <div>
      <PageHeader title="Tin tuyển dụng" desc="Tạo, chỉnh sửa và theo dõi trạng thái các tin của doanh nghiệp." actions={newBtn} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Tìm tin tuyển dụng</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tiêu đề…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <Select aria-label="Lọc theo trạng thái" className="sm:w-52" value={st} onChange={(e) => setSt(e.target.value as JobStatus | "")}><option value="">Tất cả trạng thái ({mine.length})</option>{statuses.map((s) => <option key={s} value={s}>{JOB_STATUS[s].label} ({mine.filter((j) => j.status === s).length})</option>)}</Select>
      </div>
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : mine.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="Bạn chưa có tin tuyển dụng" text="Tạo tin đầu tiên để bắt đầu nhận hồ sơ." action={newBtn} />
      ) : list.length === 0 ? <EmptyState title="Không có tin phù hợp" text="Thử đổi từ khóa hoặc trạng thái lọc." action={<Button variant="outline" onClick={() => { setQ(""); setSt(""); }}>Xóa bộ lọc</Button>} /> : (
        <ul className="space-y-3">{list.map((j) => { const n = applications.filter((a) => a.jobId === j.id).length; const canEdit = j.status !== "closed" && j.status !== "hidden"; return (
          <li key={j.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold leading-snug">{j.title}</h3><JobStatusBadge s={j.status} /></div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5"><Meta icon={<MapPin />}>{j.location}</Meta><Meta icon={<Wallet />}>{salaryText(j.salaryMin, j.salaryMax)}</Meta><Meta icon={<CalendarClock />}>Hạn {fmtDate(j.deadline)}</Meta></div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm"><Link to={`/nha-tuyen-dung/ung-vien?job=${j.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1 font-medium hover:bg-gold/60"><Users className="h-3.5 w-3.5" />{n} hồ sơ</Link><span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-bg px-3 py-1 text-ink-soft"><MousePointerClick className="h-3.5 w-3.5" />{viewsTotal(j)} lượt xem (mẫu)</span></div></div>
              <div className="flex shrink-0 items-center gap-1">
                {canEdit && <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => nav(`/nha-tuyen-dung/tin/${j.id}/sua`)}><Pencil className="h-4 w-4" />Sửa</Button>}
                <Menu><MenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Thao tác với tin ${j.title}`}><MoreHorizontal className="h-5 w-5" /></Button></MenuTrigger>
                  <MenuContent>
                    {canEdit && <MenuItem icon={<Pencil className="h-4 w-4" />} onSelect={() => nav(`/nha-tuyen-dung/tin/${j.id}/sua`)}>Chỉnh sửa</MenuItem>}
                    <MenuItem icon={<Eye className="h-4 w-4" />} onSelect={() => setPreview(j)}>Xem trước</MenuItem>
                    <MenuItem icon={<BarChart3 className="h-4 w-4" />} onSelect={() => nav(`/nha-tuyen-dung/tin/${j.id}/hieu-qua`)}>Xem hiệu quả tin</MenuItem>
                    {(j.status === "draft" || j.status === "rejected") && <MenuItem icon={<Send className="h-4 w-4" />} onSelect={() => submitExisting(j)}>Gửi duyệt</MenuItem>}
                    {j.status === "closed" && <MenuItem icon={<RotateCcw className="h-4 w-4" />} onSelect={() => submitExisting(j)}>Mở lại (gửi duyệt)</MenuItem>}
                    {(j.status === "approved" || j.status === "pending") && <><MenuSep /><MenuItem danger icon={<Ban className="h-4 w-4" />} onSelect={() => setConfirm({ job: j, act: "close" })}>Đóng tin</MenuItem></>}
                    {j.status === "draft" && <><MenuSep /><MenuItem danger icon={<Trash2 className="h-4 w-4" />} onSelect={() => setConfirm({ job: j, act: "delete" })}>Xóa bản nháp</MenuItem></>}
                  </MenuContent></Menu></div>
            </div>
            {j.status === "rejected" && j.rejectReason && <p className="mt-3 flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Lý do từ chối:</b> {j.rejectReason}</span></p>}
            {j.status === "hidden" && <p className="mt-3 flex gap-2 rounded-ctl bg-info-bg p-3 text-sm text-info"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Quản trị viên đã ẩn tin:</b> {j.hiddenReason || "Tin chưa phù hợp."}</span></p>}
          </li>); })}</ul>)}
      <Modal open={!!preview} onOpenChange={(o) => !o && setPreview(null)} wide title="Xem trước tin đăng">{preview && <JobPreview job={preview} company={company ?? undefined} />}</Modal>
      <ConfirmDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} danger confirmLabel={confirm?.act === "delete" ? "Xóa bản nháp" : "Đóng tin"} title={confirm?.act === "delete" ? "Xóa bản nháp này?" : "Đóng tin tuyển dụng?"}
        text={confirm?.act === "delete" ? `Bản nháp “${confirm?.job.title}” sẽ bị xóa khỏi dữ liệu mẫu.` : `Tin “${confirm?.job.title}” sẽ ngừng hiển thị với ứng viên. Các hồ sơ đã nhận vẫn được giữ.`}
        onConfirm={async () => { const c = confirm!; await run(() => (c.act === "delete" ? deleteJob(c.job.id) : setJobStatus(c.job.id, "closed")), c.act === "delete" ? "Đã xóa bản nháp" : "Đã đóng tin tuyển dụng"); }} />
    </div>
  );
}
