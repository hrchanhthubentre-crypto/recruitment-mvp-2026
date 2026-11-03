import { AlertCircle, ArrowLeft, Eye, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/overlay";
import { EmptyState, JobStatusBadge, PageHeader } from "@/components/shared/common";
import { JobPreview } from "@/components/shared/job";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { daysFromNow, uid } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
interface Form { id: string; title: string; category: string; location: string; type: string; level: string; experience: string; negotiable: boolean; min: string; max: string; deadline: string; headcount: string; description: string; requirements: string; benefits: string; status: JobStatus }

export default function JobEditor() {
  const { id } = useParams(); const nav = useNavigate(); const { jobs, catalogs, company, saveJob } = useStore();
  const job = id ? jobs.find((j) => j.id === id && j.companyId === company?.id) : undefined;
  const blank = (): Form => ({ id: uid("j"), title: "", category: "", location: "", type: catalogs.types.find((t) => t.active)?.name ?? "", level: "", experience: "", negotiable: false, min: "", max: "", deadline: daysFromNow(30), headcount: "1", description: "", requirements: "", benefits: "", status: "draft" });
  const from = (j: Job): Form => ({ id: j.id, title: j.title, category: j.category, location: j.location, type: j.type, level: j.level, experience: j.experience, negotiable: !j.salaryMin && !j.salaryMax, min: String(j.salaryMin || ""), max: String(j.salaryMax || ""), deadline: j.deadline, headcount: String(j.headcount), description: j.description.join("\n"), requirements: j.requirements.join("\n"), benefits: j.benefits.join("\n"), status: j.status });
  const [f, setF] = useState<Form>(() => (job ? from(job) : blank())); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState<"" | "draft" | "submit">(""); const [prev, setPrev] = useState(false); const [fail, setFail] = useState("");
  useEffect(() => { if (job) setF(from(job)); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (id && !job) return <EmptyState title="Không tìm thấy tin tuyển dụng" text="Tin không tồn tại hoặc không thuộc doanh nghiệp của bạn." action={<Link to="/nha-tuyen-dung/tin-tuyen-dung"><Button>Về danh sách tin</Button></Link>} />;
  if (job && (job.status === "closed" || job.status === "hidden")) return <EmptyState title={job.status === "closed" ? "Tin đã đóng" : "Tin đang bị ẩn bởi quản trị viên"} text={job.status === "closed" ? "Hãy mở lại tin từ danh sách trước khi chỉnh sửa." : `Lý do: ${job.hiddenReason ?? "—"}`} action={<Link to="/nha-tuyen-dung/tin-tuyen-dung"><Button>Về danh sách tin</Button></Link>} />;
  const u = (k: keyof Form, v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setE((x) => ({ ...x, [k]: "" })); };
  const live = !!job && (job.status === "approved" || job.status === "pending");
  const toJob = (): Job => ({ id: f.id, title: f.title.trim(), companyId: company!.id, category: f.category, location: f.location, type: f.type, level: f.level, experience: f.experience, salaryMin: f.negotiable ? 0 : Number(f.min) || 0, salaryMax: f.negotiable ? 0 : Number(f.max) || 0,
    postedAt: job?.postedAt ?? daysFromNow(0), deadline: f.deadline, description: lines(f.description), requirements: lines(f.requirements), benefits: lines(f.benefits), status: f.status, headcount: Number(f.headcount) || 1, rejectReason: job?.rejectReason, hiddenReason: job?.hiddenReason });
  const validate = (full: boolean) => {
    const x: Record<string, string> = {}; if (f.title.trim().length < 5) x.title = "Tiêu đề tối thiểu 5 ký tự.";
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
    if (!validate(submit)) { toast.error("Vui lòng kiểm tra lại các trường được đánh dấu"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setBusy(submit ? "submit" : "draft"); setFail("");
    try { const out = await saveJob(toJob(), submit); toast.success(submit ? "Đã gửi duyệt tin (mô phỏng)" : "Đã lưu bản nháp", { description: out.title }); nav("/nha-tuyen-dung/tin-tuyen-dung"); }
    catch (er) { setFail((er as Error).message); window.scrollTo({ top: 0, behavior: "smooth" }); toast.error(submit ? "Gửi duyệt không thành công" : "Lưu nháp không thành công"); } finally { setBusy(""); }
  };
  const opt = (k: "categories" | "locations" | "types" | "levels" | "experiences", cur: string) => catalogs[k].filter((c) => c.active || c.name === cur).map((c) => <option key={c.id}>{c.name}</option>);
  return (
    <div>
      <PageHeader title={job ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"} desc={live ? "Tin đang hiển thị hoặc chờ duyệt: sau khi lưu sẽ quay lại trạng thái chờ duyệt." : "Điền thông tin theo từng nhóm. Bạn có thể lưu nháp bất cứ lúc nào."}
        back={<Link to="/nha-tuyen-dung/tin-tuyen-dung" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" />Danh sách tin</Link>} actions={job && <JobStatusBadge s={job.status} />} />
      {fail && <div role="alert" className="mb-5 flex gap-2 rounded-card bg-bad-bg p-4 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{fail}</div>}
      <form onSubmit={(ev) => ev.preventDefault()} noValidate className="space-y-5 pb-28">
        <Card><h2 className="mb-1 font-semibold">1. Thông tin cơ bản</h2><p className="mb-5 text-sm text-ink-soft">Chức danh, ngành nghề và nơi làm việc.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Chức danh tuyển dụng" required error={e.title} className="sm:col-span-2">{(p) => <Input value={f.title} onChange={(x) => u("title", x.target.value)} placeholder="Ví dụ: Chuyên viên kinh doanh" maxLength={100} {...p} />}</Field>
            <Field label="Ngành nghề" required error={e.category}>{(p) => <Select value={f.category} onChange={(x) => u("category", x.target.value)} {...p}><option value="">Chọn ngành</option>{opt("categories", f.category)}</Select>}</Field>
            <Field label="Địa điểm làm việc" required error={e.location}>{(p) => <Select value={f.location} onChange={(x) => u("location", x.target.value)} {...p}><option value="">Chọn địa điểm</option>{opt("locations", f.location)}</Select>}</Field>
            <Field label="Hình thức làm việc" required>{(p) => <Select value={f.type} onChange={(x) => u("type", x.target.value)} {...p}>{opt("types", f.type)}</Select>}</Field>
            <Field label="Cấp bậc" required error={e.level}>{(p) => <Select value={f.level} onChange={(x) => u("level", x.target.value)} {...p}><option value="">Chọn cấp bậc</option>{opt("levels", f.level)}</Select>}</Field>
            <Field label="Kinh nghiệm" required error={e.experience}>{(p) => <Select value={f.experience} onChange={(x) => u("experience", x.target.value)} {...p}><option value="">Chọn kinh nghiệm</option>{opt("experiences", f.experience)}</Select>}</Field>
            <Field label="Số lượng tuyển" required error={e.headcount}>{(p) => <Input type="number" min={1} value={f.headcount} onChange={(x) => u("headcount", x.target.value)} {...p} />}</Field></div></Card>
        <Card><h2 className="mb-1 font-semibold">2. Mức lương & thời hạn</h2><p className="mb-5 text-sm text-ink-soft">Tin có mức lương rõ ràng thường thu hút nhiều ứng viên hơn.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset><legend className="mb-1.5 text-sm font-medium">Mức lương (triệu đồng/tháng)</legend>
              <div className="grid grid-cols-2 gap-3"><Input aria-label="Lương từ" type="number" min={0} placeholder="Từ" disabled={f.negotiable} value={f.min} onChange={(x) => u("min", x.target.value)} invalid={!!e.min} /><Input aria-label="Lương đến" type="number" min={0} placeholder="Đến" disabled={f.negotiable} value={f.max} onChange={(x) => u("max", x.target.value)} invalid={!!e.min} /></div>
              <Check checked={f.negotiable} onChange={(v) => u("negotiable", v)}>Lương thỏa thuận</Check>{e.min && <p role="alert" className="text-[13px] text-bad">{e.min}</p>}</fieldset>
            <Field label="Hạn nộp hồ sơ" required error={e.deadline}>{(p) => <Input type="date" min={daysFromNow(0)} value={f.deadline} onChange={(x) => u("deadline", x.target.value)} {...p} />}</Field></div></Card>
        <Card><h2 className="mb-1 font-semibold">3. Nội dung tin</h2><p className="mb-5 text-sm text-ink-soft">Mỗi dòng là một ý để hiển thị thành danh sách gọn gàng.</p>
          <div className="space-y-4">
            <Field label="Mô tả công việc" required error={e.description}>{(p) => <Textarea rows={5} value={f.description} onChange={(x) => u("description", x.target.value)} {...p} />}</Field>
            <Field label="Yêu cầu ứng viên" required error={e.requirements}>{(p) => <Textarea rows={4} value={f.requirements} onChange={(x) => u("requirements", x.target.value)} {...p} />}</Field>
            <Field label="Quyền lợi" required error={e.benefits}>{(p) => <Textarea rows={4} value={f.benefits} onChange={(x) => u("benefits", x.target.value)} {...p} />}</Field></div></Card>
      </form>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6">
        <Link to="/nha-tuyen-dung/tin-tuyen-dung" className="mr-auto"><Button variant="ghost">Hủy</Button></Link>
        <Button variant="outline" onClick={() => (validate(false) || f.title) && setPrev(true)}><Eye className="h-4 w-4" />Xem trước</Button>
        {!live && <Button variant="soft" loading={busy === "draft"} disabled={!!busy} onClick={() => save(false)}>Lưu nháp</Button>}
        <Button loading={busy === "submit"} disabled={!!busy} onClick={() => save(true)}><Send className="h-4 w-4" />{live ? "Lưu & gửi duyệt lại" : "Gửi duyệt"}</Button></div></div>
      <Modal open={prev} onOpenChange={setPrev} wide title="Xem trước tin đăng" description="Đây là cách tin hiển thị với ứng viên."><JobPreview job={toJob()} company={company ?? undefined} /></Modal>
    </div>
  );
}
