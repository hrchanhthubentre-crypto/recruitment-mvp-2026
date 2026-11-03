import { BriefcaseBusiness, CalendarClock, ChevronRight, FileUp, GraduationCap, MapPin, Users, Wallet, Building2, CheckCircle2, Clock, Info, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/overlay";
import { Badge, CompanyLogo, EmptyState, JobStatusBadge } from "@/components/shared/common";
import { JobBody, JobCard, Meta, SaveButton } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { daysLeft, fmtDate, fmtSize, isPhone, salaryText } from "@/lib/utils";

const MAX = 5 * 1024 * 1024;

function ApplyDialog({ jobId, open, onOpenChange }: { jobId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, apply, jobs, companies } = useStore();
  const job = jobs.find((j) => j.id === jobId)!; const co = companies.find((c) => c.id === job.companyId);
  const [phone, setPhone] = useState(profile?.phone ?? ""); const [cover, setCover] = useState("");
  const [useProfileCv, setUseProfileCv] = useState(!!profile?.cv); const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [fail, setFail] = useState("");
  const pick = (f?: File) => {
    if (!f) return;
    if (!/\.(pdf|docx?)$/i.test(f.name)) return setErr((e) => ({ ...e, cv: "Chỉ chấp nhận tệp PDF, DOC hoặc DOCX." }));
    if (f.size > MAX) return setErr((e) => ({ ...e, cv: "Tệp vượt quá 5 MB." }));
    setFile(f); setUseProfileCv(false); setErr((e) => ({ ...e, cv: "" }));
  };
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!isPhone(phone)) e.phone = "Số điện thoại chưa hợp lệ (ví dụ 0901234567).";
    const cvName = useProfileCv && profile?.cv ? profile.cv.name : file?.name;
    if (!cvName) e.cv = "Vui lòng chọn CV từ hồ sơ hoặc tải CV khác.";
    if (cover.length > 1000) e.cover = "Thư giới thiệu tối đa 1.000 ký tự.";
    setErr(e); setFail(""); if (Object.values(e).some(Boolean)) return;
    setBusy(true);
    try { await apply(jobId, { phone, cover, cvName: cvName! }); toast.success("Đã gửi hồ sơ ứng tuyển (mô phỏng)", { description: `${job.title} · ${co?.name}` }); onOpenChange(false); }
    catch (x) { setFail((x as Error).message); toast.error("Gửi hồ sơ không thành công"); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Ứng tuyển vị trí" description={`${job.title} · ${co?.name}`}
      footer={<><Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button loading={busy} onClick={submit}>Gửi hồ sơ</Button></>}>
      <div className="space-y-5">
        {fail && <div role="alert" className="flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{fail}</div>}
        <p className="flex gap-2 rounded-ctl bg-info-bg p-3 text-[13px] text-info"><Info className="mt-0.5 h-4 w-4 shrink-0" />Bản mô phỏng: tệp CV không được tải lên đâu cả, chỉ lưu tên và dung lượng. Đừng dùng thông tin cá nhân thật.</p>
        <Field label="Số điện thoại liên hệ" required error={err.phone}>{(p) => <Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" {...p} />}</Field>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">CV đính kèm <span className="text-bad">*</span></legend>
          {profile?.cv && (
            <label className="mb-2 flex cursor-pointer items-center gap-3 rounded-ctl border border-line bg-paper p-3 text-sm has-[:checked]:border-gold has-[:checked]:bg-butter-soft">
              <input type="radio" name="cv" checked={useProfileCv} onChange={() => setUseProfileCv(true)} className="accent-[#30343b]" />
              <span className="min-w-0"><span className="block truncate font-medium">{profile.cv.name}</span><span className="text-xs text-ink-mute">CV trong hồ sơ · {fmtSize(profile.cv.size)}</span></span>
            </label>
          )}
          <label className="flex cursor-pointer items-center gap-3 rounded-ctl border border-dashed border-line bg-paper p-3 text-sm hover:border-gold">
            <FileUp className="h-5 w-5 text-ink-mute" /><span className="min-w-0 flex-1 truncate">{file ? <><b>{file.name}</b> · {fmtSize(file.size)}</> : "Chọn CV khác (PDF, DOC, DOCX · tối đa 5 MB)"}</span>
            <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {err.cv && <p role="alert" className="mt-1.5 text-[13px] text-bad">{err.cv}</p>}
        </fieldset>
        <Field label="Thư giới thiệu (không bắt buộc)" error={err.cover} hint={`${cover.length}/1000 ký tự`}>{(p) => <Textarea rows={4} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp…" {...p} />}</Field>
      </div>
    </Modal>
  );
}

export default function JobDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const { jobs, companies, role, user, applications, company: myCo, switchRole } = useStore();
  const [apply, setApply] = useState(false); const [login, setLogin] = useState(false);
  const job = jobs.find((j) => j.id === id);
  const co = job && companies.find((c) => c.id === job.companyId);
  const canPreview = !!job && (role === "admin" || (role === "employer" && myCo?.id === job.companyId));
  if (!job || !co || ((job.status !== "approved" || co.status !== "approved") && !canPreview))
    return <div className="mx-auto max-w-xl px-4 py-24"><EmptyState title="Tin tuyển dụng không còn hiển thị" text="Tin có thể đã đóng, bị ẩn hoặc không tồn tại." action={<Link to="/viec-lam"><Button>Xem việc làm khác</Button></Link>} /></div>;

  const applied = applications.find((a) => a.jobId === job.id && a.candidateId === user?.id);
  const dl = daysLeft(job.deadline); const expired = dl < 0;
  const related = jobs.filter((j) => j.id !== job.id && j.status === "approved" && j.category === job.category).slice(0, 3);
  const onApply = () => {
    if (role === "guest") return setLogin(true);
    if (role !== "candidate") return void toast.info("Chỉ tài khoản ứng viên mới ứng tuyển được.", { description: "Dùng thanh Xem trước phía trên để chuyển sang vai trò Ứng viên." });
    setApply(true);
  };
  const ApplyBtn = ({ full }: { full?: boolean }) => applied ? (
    <Button size="lg" variant="soft" className={full ? "w-full" : ""} onClick={() => nav("/ung-vien/da-ung-tuyen")}><CheckCircle2 className="h-5 w-5" />Đã ứng tuyển</Button>
  ) : <Button size="lg" className={full ? "w-full" : ""} disabled={expired} onClick={onApply}>{expired ? "Đã hết hạn nộp" : "Ứng tuyển ngay"}</Button>;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
        <Link to="/" className="hover:text-ink">Trang chủ</Link><ChevronRight className="h-3.5 w-3.5" /><Link to="/viec-lam" className="hover:text-ink">Việc làm</Link><ChevronRight className="h-3.5 w-3.5" /><span className="truncate text-ink">{job.title}</span>
      </nav>
      {job.status !== "approved" && <div role="status" className="mb-5 flex flex-wrap items-center gap-2 rounded-card border border-gold bg-butter p-3.5 text-sm"><Info className="h-4 w-4" />Bạn đang xem trước tin ở trạng thái <JobStatusBadge s={job.status} /> — khách truy cập chưa nhìn thấy tin này.</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="space-y-6">
          <section className="rounded-card border border-line bg-paper p-5 shadow-soft sm:p-7">
            <div className="flex gap-4 sm:gap-5">
              <CompanyLogo name={co.name} tone={co.tone} size={64} />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-snug sm:text-[28px]">{job.title}</h1>
                <Link to={`/cong-ty/${co.id}`} className="mt-1 inline-flex items-center gap-1.5 font-medium text-gold-ink hover:underline"><Building2 className="h-4 w-4" />{co.name}</Link>
              </div>
            </div>
            <div className="mt-5 grid gap-3 rounded-card bg-butter-soft p-4 sm:grid-cols-2">
              <Meta icon={<Wallet />}><span className="text-base font-bold text-ink">{salaryText(job.salaryMin, job.salaryMax)}</span></Meta>
              <Meta icon={<MapPin />}>{job.location}</Meta>
              <Meta icon={<CalendarClock />}>Hạn nộp: <b className="text-ink">{fmtDate(job.deadline)}</b>{!expired && dl <= 7 && <Badge tone="bad"><Clock className="h-3 w-3" />Còn {dl} ngày</Badge>}</Meta>
              <Meta icon={<BriefcaseBusiness />}>{job.experience} · {job.type}</Meta>
            </div>
            <div className="mt-5 hidden gap-3 lg:flex"><ApplyBtn /><SaveButton jobId={job.id} label /></div>
          </section>
          <section className="rounded-card border border-line bg-paper p-5 shadow-soft sm:p-7"><JobBody job={job} /></section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-card border border-line bg-paper p-5 shadow-soft">
            <h2 className="mb-4 font-semibold">Thông tin chung</h2>
            <dl className="space-y-3.5 text-sm">
              {[[<GraduationCap key="1" />, "Cấp bậc", job.level], [<BriefcaseBusiness key="2" />, "Kinh nghiệm", job.experience], [<Clock key="3" />, "Hình thức", job.type], [<Users key="4" />, "Số lượng tuyển", `${job.headcount} người`], [<Building2 key="5" />, "Ngành nghề", job.category]].map(([i, k, v]) => (
                <div key={k as string} className="flex items-start gap-3"><span className="mt-0.5 text-ink-mute [&>svg]:h-4 [&>svg]:w-4">{i}</span><div><dt className="text-ink-mute">{k}</dt><dd className="font-medium">{v}</dd></div></div>))}
            </dl>
          </section>
          <section className="rounded-card border border-line bg-paper p-5 shadow-soft">
            <div className="flex items-center gap-3"><CompanyLogo name={co.name} tone={co.tone} size={48} /><div className="min-w-0"><h2 className="truncate font-semibold">{co.name}</h2><p className="text-sm text-ink-soft">{co.industry}</p></div></div>
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-ink-soft">{co.about.split("\n")[0]}</p>
            <dl className="mt-4 space-y-2 text-sm text-ink-soft"><div className="flex gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" />{co.size}</div><div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" />{co.address}, {co.city}</div></dl>
            <Link to={`/cong-ty/${co.id}`}><Button variant="outline" className="mt-5 w-full">Xem trang doanh nghiệp</Button></Link>
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="h-rel">
          <h2 id="h-rel" className="mb-5 text-xl font-bold sm:text-2xl">Việc làm liên quan</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{related.map((j) => <JobCard key={j.id} job={j} compact company={companies.find((c) => c.id === j.companyId)} />)}</div>
        </section>
      )}

      {/* Thanh ứng tuyển cố định trên di động */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-cream/95 p-3 backdrop-blur lg:hidden">
        <div className="flex-1"><ApplyBtn full /></div><SaveButton jobId={job.id} className="h-12 w-12" />
      </div>

      {role === "candidate" && apply && <ApplyDialog jobId={job.id} open={apply} onOpenChange={setApply} />}
      <Modal open={login} onOpenChange={setLogin} title="Đăng nhập để ứng tuyển" description="Bạn cần tài khoản ứng viên để gửi hồ sơ."
        footer={<><Button variant="outline" onClick={() => { setLogin(false); nav("/dang-nhap"); }}>Đến trang đăng nhập</Button><Button onClick={() => { switchRole("candidate"); setLogin(false); toast.success("Đang xem với vai trò Ứng viên (mô phỏng)"); setApply(true); }}>Vào bằng ứng viên mô phỏng</Button></>}>
        <p className="text-sm text-ink-soft">Trong bản xem trước, bạn có thể dùng tài khoản ứng viên mẫu để trải nghiệm luồng ứng tuyển — không có hồ sơ thật nào được gửi đi.</p>
      </Modal>
    </div>
  );
}
