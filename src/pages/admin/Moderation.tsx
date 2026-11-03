import { Check, Clock3, Eye, EyeOff, Search, ShieldCheck, X, CircleCheck, CircleX, Undo2, CalendarClock, MapPin, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Modal, Tabs, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { CompanyLogo, EmptyState, ErrorState, JobStatusBadge, ListSkeleton, PageHeader, ReasonDialog, Stat } from "@/components/shared/common";
import { JobPreview, Meta } from "@/components/shared/job";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { daysFromNow, fmtDate, matches, relTime, salaryText } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

export default function Moderation() {
  const { jobs, companies, modLog, moderate } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [tab, setTab] = useState<JobStatus>("pending"); const [q, setQ] = useState(""); const [view, setView] = useState<Job | null>(null);
  const [reject, setReject] = useState<Job | null>(null); const [hide, setHide] = useState<Job | null>(null); const [busy, setBusy] = useState<string>("");
  const co = (j: Job) => companies.find((c) => c.id === j.companyId);
  const inTab = useMemo(() => jobs.filter((j) => j.status === tab && (!q || matches(`${j.title} ${co(j)?.name}`, q))).sort((a, b) => b.postedAt.localeCompare(a.postedAt)), [jobs, tab, q, companies]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = (s: JobStatus) => jobs.filter((j) => j.status === s).length;
  const act = async (j: Job, a: "approved" | "rejected" | "hidden" | "restored", reason: string | undefined, ok: string) => {
    setBusy(j.id + a);
    try { await moderate(j.id, a, reason); toast.success(ok, { description: j.title }); setView(null); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); throw e; } finally { setBusy(""); }
  };
  const approve = (j: Job) => act(j, "approved", undefined, "Đã duyệt tin — tin hiển thị công khai").catch(() => {});
  const today = modLog.filter((m) => m.at === daysFromNow(0));
  return (
    <div>
      <PageHeader title="Kiểm duyệt tin" desc="Xem trước, duyệt hoặc từ chối các tin tuyển dụng trước khi hiển thị công khai." />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat icon={<Clock3 className="h-5 w-5" />} label="Chờ duyệt" value={n("pending")} /><Stat icon={<CircleCheck className="h-5 w-5" />} label="Đã duyệt hôm nay" value={today.filter((m) => m.action === "approved").length} />
        <Stat icon={<CircleX className="h-5 w-5" />} label="Từ chối hôm nay" value={today.filter((m) => m.action === "rejected").length} /><Stat icon={<EyeOff className="h-5 w-5" />} label="Đang bị ẩn" value={n("hidden")} />
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as JobStatus)}><TabsList>{([["pending", "Chờ duyệt"], ["approved", "Đang hiển thị"], ["rejected", "Đã từ chối"], ["hidden", "Đã ẩn"]] as const).map(([v, l]) => <TabsTrigger key={v} value={v}>{l} ({n(v)})</TabsTrigger>)}</TabsList></Tabs>
        <label className="relative lg:w-72"><span className="sr-only">Tìm tin</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tiêu đề, công ty…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={4} /> : inTab.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-6 w-6" />} title={tab === "pending" && !q ? "Không còn tin chờ duyệt" : "Không có tin nào"} text={tab === "pending" && !q ? "Tất cả tin đã được xử lý. Làm tốt lắm!" : "Thử đổi từ khóa hoặc chuyển sang tab khác."} />
      ) : (
        <ul className="space-y-3">{inTab.map((j) => { const c = co(j); const pendingCo = c?.status !== "approved"; return (
          <li key={j.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
            <div className="flex gap-4"><CompanyLogo name={c?.name ?? "?"} tone={c?.tone} size={48} />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold leading-snug">{j.title}</h3><JobStatusBadge s={j.status} /></div><p className="text-sm text-ink-soft">{c?.name} · gửi {relTime(j.postedAt)}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1"><Meta icon={<MapPin />}>{j.location}</Meta><Meta icon={<Wallet />}>{salaryText(j.salaryMin, j.salaryMax)}</Meta><Meta icon={<CalendarClock />}>Hạn {fmtDate(j.deadline)}</Meta></div>
                {pendingCo && tab === "pending" && <p className="mt-2 text-[13px] text-gold-ink">⚠ Doanh nghiệp này chưa được duyệt — nên duyệt hồ sơ doanh nghiệp trước.</p>}
                {j.status === "rejected" && j.rejectReason && <p className="mt-2 text-sm text-bad"><b>Lý do:</b> {j.rejectReason}</p>}
                {j.status === "hidden" && j.hiddenReason && <p className="mt-2 text-sm text-info"><b>Lý do ẩn:</b> {j.hiddenReason}</p>}</div></div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4">
              <Button size="sm" variant="outline" onClick={() => setView(j)}><Eye className="h-4 w-4" />Xem trước</Button>
              {j.status === "pending" && <><Button size="sm" loading={busy === j.id + "approved"} onClick={() => approve(j)}><Check className="h-4 w-4" />Duyệt</Button><Button size="sm" variant="dangerSoft" onClick={() => setReject(j)}><X className="h-4 w-4" />Từ chối</Button></>}
              {j.status === "approved" && <Button size="sm" variant="dangerSoft" onClick={() => setHide(j)}><EyeOff className="h-4 w-4" />Ẩn tin</Button>}
              {j.status === "hidden" && <Button size="sm" variant="soft" loading={busy === j.id + "restored"} onClick={() => act(j, "restored", undefined, "Đã hiển thị lại tin").catch(() => {})}><Undo2 className="h-4 w-4" />Hiển thị lại</Button>}
              {j.status === "rejected" && <Button size="sm" variant="soft" loading={busy === j.id + "approved"} onClick={() => approve(j)}><Check className="h-4 w-4" />Duyệt lại</Button>}
            </div></li>); })}</ul>)}

      <Modal open={!!view} onOpenChange={(o) => !o && setView(null)} wide title="Xem trước tin" footer={view?.status === "pending" ? <><Button variant="dangerSoft" onClick={() => { setReject(view); setView(null); }}>Từ chối</Button><Button loading={busy === view.id + "approved"} onClick={() => approve(view)}>Duyệt tin</Button></> : undefined}>
        {view && <JobPreview job={view} company={co(view)} />}</Modal>
      <ReasonDialog open={!!reject} onOpenChange={(o) => !o && setReject(null)} title="Từ chối tin tuyển dụng" text={`“${reject?.title}” — lý do sẽ được gửi tới nhà tuyển dụng (mô phỏng).`} confirmLabel="Từ chối tin" onConfirm={(r) => act(reject!, "rejected", r, "Đã từ chối tin")} />
      <ReasonDialog open={!!hide} onOpenChange={(o) => !o && setHide(null)} title="Ẩn tin không phù hợp" text={`“${hide?.title}” sẽ không còn hiển thị công khai.`} confirmLabel="Ẩn tin" onConfirm={(r) => act(hide!, "hidden", r, "Đã ẩn tin")} />
    </div>
  );
}
