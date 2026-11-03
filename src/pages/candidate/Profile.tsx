import { CheckCircle2, FileText, FileUp, GraduationCap, Pencil, Plus, Trash2, X, Briefcase, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, Skeleton } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, fmtSize, isEmail, isPhone, uid } from "@/lib/utils";
import type { Education, Experience, Profile } from "@/lib/types";

function useSaver() {
  const { saveProfile } = useStore(); const [busy, setBusy] = useState(false);
  const save = async (patch: Partial<Profile>, ok: string) => { setBusy(true); try { await saveProfile(patch); toast.success(ok); return true; } catch (e) { toast.error("Chưa lưu được", { description: (e as Error).message }); return false; } finally { setBusy(false); } };
  return { busy, save };
}

function Personal({ p }: { p: Profile }) {
  const { busy, save } = useSaver(); const { catalogs } = useStore();
  const [f, setF] = useState({ fullName: p.fullName, email: p.email, phone: p.phone, birthYear: p.birthYear, city: p.city, summary: p.summary }); const [e, setE] = useState<Record<string, string>>({});
  const u = (k: keyof typeof f) => (v: string) => { setF({ ...f, [k]: v }); setE({ ...e, [k]: "" }); };
  const submit = (ev: FormEvent) => { ev.preventDefault(); const x: Record<string, string> = {};
    if (f.fullName.trim().length < 2) x.fullName = "Vui lòng nhập họ tên."; if (!isEmail(f.email)) x.email = "Email chưa hợp lệ."; if (f.phone && !isPhone(f.phone)) x.phone = "Số điện thoại chưa hợp lệ.";
    if (f.birthYear && !/^(19|20)\d{2}$/.test(f.birthYear)) x.birthYear = "Năm sinh không hợp lệ."; if (f.summary.length > 600) x.summary = "Tối đa 600 ký tự.";
    setE(x); if (!Object.keys(x).length) save(f, "Đã lưu thông tin cá nhân (mô phỏng)"); };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Họ và tên" required error={e.fullName}>{(q) => <Input value={f.fullName} onChange={(x) => u("fullName")(x.target.value)} {...q} />}</Field>
        <Field label="Email" required error={e.email}>{(q) => <Input type="email" value={f.email} onChange={(x) => u("email")(x.target.value)} {...q} />}</Field>
        <Field label="Số điện thoại" error={e.phone}>{(q) => <Input type="tel" value={f.phone} onChange={(x) => u("phone")(x.target.value)} {...q} />}</Field>
        <Field label="Năm sinh" error={e.birthYear}>{(q) => <Input inputMode="numeric" maxLength={4} value={f.birthYear} onChange={(x) => u("birthYear")(x.target.value)} {...q} />}</Field>
        <Field label="Nơi ở hiện tại" className="sm:col-span-2">{(q) => <Select value={f.city} onChange={(x) => u("city")(x.target.value)} {...q}><option value="">Chọn tỉnh/thành</option>{catalogs.locations.filter((l) => l.active && l.name !== "Làm việc từ xa").map((l) => <option key={l.id}>{l.name}</option>)}</Select>}</Field>
      </div>
      <Field label="Giới thiệu bản thân" error={e.summary} hint={`${f.summary.length}/600 ký tự`}>{(q) => <Textarea rows={5} value={f.summary} onChange={(x) => u("summary")(x.target.value)} {...q} />}</Field>
      <div className="flex justify-end"><Button type="submit" loading={busy}>Lưu thông tin</Button></div>
    </form>
  );
}

function Experiences({ p }: { p: Profile }) {
  const { busy, save } = useSaver(); const [edit, setEdit] = useState<Experience | null>(null); const [del, setDel] = useState<Experience | null>(null); const [e, setE] = useState<Record<string, string>>({});
  const done = async () => {
    const x: Record<string, string> = {}; if (!edit!.company.trim()) x.company = "Nhập tên công ty."; if (!edit!.title.trim()) x.title = "Nhập chức danh."; if (!edit!.from) x.from = "Chọn thời gian bắt đầu.";
    if (edit!.to && edit!.from && edit!.to < edit!.from) x.to = "Thời gian kết thúc phải sau thời gian bắt đầu.";
    setE(x); if (Object.keys(x).length) return;
    const exists = p.experiences.some((q) => q.id === edit!.id);
    if (await save({ experiences: exists ? p.experiences.map((q) => (q.id === edit!.id ? edit! : q)) : [edit!, ...p.experiences] }, "Đã lưu kinh nghiệm làm việc")) setEdit(null);
  };
  const u = (k: keyof Experience, v: string) => { setEdit({ ...edit!, [k]: v }); setE({ ...e, [k]: "" }); };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button variant="outline" onClick={() => { setE({}); setEdit({ id: uid("x"), company: "", title: "", from: "", to: "", desc: "" }); }}><Plus className="h-4 w-4" />Thêm kinh nghiệm</Button></div>
      {p.experiences.length === 0 ? <EmptyState icon={<Briefcase className="h-6 w-6" />} title="Chưa có kinh nghiệm làm việc" text="Thêm kinh nghiệm để nhà tuyển dụng hiểu rõ hơn về bạn." /> :
        <ul className="space-y-3">{p.experiences.map((x) => (
          <li key={x.id} className="flex gap-4 rounded-card border border-line bg-paper p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-ctl bg-butter text-gold-ink"><Briefcase className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{x.title}</p><p className="text-sm text-ink-soft">{x.company}</p><p className="text-[13px] text-ink-mute">{x.from} – {x.to || "Hiện tại"}</p>{x.desc && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.desc}</p>}</div>
            <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setE({}); setEdit(x); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Xóa" onClick={() => setDel(x)}><Trash2 className="h-4 w-4" /></Button></div></li>))}</ul>}
      <Modal open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit && p.experiences.some((q) => q.id === edit.id) ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm"} footer={<><Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button><Button loading={busy} onClick={done}>Lưu</Button></>}>
        {edit && <div className="space-y-4">
          <Field label="Chức danh" required error={e.title}>{(q) => <Input value={edit.title} onChange={(x) => u("title", x.target.value)} {...q} />}</Field>
          <Field label="Công ty" required error={e.company}>{(q) => <Input value={edit.company} onChange={(x) => u("company", x.target.value)} {...q} />}</Field>
          <div className="grid grid-cols-2 gap-4"><Field label="Từ tháng" required error={e.from}>{(q) => <Input type="month" value={edit.from} onChange={(x) => u("from", x.target.value)} {...q} />}</Field><Field label="Đến tháng" error={e.to} hint="Để trống nếu đang làm">{(q) => <Input type="month" value={edit.to} onChange={(x) => u("to", x.target.value)} {...q} />}</Field></div>
          <Field label="Mô tả công việc">{(q) => <Textarea rows={4} value={edit.desc} onChange={(x) => u("desc", x.target.value)} {...q} />}</Field></div>}
      </Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Xóa kinh nghiệm này?" text={`“${del?.title} – ${del?.company}” sẽ bị xóa khỏi hồ sơ mẫu.`} confirmLabel="Xóa" danger onConfirm={async () => { await save({ experiences: p.experiences.filter((q) => q.id !== del!.id) }, "Đã xóa kinh nghiệm"); }} />
    </div>
  );
}

function EduSkills({ p }: { p: Profile }) {
  const { busy, save } = useSaver(); const [edit, setEdit] = useState<Education | null>(null); const [sk, setSk] = useState(""); const [e, setE] = useState<Record<string, string>>({});
  const addSkill = async () => { const v = sk.trim(); if (!v) return; if (p.skills.some((s) => s.toLowerCase() === v.toLowerCase())) return void toast.info("Kỹ năng này đã có trong hồ sơ"); if (p.skills.length >= 20) return void toast.error("Tối đa 20 kỹ năng"); setSk(""); await save({ skills: [...p.skills, v] }, `Đã thêm kỹ năng “${v}”`); };
  const done = async () => { const x: Record<string, string> = {}; if (!edit!.school.trim()) x.school = "Nhập tên trường."; if (!edit!.major.trim()) x.major = "Nhập chuyên ngành.";
    setE(x); if (Object.keys(x).length) return; const exists = p.education.some((q) => q.id === edit!.id);
    if (await save({ education: exists ? p.education.map((q) => (q.id === edit!.id ? edit! : q)) : [...p.education, edit!] }, "Đã lưu học vấn")) setEdit(null); };
  return (
    <div className="space-y-8">
      <section><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Học vấn</h3><Button variant="outline" size="sm" onClick={() => { setE({}); setEdit({ id: uid("e"), school: "", major: "", from: "", to: "" }); }}><Plus className="h-4 w-4" />Thêm</Button></div>
        {p.education.length === 0 ? <p className="rounded-card border border-dashed border-line p-5 text-center text-sm text-ink-mute">Chưa có thông tin học vấn.</p> :
          <ul className="space-y-3">{p.education.map((x) => <li key={x.id} className="flex gap-4 rounded-card border border-line bg-paper p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-ctl bg-butter text-gold-ink"><GraduationCap className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><p className="font-semibold">{x.school}</p><p className="text-sm text-ink-soft">{x.major}</p><p className="text-[13px] text-ink-mute">{x.from} – {x.to}</p></div>
            <div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setE({}); setEdit(x); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Xóa" onClick={() => save({ education: p.education.filter((q) => q.id !== x.id) }, "Đã xóa học vấn")}><Trash2 className="h-4 w-4" /></Button></div></li>)}</ul>}</section>
      <section><h3 className="mb-3 font-semibold">Kỹ năng</h3>
        <div className="mb-3 flex flex-wrap gap-2">{p.skills.length === 0 && <span className="text-sm text-ink-mute">Chưa có kỹ năng nào.</span>}{p.skills.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-full bg-butter py-1 pl-3.5 pr-1.5 text-sm font-medium">{s}<button aria-label={`Xóa kỹ năng ${s}`} onClick={() => save({ skills: p.skills.filter((x) => x !== s) }, `Đã xóa kỹ năng “${s}”`)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-gold/60"><X className="h-3.5 w-3.5" /></button></span>)}</div>
        <form onSubmit={(ev) => { ev.preventDefault(); addSkill(); }} className="flex gap-2"><Input aria-label="Thêm kỹ năng" value={sk} onChange={(x) => setSk(x.target.value)} placeholder="Ví dụ: Excel, Giao tiếp, SQL…" maxLength={40} /><Button type="submit" variant="soft" loading={busy}>Thêm</Button></form></section>
      <Modal open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title="Học vấn" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Hủy</Button><Button loading={busy} onClick={done}>Lưu</Button></>}>
        {edit && <div className="space-y-4"><Field label="Trường" required error={e.school}>{(q) => <Input value={edit.school} onChange={(x) => { setEdit({ ...edit, school: x.target.value }); setE({}); }} {...q} />}</Field><Field label="Chuyên ngành" required error={e.major}>{(q) => <Input value={edit.major} onChange={(x) => { setEdit({ ...edit, major: x.target.value }); setE({}); }} {...q} />}</Field>
          <div className="grid grid-cols-2 gap-4"><Field label="Từ năm">{(q) => <Input inputMode="numeric" maxLength={4} value={edit.from} onChange={(x) => setEdit({ ...edit, from: x.target.value })} {...q} />}</Field><Field label="Đến năm">{(q) => <Input inputMode="numeric" maxLength={4} value={edit.to} onChange={(x) => setEdit({ ...edit, to: x.target.value })} {...q} />}</Field></div></div>}
      </Modal>
    </div>
  );
}

function Desired({ p }: { p: Profile }) {
  const { busy, save } = useSaver(); const { catalogs } = useStore();
  const [f, setF] = useState({ desiredTitle: p.desiredTitle, desiredCategory: p.desiredCategory, desiredLocation: p.desiredLocation, desiredSalary: p.desiredSalary, desiredType: p.desiredType, openToWork: p.openToWork }); const [e, setE] = useState("");
  return (
    <form onSubmit={(ev) => { ev.preventDefault(); if (!f.desiredTitle.trim()) return setE("Vui lòng nhập vị trí mong muốn."); setE(""); save(f, "Đã lưu vị trí mong muốn (mô phỏng)"); }} noValidate className="space-y-4">
      <Field label="Vị trí mong muốn" required error={e}>{(q) => <Input value={f.desiredTitle} onChange={(x) => { setF({ ...f, desiredTitle: x.target.value }); setE(""); }} placeholder="Ví dụ: Lập trình viên Frontend" {...q} />}</Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ngành nghề">{(q) => <Select value={f.desiredCategory} onChange={(x) => setF({ ...f, desiredCategory: x.target.value })} {...q}><option value="">Chọn ngành</option>{catalogs.categories.filter((c) => c.active).map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
        <Field label="Địa điểm làm việc">{(q) => <Select value={f.desiredLocation} onChange={(x) => setF({ ...f, desiredLocation: x.target.value })} {...q}><option value="">Chọn địa điểm</option>{catalogs.locations.filter((c) => c.active).map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
        <Field label="Mức lương mong muốn">{(q) => <Input value={f.desiredSalary} onChange={(x) => setF({ ...f, desiredSalary: x.target.value })} placeholder="Ví dụ: 20 – 30 triệu" {...q} />}</Field>
        <Field label="Hình thức làm việc">{(q) => <Select value={f.desiredType} onChange={(x) => setF({ ...f, desiredType: x.target.value })} {...q}>{catalogs.types.filter((c) => c.active).map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
      </div>
      <div className="flex items-center justify-between rounded-card border border-line bg-paper p-4"><div><p className="font-medium">Đang tìm việc</p><p className="text-sm text-ink-soft">Hiển thị trạng thái sẵn sàng nhận việc trên hồ sơ mẫu.</p></div><Switch checked={f.openToWork} onChange={(v) => setF({ ...f, openToWork: v })} label="Đang tìm việc" /></div>
      <div className="flex justify-end"><Button type="submit" loading={busy}>Lưu mong muốn</Button></div>
    </form>
  );
}

function CvTab({ p }: { p: Profile }) {
  const { save, busy } = useSaver(); const [pct, setPct] = useState<number | null>(null); const [err, setErr] = useState(""); const [rm, setRm] = useState(false);
  const pick = (f?: File) => {
    if (!f) return; setErr("");
    if (!/\.(pdf|docx?)$/i.test(f.name)) return setErr("Chỉ chấp nhận tệp PDF, DOC hoặc DOCX.");
    if (f.size > 5 * 1024 * 1024) return setErr("Tệp vượt quá 5 MB.");
    setPct(0); let n = 0; const t = setInterval(async () => { n += 20; setPct(n); if (n >= 100) { clearInterval(t); await save({ cv: { name: f.name, size: f.size, uploadedAt: new Date("2026-11-03").toISOString() } }, "Đã chọn CV (mô phỏng, tệp không được tải lên máy chủ)"); setPct(null); } }, 200);
  };
  return (
    <div className="space-y-5">
      <p className="rounded-ctl bg-info-bg p-3 text-[13px] text-info">Bản xem trước: chỉ tên, dung lượng và loại tệp được ghi nhớ — nội dung tệp <b>không</b> được đọc hay tải lên. Đừng chọn CV chứa thông tin cá nhân thật.</p>
      {p.cv ? (
        <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-ctl bg-butter text-gold-ink"><FileText className="h-7 w-7" /></span>
          <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.cv.name}</p><p className="text-sm text-ink-soft">{fmtSize(p.cv.size)} · Chọn ngày {fmtDate(p.cv.uploadedAt)}</p><p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-ok"><CheckCircle2 className="h-4 w-4" />Dùng làm CV mặc định khi ứng tuyển</p></div>
          <Button variant="dangerSoft" onClick={() => setRm(true)}><Trash2 className="h-4 w-4" />Gỡ CV</Button>
        </div>) : <EmptyState icon={<FileText className="h-6 w-6" />} title="Chưa có CV" text="Chọn một tệp để dùng làm CV mặc định khi ứng tuyển." />}
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-line bg-paper px-6 py-9 text-center transition-colors hover:border-gold hover:bg-butter-soft">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-butter text-gold-ink"><Upload className="h-5 w-5" /></span>
        <span className="font-semibold">{p.cv ? "Chọn CV khác" : "Chọn tệp CV"}</span><span className="text-sm text-ink-soft">PDF, DOC, DOCX · tối đa 5 MB</span>
        <input type="file" accept=".pdf,.doc,.docx" className="sr-only" disabled={busy || pct !== null} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {pct !== null && <div role="status" aria-label="Đang xử lý tệp"><div className="mb-1 flex justify-between text-sm"><span className="flex items-center gap-2"><FileUp className="h-4 w-4" />Đang xử lý…</span><span>{pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-butter"><div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div></div>}
      {err && <p role="alert" className="text-sm text-bad">{err}</p>}
      <ConfirmDialog open={rm} onOpenChange={setRm} title="Gỡ CV khỏi hồ sơ?" text="Bạn vẫn có thể chọn lại một tệp khác bất cứ lúc nào." confirmLabel="Gỡ CV" danger onConfirm={async () => { await save({ cv: null }, "Đã gỡ CV"); }} />
    </div>
  );
}

export default function ProfilePage() {
  const { profile } = useStore(); const { loading, error, retry } = useFakeLoad(400); const [tab, setTab] = useState("personal");
  useEffect(() => { document.title = "Hồ sơ & CV"; }, []);
  if (!profile) return null;
  const checks = [profile.fullName, profile.phone, profile.summary, profile.skills.length, profile.experiences.length, profile.education.length, profile.desiredTitle, profile.cv];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return (
    <div>
      <PageHeader title="Hồ sơ & CV" desc="Hoàn thiện hồ sơ để nhà tuyển dụng dễ dàng tìm thấy bạn." />
      {error ? <ErrorState onRetry={retry} /> : loading ? <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-80" /></div> : (
        <>
          <div className="mb-6 flex flex-col gap-4 rounded-card border border-line bg-paper p-5 shadow-soft sm:flex-row sm:items-center">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gold text-2xl font-bold">{(profile.fullName.trim().split(" ").slice(-1)[0] || "?")[0]}</span>
            <div className="min-w-0 flex-1"><p className="text-lg font-semibold">{profile.fullName}</p><p className="text-sm text-ink-soft">{profile.desiredTitle || "Chưa cập nhật vị trí mong muốn"}{profile.city && ` · ${profile.city}`}</p></div>
            <div className="sm:w-56"><div className="mb-1.5 flex justify-between text-sm"><span className="text-ink-soft">Mức hoàn thiện</span><b>{pct}%</b></div><div className="h-2 overflow-hidden rounded-full bg-butter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Mức hoàn thiện hồ sơ"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div></div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6"><TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger><TabsTrigger value="exp">Kinh nghiệm</TabsTrigger><TabsTrigger value="edu">Học vấn & kỹ năng</TabsTrigger><TabsTrigger value="want">Vị trí mong muốn</TabsTrigger><TabsTrigger value="cv">CV</TabsTrigger></TabsList>
            <TabsContent value="personal"><Personal p={profile} /></TabsContent><TabsContent value="exp"><Experiences p={profile} /></TabsContent>
            <TabsContent value="edu"><EduSkills p={profile} /></TabsContent><TabsContent value="want"><Desired p={profile} /></TabsContent><TabsContent value="cv"><CvTab p={profile} /></TabsContent>
          </Tabs>
        </>)}
    </div>
  );
}
