import { BadgeCheck, Building2, Check, CircleAlert, CircleCheck, Eye, Hash, Layers, Mail, MapPin, Search, Users, X, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal, Tabs, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Badge, COMPANY_STATUS, CompanyLogo, EmptyState, ErrorState, ListSkeleton, PageHeader, ReasonDialog } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { isEmail, matches } from "@/lib/utils";
import type { Company, CompanyStatus } from "@/lib/types";

const checks = (c: Company): [string, boolean][] => [
  ["Mã số thuế đúng định dạng (10 hoặc 13 chữ số)", /^\d{10}(\d{3})?$/.test(c.taxCode)], ["Email liên hệ hợp lệ", isEmail(c.email)], ["Có địa chỉ trụ sở", !!c.address.trim()], ["Có website", !!c.website.trim()], ["Giới thiệu doanh nghiệp từ 50 ký tự", c.about.trim().length >= 50],
];

export default function CompanyModeration() {
  const { companies, jobs, decideCompany, updateCompany } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [tab, setTab] = useState<CompanyStatus>("pending"); const [q, setQ] = useState(""); const [view, setView] = useState<Company | null>(null); const [rej, setRej] = useState<Company | null>(null); const [note, setNote] = useState(""); const [busy, setBusy] = useState("");
  const n = (s: CompanyStatus) => companies.filter((c) => c.status === s).length;
  const list = useMemo(() => companies.filter((c) => c.status === tab && (!q || matches(`${c.name} ${c.taxCode} ${c.city}`, q))), [companies, tab, q]);
  const cur = view ? companies.find((c) => c.id === view.id) ?? view : null;
  const open = (c: Company) => { setView(c); setNote(c.adminNote ?? ""); };
  const approve = async (c: Company) => { setBusy(c.id); try { await decideCompany(c.id, "approved"); toast.success("Đã duyệt doanh nghiệp", { description: c.name }); setView(null); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); } finally { setBusy(""); } };
  const saveNote = async () => { if (!cur) return; if (note.length > 500) return void toast.error("Ghi chú tối đa 500 ký tự"); setBusy("note"); try { await updateCompany(cur.id, { adminNote: note.trim() }); toast.success("Đã lưu ghi chú nội bộ"); } catch (e) { toast.error("Chưa lưu được ghi chú", { description: (e as Error).message }); } finally { setBusy(""); } };
  return (
    <div>
      <PageHeader title="Kiểm duyệt doanh nghiệp" desc="Kiểm tra thông tin, ghi chú nội bộ và quyết định duyệt hoặc từ chối hồ sơ doanh nghiệp." />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as CompanyStatus)}><TabsList>{([["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["rejected", "Bị từ chối"]] as const).map(([v, l]) => <TabsTrigger key={v} value={v}>{l} ({n(v)})</TabsTrigger>)}</TabsList></Tabs>
        <label className="relative lg:w-72"><span className="sr-only">Tìm doanh nghiệp</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><Input className="pl-10" placeholder="Tìm theo tên, mã số thuế…" value={q} onChange={(e) => setQ(e.target.value)} /></label></div>
      {error ? <ErrorState onRetry={retry} /> : loading ? <ListSkeleton rows={3} /> : list.length === 0 ? <EmptyState icon={<Building2 className="h-6 w-6" />} title={tab === "pending" && !q ? "Không còn doanh nghiệp chờ duyệt" : "Không có doanh nghiệp phù hợp"} text="Thử đổi từ khóa hoặc chuyển sang tab khác." /> : (
        <ul className="space-y-3">{list.map((c) => { const ok = checks(c).filter(([, v]) => v).length; return (
          <li key={c.id} className="rounded-card border border-line bg-paper p-4 shadow-soft sm:p-5">
            <div className="flex gap-4"><CompanyLogo name={c.name} tone={c.tone} size={48} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{c.name}</h3><Badge tone={COMPANY_STATUS[c.status].tone}>{COMPANY_STATUS[c.status].label}</Badge></div>
              <p className="text-sm text-ink-soft">{c.industry} · {c.city} · MST {c.taxCode}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-mute"><span className="inline-flex items-center gap-1">{ok === 5 ? <CircleCheck className="h-3.5 w-3.5 text-ok" /> : <CircleAlert className="h-3.5 w-3.5 text-gold-ink" />}Kiểm tra: {ok}/5 mục đạt</span><span>{jobs.filter((j) => j.companyId === c.id).length} tin tuyển dụng</span>{c.adminNote && <span className="text-gold-ink">Có ghi chú nội bộ</span>}</p>
              {c.status === "rejected" && c.rejectReason && <p className="mt-2 text-sm text-bad"><b>Lý do:</b> {c.rejectReason}</p>}</div></div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4"><Button size="sm" variant="outline" onClick={() => open(c)}><Eye className="h-4 w-4" />Xem hồ sơ</Button>
              {c.status !== "approved" && <Button size="sm" loading={busy === c.id} onClick={() => approve(c)}><Check className="h-4 w-4" />{c.status === "rejected" ? "Duyệt lại" : "Duyệt"}</Button>}
              {c.status !== "rejected" && <Button size="sm" variant="dangerSoft" onClick={() => setRej(c)}><X className="h-4 w-4" />{c.status === "approved" ? "Thu hồi" : "Từ chối"}</Button>}</div></li>); })}</ul>)}

      <Modal open={!!cur} onOpenChange={(o) => !o && setView(null)} wide title="Hồ sơ doanh nghiệp" footer={cur && cur.status !== "approved" ? <Button loading={busy === cur.id} onClick={() => approve(cur)}><Check className="h-4 w-4" />Duyệt doanh nghiệp</Button> : undefined}>
        {cur && <div className="space-y-6"><div className="flex items-center gap-4"><CompanyLogo name={cur.name} tone={cur.tone} size={64} /><div><h3 className="flex items-center gap-1.5 text-lg font-bold">{cur.name}{cur.status === "approved" && <BadgeCheck className="h-5 w-5 text-ok" />}</h3><Badge tone={COMPANY_STATUS[cur.status].tone}>{COMPANY_STATUS[cur.status].label}</Badge></div></div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">{[[<Hash key="1" />, "Mã số thuế", cur.taxCode], [<Layers key="2" />, "Ngành", cur.industry], [<Users key="3" />, "Quy mô", cur.size], [<MapPin key="4" />, "Địa chỉ", [cur.address, cur.city].filter(Boolean).join(", ") || "—"], [<Globe key="5" />, "Website", cur.website || "—"], [<Mail key="6" />, "Email", cur.email]].map(([i, k, v]) => <div key={k as string} className="flex gap-3"><span className="mt-0.5 text-ink-mute [&>svg]:h-4 [&>svg]:w-4">{i}</span><div className="min-w-0"><dt className="text-ink-mute">{k}</dt><dd className="break-words font-medium">{v}</dd></div></div>)}</dl>
          <p className="text-sm leading-relaxed text-ink-soft">{cur.about || "Chưa có phần giới thiệu."}</p>
          <section><h4 className="mb-2 text-sm font-semibold">Kiểm tra thông tin</h4><ul className="space-y-1.5 text-sm">{checks(cur).map(([t, v]) => <li key={t} className="flex items-center gap-2">{v ? <CircleCheck className="h-4 w-4 text-ok" /> : <CircleAlert className="h-4 w-4 text-bad" />}<span className={v ? "" : "text-bad"}>{t}</span></li>)}</ul><p className="mt-2 text-xs text-ink-mute">Kiểm tra định dạng tự động trên dữ liệu mẫu, chưa đối chiếu cơ quan nhà nước.</p></section>
          <section><Field label="Ghi chú nội bộ (chỉ quản trị viên thấy)" hint={`${note.length}/500`}>{(p) => <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} {...p} />}</Field><div className="mt-2 flex items-center justify-between">{cur.status === "approved" ? <Link to={`/cong-ty/${cur.id}`} onClick={() => setView(null)} className="text-sm font-semibold text-gold-ink hover:underline">Mở trang công khai →</Link> : <span />}<Button size="sm" variant="soft" loading={busy === "note"} disabled={note.trim() === (cur.adminNote ?? "")} onClick={saveNote}>Lưu ghi chú</Button></div></section></div>}
      </Modal>
      <ReasonDialog open={!!rej} onOpenChange={(o) => !o && setRej(null)} title={rej?.status === "approved" ? "Thu hồi duyệt doanh nghiệp" : "Từ chối doanh nghiệp"} text={`${rej?.name} — lý do sẽ hiển thị cho nhà tuyển dụng (mô phỏng).`} confirmLabel="Xác nhận từ chối"
        onConfirm={async (r) => { try { await decideCompany(rej!.id, "rejected", r); toast.success("Đã từ chối doanh nghiệp", { description: rej!.name }); } catch (e) { toast.error("Thao tác không thành công", { description: (e as Error).message }); throw e; } }} />
    </div>
  );
}
