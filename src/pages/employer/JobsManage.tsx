import { Ban, Eye, FilePlus2, MoreHorizontal, Pencil, RotateCcw, Search, Send, Trash2, ClipboardList, CalendarClock, MapPin, Wallet, Users, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Drawer, Menu, MenuContent, MenuItem, MenuSep, MenuTrigger, Modal } from "@/components/ui/overlay";
import { ConfirmDialog, EmptyState, ErrorState, JobStatusBadge, JOB_STATUS, ListSkeleton, PageHeader } from "@/components/shared/common";
import { JobPreview, Meta } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { daysFromNow, fmtDate, matches, salaryText, uid } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
interface Form { id: string; title: string; category: string; location: string; type: string; level: string; experience: string; negotiable: boolean; min: string; max: string; deadline: string; headcount: string; description: string; requirements: string; benefits: string; status: JobStatus }

function JobForm({ job, open, onClose }: { job: Job | null; open: boolean; onClose: () => void }) {
  const { catalogs, company, saveJob } = useStore();
  const blank = (): Form => ({ id: uid("j"), title: "", category: "", location: "", type: catalogs.types[0]?.name ?? "", level: "", experience: "", negotiable: false, min: "", max: "", deadline: daysFromNow(30), headcount: "1", description: "", requirements: "", benefits: "", status: "draft" });
  const from = (j: Job): Form => ({ id: j.id, title: j.title, category: j.category, location: j.location, type: j.type, level: j.level, experience: j.experience, negotiable: !j.salaryMin && !j.salaryMax, min: String(j.salaryMin || ""), max: String(j.salaryMax || ""), deadline: j.deadline, headcount: String(j.headcount), description: j.description.join("\n"), requirements: j.requirements.join("\n"), benefits: j.benefits.join("\n"), status: j.status });
  const [f, setF] = useState<Form>(blank); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState<"" | "draft" | "submit">(""); const [prev, setPrev] = useState(false); const [fail, setFail] = useState("");
  useEffect(() => { if (open) { setF(job ? from(job) : blank()); setE({}); setFail(""); } }, [open, job]); // eslint-disable-line react-hooks/exhaustive-deps
  const u = (k: keyof Form, v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setE((x) => ({ ...x, [k]: "" })); };
  const live = !!job && (job.status === "approved" || job.status === "pending");
  const toJob = (): Job => ({ id: f.id, title: f.title.trim(), companyId: company!.id, category: f.category, location: f.location, type: f.type, level: f.level, experience: f.experience, salaryMin: f.negotiable ? 0 : Number(f.min) || 0, salaryMax: f.negotiable ? 0 : Number(f.max) || 0,
    postedAt: job?.postedAt ?? daysFromNow(0), deadline: f.deadline, description: lines(f.description), requirements: lines(f.requirements), benefits: lines(f.benefits), status: f.status, headcount: Number(f.headcount) || 1, rejectReason: job?.rejectReason, hiddenReason: job?.hiddenReason });
  const validate = (full: boolean) => {
    const x: Record<string, string> = {};
    if (f.title.trim().length < 5) x.title = "Tiêu đề tối thiểu 5 ký tự.";
    if (full) {
      if (!f.category) x.category = "Chọn ngành nghề."; if (!f.location) x.location = "Chọn địa điểm."; if (!f.level) x.level = "Chọn cấp bậc."; if (!f.experience) x.experience = "Chọn kinh nghiệm.";
      if (!f.negotiable) { const a = Number(f.min), b = Number(f.max); if (!a || !b) x.min = "Nhập mức lương từ – đến (triệu đồng) hoặc chọn Thỏa thuận."; else if (a > b) x.min = "Mức lương tối thiểu không được lớn hơn tối đa."; }
      if (!f.deadline || f.deadline < daysFromNow(0)) x.deadline = "Hạn nộp phải từ hôm nay trở đi.";
      if (!(Number(f.headcount) >= 1)) x.headcount = "Số lượng tối thiểu là 1.";
      if (f.description.trim().length < 20) x.description = "Mô tả công việc tối thiểu 20 ký tự."; if (!lines(f.requirements).length) x.requirements = "Nhập ít nhất một yêu cầu."; if (!lines(f.benefits).length) x.benefits = "Nhập ít nhất một quyền lợi.";
    }
    setE(x); return !Object.keys(x).length;
  };
  const save = async (submit: boolean) => {
    if (!validate(submit)) { toast.error("Vui lòng kiểm tra lại các trường được đánh dấu"); return; }
    setBusy(submit ? "submit" : "draft"); setFail("");
    try { const out = await saveJob(toJob(), submit); toast.success(submit ? "Đã gửi duyệt tin (mô phỏng)" : "Đã lưu bản nháp", { description: out.title }); onClose(); }
    catch (er) { setFail((er as Error).message); toast.error(submit ? "Gửi duyệt không thành công" : "Lưu nháp không thành công"); } finally { setBusy(""); }
  };
  const opt = (k: "categories" | "locations" | "types" | "levels" | "experiences", cur: string) => catalogs[k].filter((c) => c.active || c.name === cur).map((c) => <option key={c.id}>{c.name}</option>);
  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()} title={job ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"} description={live ? "Tin đang hiển thị/chờ duyệt: sau khi lưu sẽ quay lại trạng thái chờ duyệt." : undefined} width="max-w-2xl"
        footer={<><Button variant="ghost" onClick={() => { if (validate(false) || f.title) setPrev(true); else validate(false); }}><Eye className="h-4 w-4" />Xem trước</Button>
          {!live && <Button variant="outline" loading={busy === "draft"} disabled={!!busy} onClick={() => save(false)}>Lưu nháp</Button>}
          <Button loading={busy === "submit"} disabled={!!busy} onClick={() => save(true)}><Send className="h-4 w-4" />{live ? "Lưu & gửi duyệt lại" : "Gửi duyệt"}</Button></>}>
        <form onSubmit={(ev) => ev.preventDefault()} noValidate className="space-y-5">
          {fail && <div role="alert" className="flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{fail}</div>}
          <Field label="Tiêu đề tin" required error={e.title}>{(p) => <Input value={f.title} onChange={(x) => u("title", x.target.value)} placeholder="Ví dụ: Chuyên viên kinh doanh" maxLength={100} {...p} />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ngành nghề" required error={e.category}>{(p) => <Select value={f.category} onChange={(x) => u("category", x.target.value)} {...p}><option value="">Chọn ngành</option>{opt("categories", f.category)}</Select>}</Field>
            <Field label="Địa điểm làm việc" required error={e.location}>{(p) => <Select value={f.location} onChange={(x) => u("location", x.target.value)} {...p}><option value="">Chọn địa điểm</option>{opt("locations", f.location)}</Select>}</Field>
            <Field label="Hình thức làm việc" required>{(p) => <Select value={f.type} onChange={(x) => u("type", x.target.value)} {...p}>{opt("types", f.type)}</Select>}</Field>
            <Field label="Cấp bậc" required error={e.level}>{(p) => <Select value={f.level} onChange={(x) => u("level", x.target.value)} {...p}><option value="">Chọn cấp bậc</option>{opt("levels", f.level)}</Select>}</Field>
            <Field label="Kinh nghiệm" required error={e.experience}>{(p) => <Select value={f.experience} onChange={(x) => u("experience", x.target.value)} {...p}><option value="">Chọn kinh nghiệm</option>{opt("experiences", f.experience)}</Select>}</Field>
            <Field label="Số lượng tuyển" required error={e.headcount}>{(p) => <Input type="number" min={1} value={f.headcount} onChange={(x) => u("headcount", x.target.value)} {...p} />}</Field>
          </div>
          <fieldset><legend className="mb-1.5 text-sm font-medium">Mức lương (triệu đồng/tháng)</legend>
            <div className="grid grid-cols-2 gap-3"><Input aria-label="Lương từ" type="number" min={0} placeholder="Từ" disabled={f.negotiable} value={f.min} onChange={(x) => u("min", x.target.value)} invalid={!!e.min} /><Input aria-label="Lương đến" type="number" min={0} placeholder="Đến" disabled={f.negotiable} value={f.max} onChange={(x) => u("max", x.target.value)} invalid={!!e.min} /></div>
            <Check checked={f.negotiable} onChange={(v) => u("negotiable", v)}>Lương thỏa thuận</Check>{e.min && <p role="alert" className="text-[13px] text-bad">{e.min}</p>}</fieldset>
          <Field label="Hạn nộp hồ sơ" required error={e.deadline}>{(p) => <Input type="date" min={daysFromNow(0)} value={f.deadline} onChange={(x) => u("deadline", x.target.value)} {...p} />}</Field>
          <Field label="Mô tả công việc" required error={e.description} hint="Mỗi dòng là một ý.">{(p) => <Textarea rows={5} value={f.description} onChange={(x) => u("description", x.target.value)} {...p} />}</Field>
          <Field label="Yêu cầu ứng viên" required error={e.requirements} hint="Mỗi dòng là một yêu cầu.">{(p) => <Textarea rows={4} value={f.requirements} onChange={(x) => u("requirements", x.target.value)} {...p} />}</Field>
          <Field label="Quyền lợi" required error={e.benefits} hint="Mỗi dòng là một quyền lợi.">{(p) => <Textarea rows={4} value={f.benefits} onChange={(x) => u("benefits", x.target.value)} {...p} />}</Field>
        </form>
      </Drawer>
      <Modal open={prev} onOpenChange={setPrev} wide title="Xem trước tin đăng" description="Đây là cách tin hiển thị với ứng viên."><JobPreview job={toJob()} company={company ?? undefined} /></Modal>
    </>
  );
}

export default function JobsManage() {
  const { jobs, company, applications, setJobStatus, deleteJob } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [sp, setSp] = useSearchParams(); const [q, setQ] = useState(""); const [st, setSt] = useState<"" | JobStatus>("");
  const [editing, setEditing] = useState<Job | null>(null); const [formOpen, setFormOpen] = useState(false); const [preview, setPreview] = useState<Job | null>(null); const [confirm, setConfirm] = useState<{ job: Job; act: "close" | "delete" } | null>(null);
  useEffect(() => { if (sp.get("new")) { setEditing(null); setFormOpen(true); setSp({}, { replace: true }); } }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = useMemo(() => jobs.filter((j) => j.companyId === company?.id), [jobs, company]);
  const list = mine.filter((j) => (!st || j.status === st) && (!q || matches(j.title, q)));
  const run = async (fn: () => Promise<void>, ok: string) => { try { await fn(); toast.success(ok); } catch (er) { toast.error("Thao tác không thành công", { description: (er as Error).message }); } };
  const submitExisting = (j: Job) => { if (company?.status !== "approved") return void toast.error("Doanh nghiệp chưa được duyệt nên chưa thể gửi duyệt tin."); run(() => setJobStatus(j.id, "pending"), "Đã gửi duyệt tin (mô phỏng)"); };
  const open = (j: Job | null) => { setEditing(j); setFormOpen(true); };
  const statuses: JobStatus[] = ["approved", "pending", "draft", "rejected", "closed", "hidden"];
  return (
    <div>
      <PageHeader title="Tin tuyển dụng" desc="Tạo, chỉnh sửa và theo dõi trạng thái các tin của doanh nghiệp." actions={<Button onClick={() => open(null)}><FilePlus2 className="h-4 w-4" />Tạo tin mới</Button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Tìm tin tuyển dụng</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tiêu đề…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <Select aria-label="Lọc theo trạng thái" className="sm:w-52" value={st} onChange={(e) => setSt(e.target.value as JobStatus | "")}><option value="">Tất cả trạng thái ({mine.length})</option>{statuses.map((s) => <option key={s} value={s}>{JOB_STATUS[s].label} ({mine.filter((j) => j.status === s).length})</option>)}</Select>
      </div>
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : mine.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="Bạn chưa có tin tuyển dụng" text="Tạo tin đầu tiên để bắt đầu nhận hồ sơ." action={<Button onClick={() => open(null)}>Tạo tin mới</Button>} />
      ) : list.length === 0 ? <EmptyState title="Không có tin phù hợp" text="Thử đổi từ khóa hoặc trạng thái lọc." action={<Button variant="outline" onClick={() => { setQ(""); setSt(""); }}>Xóa bộ lọc</Button>} /> : (
        <ul className="space-y-3">{list.map((j) => { const n = applications.filter((a) => a.jobId === j.id).length; return (
          <li key={j.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold leading-snug">{j.title}</h3><JobStatusBadge s={j.status} /></div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5"><Meta icon={<MapPin />}>{j.location}</Meta><Meta icon={<Wallet />}>{salaryText(j.salaryMin, j.salaryMax)}</Meta><Meta icon={<CalendarClock />}>Hạn {fmtDate(j.deadline)}</Meta><Meta icon={<Users />}>{n} hồ sơ</Meta></div></div>
              <Menu><MenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Thao tác với tin ${j.title}`}><MoreHorizontal className="h-5 w-5" /></Button></MenuTrigger>
                <MenuContent>
                  {j.status !== "closed" && j.status !== "hidden" && <MenuItem icon={<Pencil className="h-4 w-4" />} onSelect={() => open(j)}>Chỉnh sửa</MenuItem>}
                  <MenuItem icon={<Eye className="h-4 w-4" />} onSelect={() => setPreview(j)}>Xem trước</MenuItem>
                  {(j.status === "draft" || j.status === "rejected") && <MenuItem icon={<Send className="h-4 w-4" />} onSelect={() => submitExisting(j)}>Gửi duyệt</MenuItem>}
                  {j.status === "closed" && <MenuItem icon={<RotateCcw className="h-4 w-4" />} onSelect={() => submitExisting(j)}>Mở lại (gửi duyệt)</MenuItem>}
                  {(j.status === "approved" || j.status === "pending") && <><MenuSep /><MenuItem danger icon={<Ban className="h-4 w-4" />} onSelect={() => setConfirm({ job: j, act: "close" })}>Đóng tin</MenuItem></>}
                  {j.status === "draft" && <><MenuSep /><MenuItem danger icon={<Trash2 className="h-4 w-4" />} onSelect={() => setConfirm({ job: j, act: "delete" })}>Xóa bản nháp</MenuItem></>}
                </MenuContent></Menu>
            </div>
            {j.status === "rejected" && j.rejectReason && <p className="mt-3 flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Lý do từ chối:</b> {j.rejectReason}</span></p>}
            {j.status === "hidden" && <p className="mt-3 flex gap-2 rounded-ctl bg-info-bg p-3 text-sm text-info"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Quản trị viên đã ẩn tin:</b> {j.hiddenReason || "Tin chưa phù hợp."}</span></p>}
          </li>); })}</ul>)}

      <JobForm job={editing} open={formOpen} onClose={() => setFormOpen(false)} />
      <Modal open={!!preview} onOpenChange={(o) => !o && setPreview(null)} wide title="Xem trước tin đăng">{preview && <JobPreview job={preview} company={company ?? undefined} />}</Modal>
      <ConfirmDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} danger confirmLabel={confirm?.act === "delete" ? "Xóa bản nháp" : "Đóng tin"} title={confirm?.act === "delete" ? "Xóa bản nháp này?" : "Đóng tin tuyển dụng?"}
        text={confirm?.act === "delete" ? `Bản nháp “${confirm?.job.title}” sẽ bị xóa khỏi dữ liệu mẫu.` : `Tin “${confirm?.job.title}” sẽ ngừng hiển thị với ứng viên. Các hồ sơ đã nhận vẫn được giữ.`}
        onConfirm={async () => { const c = confirm!; await run(() => (c.act === "delete" ? deleteJob(c.job.id) : setJobStatus(c.job.id, "closed")), c.act === "delete" ? "Đã xóa bản nháp" : "Đã đóng tin tuyển dụng"); }} />
    </div>
  );
}
