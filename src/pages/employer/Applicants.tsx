import { CalendarDays, ChevronDown, FileText, Mail, MapPin, Phone, Search, Users, StickyNote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Drawer, Menu, MenuContent, MenuItem, MenuTrigger, Tabs, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { APP_STATUS, AppStatusBadge, EmptyState, ErrorState, ListSkeleton, PageHeader } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, matches, relTime } from "@/lib/utils";
import type { AppStatus, Application } from "@/lib/types";

const ORDER: AppStatus[] = ["new", "reviewing", "interview", "closed"];

export default function Applicants() {
  const { applications, jobs, company, setAppStatus, setAppNote } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [jobId, setJobId] = useState(""); const [q, setQ] = useState(""); const [tab, setTab] = useState("all"); const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  const mineJobs = useMemo(() => jobs.filter((j) => j.companyId === company?.id && j.status !== "draft"), [jobs, company]);
  const ids = new Set(jobs.filter((j) => j.companyId === company?.id).map((j) => j.id));
  const all = applications.filter((a) => ids.has(a.jobId) && (!jobId || a.jobId === jobId) && (!q || matches(`${a.name} ${a.email} ${a.headline} ${a.skills.join(" ")}`, q))).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const list = all.filter((a) => tab === "all" || a.status === tab);
  const sel = applications.find((a) => a.id === openId);
  useEffect(() => { setNote(sel?.note ?? ""); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps
  const title = (a: Application) => jobs.find((j) => j.id === a.jobId)?.title ?? "—";
  const change = async (a: Application, s: AppStatus) => {
    if (a.status === s) return;
    try { await setAppStatus(a.id, s); toast.success(`Đã chuyển ${a.name} sang “${APP_STATUS[s].label}”`); } catch (e) { toast.error("Chưa cập nhật được trạng thái", { description: (e as Error).message }); }
  };
  const saveNote = async () => { if (!sel) return; if (note.length > 500) return void toast.error("Ghi chú tối đa 500 ký tự"); setBusy(true); try { await setAppNote(sel.id, note.trim()); toast.success("Đã lưu ghi chú nội bộ"); } catch (e) { toast.error("Chưa lưu được ghi chú", { description: (e as Error).message }); } finally { setBusy(false); } };
  const count = (s: string) => all.filter((a) => s === "all" || a.status === s).length;
  return (
    <div>
      <PageHeader title="Quản lý ứng viên" desc="Xem hồ sơ, cập nhật trạng thái và ghi chú nội bộ cho từng ứng viên." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <label className="relative"><span className="sr-only">Tìm ứng viên</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên, email, kỹ năng…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <Select aria-label="Lọc theo tin tuyển dụng" value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">Tất cả tin tuyển dụng</option>{mineJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</Select>
      </div>
      <Tabs value={tab} onValueChange={setTab}><TabsList className="mb-5"><TabsTrigger value="all">Tất cả ({count("all")})</TabsTrigger>{ORDER.map((s) => <TabsTrigger key={s} value={s}>{APP_STATUS[s].label} ({count(s)})</TabsTrigger>)}</TabsList></Tabs>

      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title={all.length === 0 && !q && !jobId ? "Chưa có ứng viên nào" : "Không tìm thấy ứng viên phù hợp"} text={all.length === 0 && !q && !jobId ? "Hồ sơ sẽ xuất hiện khi ứng viên ứng tuyển vào tin của bạn." : "Thử đổi từ khóa, tin tuyển dụng hoặc trạng thái."} action={(q || jobId || tab !== "all") ? <Button variant="outline" onClick={() => { setQ(""); setJobId(""); setTab("all"); }}>Xóa bộ lọc</Button> : undefined} />
      ) : (
        <ul className="space-y-3">{list.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-butter font-bold text-gold-ink">{a.name.split(" ").slice(-1)[0][0]}</span>
              <div className="min-w-0"><p className="font-semibold">{a.name}</p><p className="truncate text-sm text-ink-soft">{a.headline} · {a.years > 0 ? `${a.years} năm KN` : "Chưa có KN"}</p><p className="mt-1 truncate text-[13px] text-ink-mute">Ứng tuyển: {title(a)} · {relTime(a.appliedAt)}</p>{a.note && <p className="mt-1 flex items-center gap-1 text-xs text-gold-ink"><StickyNote className="h-3 w-3" />Có ghi chú nội bộ</p>}</div></div>
            <div className="flex items-center gap-2">
              <Menu><MenuTrigger asChild><Button variant="outline" size="sm" aria-label={`Đổi trạng thái của ${a.name}`}><AppStatusBadge s={a.status} /><ChevronDown className="h-4 w-4" /></Button></MenuTrigger>
                <MenuContent>{ORDER.map((s) => <MenuItem key={s} disabled={s === a.status} onSelect={() => change(a, s)}>{APP_STATUS[s].label}</MenuItem>)}</MenuContent></Menu>
              <Button size="sm" variant="soft" onClick={() => setOpenId(a.id)}>Xem hồ sơ</Button>
            </div>
          </li>))}</ul>)}

      <Drawer open={!!sel} onOpenChange={(o) => !o && setOpenId(null)} title={sel?.name ?? ""} description={sel ? `Ứng tuyển: ${title(sel)}` : undefined} width="max-w-2xl">
        {sel && (<div className="space-y-7">
          <section><h3 className="mb-2 text-sm font-semibold">Trạng thái xử lý</h3>
            <div role="group" aria-label="Trạng thái" className="grid grid-cols-2 gap-2 sm:grid-cols-4">{ORDER.map((s) => <Button key={s} size="sm" variant={sel.status === s ? "dark" : "outline"} aria-pressed={sel.status === s} onClick={() => change(sel, s)}>{APP_STATUS[s].label}</Button>)}</div></section>
          <section className="grid gap-3 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-mute" />{sel.email}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-mute" />{sel.phone}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-mute" />{sel.location || "—"}</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-ink-mute" />Nộp ngày {fmtDate(sel.appliedAt)}</p></section>
          <section><h3 className="mb-2 text-sm font-semibold">Thư giới thiệu</h3><p className="rounded-ctl bg-paper p-3 text-sm leading-relaxed text-ink-soft">{sel.cover || "Không có thư giới thiệu."}</p></section>
          <section><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" />CV mẫu · {sel.cvName}</h3>
            <div className="rounded-card border border-line bg-white p-6 shadow-soft" aria-label="Xem trước CV mẫu">
              <p className="text-xl font-bold">{sel.name}</p><p className="text-sm text-ink-soft">{sel.headline}</p><p className="mt-1 text-xs text-ink-mute">{sel.email} · {sel.phone}</p>
              <hr className="my-4 border-line-soft" /><p className="mb-1 text-xs font-bold uppercase tracking-wider text-gold-ink">Kỹ năng</p><div className="mb-4 flex flex-wrap gap-1.5">{sel.skills.map((s) => <span key={s} className="rounded bg-butter px-2 py-0.5 text-xs font-medium">{s}</span>)}</div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gold-ink">Kinh nghiệm</p><p className="text-sm text-ink-soft">{sel.years > 0 ? `${sel.years} năm kinh nghiệm trong lĩnh vực ${sel.headline.toLowerCase()}.` : "Ứng viên mới tốt nghiệp / chưa có kinh nghiệm chính thức."}</p>
              <p className="mt-4 rounded bg-neutral-bg p-2 text-center text-[11px] text-ink-mute">CV mẫu tạo từ dữ liệu giả lập — không phải tệp thật.</p></div></section>
          <section><Field label="Ghi chú nội bộ" hint={`Chỉ nhà tuyển dụng thấy · ${note.length}/500`}>{(p) => <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Đã gọi điện, hẹn phỏng vấn thứ Năm…" {...p} />}</Field>
            <div className="mt-3 flex justify-end"><Button onClick={saveNote} loading={busy} disabled={note.trim() === sel.note}>Lưu ghi chú</Button></div></section>
          <section><h3 className="mb-3 text-sm font-semibold">Lịch sử xử lý</h3><ul className="space-y-2 text-sm">{sel.timeline.map((t, i) => <li key={i} className="flex gap-3"><span className="text-ink-mute">{fmtDate(t.at)}</span><span>{t.text}</span></li>)}</ul></section>
        </div>)}
      </Drawer>
    </div>
  );
}
