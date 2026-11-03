import { Building2, Check, Eye, Hash, Layers, Lock, LockOpen, Mail, MapPin, Search, Users, X, Globe, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Badge, COMPANY_STATUS, CompanyLogo, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, ReasonDialog } from "@/components/shared/common";
import { useStore, roleLabel } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { fmtDate, matches } from "@/lib/utils";
import type { Company, User } from "@/lib/types";

export default function UsersCompanies() {
  const { companies, users, jobs, user: me, decideCompany, toggleLock } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [tab, setTab] = useState("companies"); const [cq, setCq] = useState(""); const [cs, setCs] = useState(""); const [uq, setUq] = useState(""); const [ur, setUr] = useState("");
  const [view, setView] = useState<Company | null>(null); const [rej, setRej] = useState<Company | null>(null); const [lock, setLock] = useState<User | null>(null); const [busy, setBusy] = useState("");
  const cl = useMemo(() => companies.filter((c) => (!cs || c.status === cs) && (!cq || matches(`${c.name} ${c.taxCode} ${c.city}`, cq))), [companies, cs, cq]);
  const ul = useMemo(() => users.filter((u) => (!ur || u.role === ur) && (!uq || matches(`${u.name} ${u.email}`, uq))), [users, ur, uq]);
  const approve = async (c: Company) => { setBusy(c.id); try { await decideCompany(c.id, "approved"); toast.success("Đã duyệt doanh nghiệp", { description: c.name }); setView(null); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); } finally { setBusy(""); } };
  return (
    <div>
      <PageHeader title="Công ty & người dùng" desc="Duyệt hồ sơ doanh nghiệp và quản lý trạng thái tài khoản (khóa/mở khóa mô phỏng)." />
      {error ? <ErrorState onRetry={retry} /> : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5"><TabsTrigger value="companies">Doanh nghiệp ({companies.length})</TabsTrigger><TabsTrigger value="users">Tài khoản ({users.length})</TabsTrigger></TabsList>
          <TabsContent value="companies">
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><span className="sr-only">Tìm doanh nghiệp</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên, mã số thuế, tỉnh…" value={cq} onChange={(e) => setCq(e.target.value)} /></label>
              <Select aria-label="Lọc trạng thái doanh nghiệp" value={cs} onChange={(e) => setCs(e.target.value)}><option value="">Tất cả trạng thái</option><option value="pending">Chờ duyệt ({companies.filter((c) => c.status === "pending").length})</option><option value="approved">Đã duyệt</option><option value="rejected">Bị từ chối</option></Select></div>
            {loading ? <ListSkeleton rows={4} /> : cl.length === 0 ? <EmptyState icon={<Building2 className="h-6 w-6" />} title="Không tìm thấy doanh nghiệp" action={<Button variant="outline" onClick={() => { setCq(""); setCs(""); }}>Xóa bộ lọc</Button>} /> : (
              <ul className="space-y-3">{cl.map((c) => (
                <li key={c.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
                  <div className="flex gap-4"><CompanyLogo name={c.name} tone={c.tone} size={48} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{c.name}</h3><Badge tone={COMPANY_STATUS[c.status].tone}>{COMPANY_STATUS[c.status].label}</Badge></div>
                    <p className="text-sm text-ink-soft">{c.industry} · {c.city} · MST {c.taxCode}</p><p className="mt-1 text-[13px] text-ink-mute">{jobs.filter((j) => j.companyId === c.id).length} tin tuyển dụng</p>
                    {c.status === "rejected" && c.rejectReason && <p className="mt-2 text-sm text-bad"><b>Lý do:</b> {c.rejectReason}</p>}</div></div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4"><Button size="sm" variant="outline" onClick={() => setView(c)}><Eye className="h-4 w-4" />Xem hồ sơ</Button>
                    {c.status !== "approved" && <Button size="sm" loading={busy === c.id} onClick={() => approve(c)}><Check className="h-4 w-4" />{c.status === "rejected" ? "Duyệt lại" : "Duyệt"}</Button>}
                    {c.status !== "rejected" && <Button size="sm" variant="dangerSoft" onClick={() => setRej(c)}><X className="h-4 w-4" />{c.status === "approved" ? "Thu hồi" : "Từ chối"}</Button>}</div></li>))}</ul>)}
          </TabsContent>
          <TabsContent value="users">
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><span className="sr-only">Tìm tài khoản</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên hoặc email…" value={uq} onChange={(e) => setUq(e.target.value)} /></label>
              <Select aria-label="Lọc theo vai trò" value={ur} onChange={(e) => setUr(e.target.value)}><option value="">Tất cả vai trò</option><option value="candidate">Ứng viên</option><option value="employer">Nhà tuyển dụng</option><option value="admin">Quản trị viên</option></Select></div>
            {loading ? <ListSkeleton rows={4} /> : ul.length === 0 ? <EmptyState icon={<Users className="h-6 w-6" />} title="Không tìm thấy tài khoản" action={<Button variant="outline" onClick={() => { setUq(""); setUr(""); }}>Xóa bộ lọc</Button>} /> : (
              <ul className="space-y-3">{ul.map((u) => { const locked = u.status === "locked"; const protectedAcc = u.role === "admin"; return (
                <li key={u.id} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-butter font-bold text-gold-ink">{u.name.split(" ").slice(-1)[0][0]}</span>
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{u.name}{u.id === me?.id && <span className="ml-1.5 text-xs font-normal text-ink-mute">(bạn)</span>}</p><Badge tone={u.role === "admin" ? "info" : u.role === "employer" ? "gold" : "neutral"}>{roleLabel[u.role]}</Badge>{locked && <Badge tone="bad">Đã khóa</Badge>}</div>
                      <p className="truncate text-sm text-ink-soft">{u.email}{u.companyId && ` · ${companies.find((c) => c.id === u.companyId)?.name}`}</p><p className="text-xs text-ink-mute">Tạo ngày {fmtDate(u.createdAt)}</p></div></div>
                  <Button size="sm" variant={locked ? "soft" : "outline"} disabled={protectedAcc} title={protectedAcc ? "Không thể khóa tài khoản quản trị" : undefined} onClick={() => setLock(u)}>{locked ? <><LockOpen className="h-4 w-4" />Mở khóa</> : <><Lock className="h-4 w-4" />Khóa tài khoản</>}</Button>
                </li>); })}</ul>)}
          </TabsContent>
        </Tabs>)}

      <Modal open={!!view} onOpenChange={(o) => !o && setView(null)} wide title="Hồ sơ doanh nghiệp" footer={view && view.status !== "approved" ? <Button loading={busy === view.id} onClick={() => approve(view)}><Check className="h-4 w-4" />Duyệt doanh nghiệp</Button> : undefined}>
        {view && <div><div className="flex items-center gap-4"><CompanyLogo name={view.name} tone={view.tone} size={64} /><div><h3 className="text-lg font-bold">{view.name}</h3><Badge tone={COMPANY_STATUS[view.status].tone}>{COMPANY_STATUS[view.status].label}</Badge></div></div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">{[[<Hash key="1" />, "Mã số thuế", view.taxCode], [<Layers key="2" />, "Ngành", view.industry], [<Users key="3" />, "Quy mô", view.size], [<MapPin key="4" />, "Địa chỉ", [view.address, view.city].filter(Boolean).join(", ") || "—"], [<Globe key="5" />, "Website", view.website || "—"], [<Mail key="6" />, "Email", view.email]].map(([i, k, v]) => <div key={k as string} className="flex gap-3"><span className="mt-0.5 text-ink-mute [&>svg]:h-4 [&>svg]:w-4">{i}</span><div className="min-w-0"><dt className="text-ink-mute">{k}</dt><dd className="break-words font-medium">{v}</dd></div></div>)}</dl>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{view.about || "Chưa có phần giới thiệu."}</p>
          {view.status === "approved" && <Link to={`/cong-ty/${view.id}`} onClick={() => setView(null)} className="mt-5 inline-block text-sm font-semibold text-gold-ink hover:underline">Mở trang công khai →</Link>}</div>}
      </Modal>
      <ReasonDialog open={!!rej} onOpenChange={(o) => !o && setRej(null)} title={rej?.status === "approved" ? "Thu hồi duyệt doanh nghiệp" : "Từ chối doanh nghiệp"} text={`${rej?.name} — lý do sẽ hiển thị cho nhà tuyển dụng (mô phỏng).`} confirmLabel="Xác nhận từ chối"
        onConfirm={async (r) => { try { await decideCompany(rej!.id, "rejected", r); toast.success("Đã từ chối doanh nghiệp", { description: rej!.name }); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); throw e; } }} />
      <ConfirmDialog open={!!lock} onOpenChange={(o) => !o && setLock(null)} danger={lock?.status !== "locked"} title={lock?.status === "locked" ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
        text={lock?.status === "locked" ? `${lock?.name} sẽ có thể đăng nhập trở lại (mô phỏng).` : `${lock?.name} sẽ không đăng nhập được cho đến khi được mở khóa (mô phỏng).`} confirmLabel={lock?.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
        onConfirm={async () => { const u = lock!; try { await toggleLock(u.id); toast.success(u.status === "locked" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", { icon: u.status === "locked" ? undefined : <UserX className="h-4 w-4" />, description: u.name }); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); } }} />
    </div>
  );
}
