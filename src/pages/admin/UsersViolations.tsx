import { CheckCircle2, Flag, Lock, LockOpen, Search, Users, UserX, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Badge, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader } from "@/components/shared/common";
import { useStore, roleLabel } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, matches } from "@/lib/utils";
import type { Report, User } from "@/lib/types";

const RS = { open: { l: "Chưa xử lý", t: "gold" as const }, resolved: { l: "Đã xử lý", t: "ok" as const }, dismissed: { l: "Đã bác bỏ", t: "neutral" as const } };

export default function UsersViolations() {
  const { users, companies, reports, jobs, user: me, toggleLock, resolveReport } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [sp, setSp] = useSearchParams(); const tab = sp.get("tab") === "reports" ? "reports" : "users";
  const [uq, setUq] = useState(""); const [ur, setUr] = useState(""); const [us, setUs] = useState(""); const [rs, setRs] = useState(""); const [lock, setLock] = useState<User | null>(null);
  const [rep, setRep] = useState<Report | null>(null); const [decision, setDecision] = useState<"resolved" | "dismissed">("resolved"); const [note, setNote] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ul = useMemo(() => users.filter((u) => (!ur || u.role === ur) && (!us || u.status === us) && (!uq || matches(`${u.name} ${u.email}`, uq))), [users, ur, us, uq]);
  const rl = reports.filter((r) => !rs || r.status === rs); const openN = reports.filter((r) => r.status === "open").length;
  const targetUser = rep?.targetType === "user" ? users.find((u) => u.id === rep.targetId) : undefined; const targetJob = rep?.targetType === "job" ? jobs.find((j) => j.id === rep.targetId) : undefined;
  const openRep = (r: Report) => { setRep(r); setDecision("resolved"); setNote(""); setErr(""); };
  const submit = async () => {
    if (note.trim().length < 5) return setErr("Vui lòng ghi rõ kết quả xử lý (tối thiểu 5 ký tự)."); setBusy(true);
    try {
      if (decision === "resolved" && targetUser && targetUser.status !== "locked") await toggleLock(targetUser.id);
      await resolveReport(rep!.id, decision, note.trim(), decision === "resolved" && rep!.targetType === "job");
      toast.success(decision === "resolved" ? (rep!.targetType === "job" ? "Đã xử lý: tin bị ẩn" : "Đã xử lý: tài khoản bị khóa") : "Đã bác bỏ báo cáo"); setRep(null);
    } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); } finally { setBusy(false); }
  };
  return (
    <div>
      <PageHeader title="Người dùng & vi phạm" desc="Quản lý trạng thái tài khoản và xử lý báo cáo vi phạm (dữ liệu mẫu)." />
      {error ? <ErrorState onRetry={retry} /> : (
        <Tabs value={tab} onValueChange={(t) => setSp({ tab: t }, { replace: true })}>
          <TabsList className="mb-5"><TabsTrigger value="users">Tài khoản ({users.length})</TabsTrigger><TabsTrigger value="reports">Báo cáo vi phạm ({openN} chưa xử lý)</TabsTrigger></TabsList>
          <TabsContent value="users">
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_180px]"><label className="relative"><span className="sr-only">Tìm tài khoản</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên hoặc email…" value={uq} onChange={(e) => setUq(e.target.value)} /></label>
              <Select aria-label="Lọc theo vai trò" value={ur} onChange={(e) => setUr(e.target.value)}><option value="">Tất cả vai trò</option><option value="candidate">Ứng viên</option><option value="employer">Nhà tuyển dụng</option><option value="admin">Quản trị viên</option></Select>
              <Select aria-label="Lọc theo trạng thái" value={us} onChange={(e) => setUs(e.target.value)}><option value="">Mọi trạng thái</option><option value="active">Đang hoạt động</option><option value="locked">Đã khóa</option></Select></div>
            {loading ? <ListSkeleton rows={4} /> : ul.length === 0 ? <EmptyState icon={<Users className="h-6 w-6" />} title="Không tìm thấy tài khoản" action={<Button variant="outline" onClick={() => { setUq(""); setUr(""); setUs(""); }}>Xóa bộ lọc</Button>} /> : (
              <ul className="space-y-3">{ul.map((u) => { const locked = u.status === "locked"; return (
                <li key={u.id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-butter font-bold text-gold-ink">{u.name.split(" ").slice(-1)[0][0]}</span>
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{u.name}{u.id === me?.id && <span className="ml-1.5 text-xs font-normal text-ink-mute">(bạn)</span>}</p><Badge tone={u.role === "admin" ? "info" : u.role === "employer" ? "gold" : "neutral"}>{roleLabel[u.role]}</Badge>{locked && <Badge tone="bad">Đã khóa</Badge>}</div>
                      <p className="truncate text-sm text-ink-soft">{u.email}{u.companyId && ` · ${companies.find((c) => c.id === u.companyId)?.name}`}</p><p className="text-xs text-ink-mute">Tạo ngày {fmtDate(u.createdAt)}</p></div></div>
                  <Button size="sm" variant={locked ? "soft" : "outline"} disabled={u.role === "admin"} title={u.role === "admin" ? "Không thể khóa tài khoản quản trị" : undefined} onClick={() => setLock(u)}>{locked ? <><LockOpen className="h-4 w-4" />Mở khóa</> : <><Lock className="h-4 w-4" />Khóa tài khoản</>}</Button></li>); })}</ul>)}
          </TabsContent>
          <TabsContent value="reports">
            <div className="mb-4 sm:w-60"><Select aria-label="Lọc báo cáo theo trạng thái" value={rs} onChange={(e) => setRs(e.target.value)}><option value="">Mọi trạng thái</option><option value="open">Chưa xử lý ({openN})</option><option value="resolved">Đã xử lý</option><option value="dismissed">Đã bác bỏ</option></Select></div>
            {loading ? <ListSkeleton rows={3} /> : rl.length === 0 ? <EmptyState icon={<Flag className="h-6 w-6" />} title="Không có báo cáo" text="Báo cáo từ ứng viên sẽ xuất hiện tại đây." /> : (
              <ul className="space-y-3">{rl.map((r) => (
                <li key={r.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
                  <div className="flex flex-wrap items-center gap-2"><Badge tone={RS[r.status].t}>{RS[r.status].l}</Badge><Badge>{r.targetType === "job" ? "Tin tuyển dụng" : "Tài khoản"}</Badge><span className="text-xs text-ink-mute">{fmtDate(r.at)} · {r.reporter}</span></div>
                  <h3 className="mt-2 font-semibold leading-snug">{r.targetLabel}</h3><p className="text-sm font-medium text-bad">{r.reason}</p><p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.detail}</p>
                  {r.resolution && <p className="mt-2 rounded-ctl bg-butter-soft p-3 text-sm"><b>Kết quả:</b> {r.resolution}</p>}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4">{r.targetType === "job" && <Link to={`/viec-lam/${r.targetId}`}><Button size="sm" variant="outline"><ExternalLink className="h-4 w-4" />Xem tin</Button></Link>}{r.status === "open" && <Button size="sm" onClick={() => openRep(r)}><CheckCircle2 className="h-4 w-4" />Xử lý báo cáo</Button>}</div></li>))}</ul>)}
          </TabsContent>
        </Tabs>)}
      <ConfirmDialog open={!!lock} onOpenChange={(o) => !o && setLock(null)} danger={lock?.status !== "locked"} title={lock?.status === "locked" ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
        text={lock?.status === "locked" ? `${lock?.name} sẽ có thể đăng nhập trở lại (mô phỏng).` : `${lock?.name} sẽ không đăng nhập được cho đến khi được mở khóa (mô phỏng).`} confirmLabel={lock?.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
        onConfirm={async () => { const u = lock!; try { await toggleLock(u.id); toast.success(u.status === "locked" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", { icon: u.status === "locked" ? undefined : <UserX className="h-4 w-4" />, description: u.name }); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); } }} />
      <Modal open={!!rep} onOpenChange={(o) => !o && setRep(null)} title="Xử lý báo cáo" description={rep?.targetLabel} footer={<><Button variant="outline" onClick={() => setRep(null)}>Hủy</Button><Button loading={busy} onClick={submit}>Xác nhận</Button></>}>
        {rep && <div className="space-y-4"><p className="rounded-ctl bg-butter-soft p-3 text-sm"><b>{rep.reason}.</b> {rep.detail}</p>
          <fieldset><legend className="mb-2 text-sm font-medium">Quyết định</legend><div className="space-y-2">
            {([["resolved", rep.targetType === "job" ? "Báo cáo đúng — ẩn tin" : "Báo cáo đúng — khóa tài khoản"], ["dismissed", "Bác bỏ — giữ nguyên"]] as const).map(([v, l]) => <label key={v} className="flex cursor-pointer items-center gap-3 rounded-ctl border border-line p-3 text-sm has-[:checked]:border-ink has-[:checked]:bg-butter-soft"><input type="radio" name="dec" className="accent-[#30343b]" checked={decision === v} onChange={() => setDecision(v)} />{l}</label>)}</div></fieldset>
          {(targetJob || targetUser) && decision === "resolved" && <p className="text-[13px] text-ink-soft">{targetJob ? `Tin “${targetJob.title}” sẽ chuyển sang trạng thái ẩn.` : `Tài khoản ${targetUser?.name} sẽ bị khóa.`}</p>}
          <Field label="Ghi chú kết quả xử lý" required error={err}>{(p) => <Textarea rows={3} value={note} onChange={(e) => { setNote(e.target.value); setErr(""); }} {...p} />}</Field></div>}
      </Modal>
    </div>
  );
}
