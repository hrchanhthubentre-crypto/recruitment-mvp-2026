import { Phone, Globe, Hash, Layers, Mail, MapPin, Pencil, Users, ExternalLink } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Badge, COMPANY_STATUS, CompanyLogo, ErrorState, PageHeader, Skeleton } from "@/components/shared/common";
import { BannerArt } from "@/components/shared/art";
import { useStore } from "@/lib/store";
import { SIZES } from "@/lib/seed";
import { useFakeLoad } from "@/lib/hooks";
import { isEmail } from "@/lib/utils";
import type { Company } from "@/lib/types";

export default function CompanyProfile() {
  const { company, updateCompany, catalogs } = useStore(); const { loading, error, retry } = useFakeLoad(400);
  const [edit, setEdit] = useState(false); const [f, setF] = useState<Company | null>(null); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  if (!company) return null;
  const start = () => { setF({ ...company }); setE({}); setEdit(true); };
  const u = <K extends keyof Company>(k: K, v: Company[K]) => { setF({ ...f!, [k]: v }); setE({ ...e, [k]: "" }); };
  const submit = async (ev: FormEvent) => {
    ev.preventDefault(); const x: Record<string, string> = {}; const c = f!;
    if (c.name.trim().length < 3) x.name = "Tên doanh nghiệp tối thiểu 3 ký tự."; if (!/^\d{10}(\d{3})?$/.test(c.taxCode.replace(/[\s-]/g, ""))) x.taxCode = "Mã số thuế gồm 10 hoặc 13 chữ số.";
    if (!isEmail(c.email)) x.email = "Email chưa hợp lệ."; if (!c.address.trim()) x.address = "Vui lòng nhập địa chỉ."; if (c.website && !/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(c.website)) x.website = "Website chưa hợp lệ (ví dụ congty.vn).";
    if (c.phone && !/^[\d\s.+()-]{8,16}$/.test(c.phone)) x.phone = "Số điện thoại chưa hợp lệ."; if (c.about.length > 1500) x.about = "Mô tả tối đa 1.500 ký tự.";
    setE(x); if (Object.keys(x).length) return;
    setBusy(true); try { await updateCompany(company.id, c); toast.success("Đã lưu hồ sơ doanh nghiệp (mô phỏng)"); setEdit(false); } catch (er) { toast.error("Chưa lưu được", { description: (er as Error).message }); } finally { setBusy(false); }
  };
  const rows = [[<Hash key="1" />, "Mã số thuế", company.taxCode], [<Layers key="2" />, "Ngành nghề", company.industry], [<Users key="3" />, "Quy mô nhân sự", company.size], [<MapPin key="4" />, "Địa chỉ", [company.address, company.city].filter(Boolean).join(", ") || "—"], [<Globe key="5" />, "Website", company.website || "—"], [<Mail key="6" />, "Email", company.email], [<Phone key="7" />, "Điện thoại", company.phone || "—"]];
  return (
    <div>
      <PageHeader title="Hồ sơ doanh nghiệp" desc="Thông tin này hiển thị trên trang doanh nghiệp và các tin tuyển dụng của bạn."
        actions={!edit && <><Link to={`/cong-ty/${company.id}`}><Button variant="outline"><ExternalLink className="h-4 w-4" />Xem trang công khai</Button></Link><Button onClick={start}><Pencil className="h-4 w-4" />Chỉnh sửa</Button></>} />
      {error ? <ErrorState onRetry={retry} /> : loading ? <Skeleton className="h-96" /> : !edit ? (
        <div className="overflow-hidden rounded-card border border-line bg-paper shadow-soft">
          <div className="h-32 sm:h-40"><BannerArt tone={company.banner ?? company.tone} seed={company.id} /></div>
          <div className="p-5 pt-0 sm:p-7 sm:pt-0">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end"><CompanyLogo name={company.name} tone={company.tone} size={88} className="border-4 border-paper shadow-soft" />
            <div><h2 className="text-xl font-bold">{company.name}</h2><div className="mt-2 flex items-center gap-2"><Badge tone={COMPANY_STATUS[company.status].tone}>{COMPANY_STATUS[company.status].label}</Badge></div></div></div>
          <dl className="mt-7 grid gap-5 sm:grid-cols-2">{rows.map(([i, k, v]) => <div key={k as string} className="flex gap-3"><span className="mt-0.5 text-ink-mute [&>svg]:h-4 [&>svg]:w-4">{i}</span><div className="min-w-0"><dt className="text-sm text-ink-mute">{k}</dt><dd className="break-words font-medium">{v}</dd></div></div>)}</dl>
          <div className="mt-7 border-t border-line-soft pt-6"><h3 className="mb-2 font-semibold">Giới thiệu doanh nghiệp</h3>{company.about ? company.about.split("\n").filter(Boolean).map((p, i) => <p key={i} className="mb-2 leading-relaxed text-ink-soft">{p}</p>) : <p className="text-ink-mute">Chưa có phần giới thiệu. Hãy bấm “Chỉnh sửa” để bổ sung.</p>}</div>
          </div></div>
      ) : f && (
        <form onSubmit={submit} noValidate className="space-y-5 rounded-card border border-line bg-paper p-5 shadow-soft sm:p-7">
          <div className="flex flex-wrap items-center gap-4"><CompanyLogo name={f.name || "?"} tone={f.tone} size={64} />
            <fieldset><legend className="mb-1.5 text-sm font-medium">Banner doanh nghiệp</legend><div className="mb-3 flex gap-2">{[0, 1, 2, 3].map((t) => <button type="button" key={t} aria-label={`Banner ${t + 1}`} aria-pressed={(f.banner ?? f.tone) === t} onClick={() => u("banner", t)} className={`h-10 w-20 overflow-hidden rounded-ctl ${(f.banner ?? f.tone) === t ? "ring-2 ring-ink ring-offset-2" : ""}`}><BannerArt tone={t} seed={f.id} /></button>)}</div></fieldset>
            <fieldset><legend className="mb-1.5 text-sm font-medium">Màu logo (logo tạm lấy chữ cái đầu)</legend><div className="flex gap-2">{[0, 1, 2, 3].map((t) => <button type="button" key={t} aria-label={`Màu ${t + 1}`} aria-pressed={f.tone === t} onClick={() => u("tone", t)} className={`rounded-ctl p-0.5 ${f.tone === t ? "ring-2 ring-ink" : ""}`}><CompanyLogo name={f.name || "?"} tone={t} size={36} /></button>)}</div></fieldset></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên doanh nghiệp" required error={e.name} className="sm:col-span-2">{(p) => <Input value={f.name} onChange={(x) => u("name", x.target.value)} {...p} />}</Field>
            <Field label="Mã số thuế" required error={e.taxCode} hint="Dùng số mẫu, không nhập mã thật">{(p) => <Input inputMode="numeric" value={f.taxCode} onChange={(x) => u("taxCode", x.target.value)} {...p} />}</Field>
            <Field label="Ngành nghề" required>{(p) => <Select value={f.industry} onChange={(x) => u("industry", x.target.value)} {...p}>{catalogs.categories.filter((c) => c.active || c.name === f.industry).map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
            <Field label="Quy mô nhân sự" required>{(p) => <Select value={f.size} onChange={(x) => u("size", x.target.value)} {...p}>{SIZES.map((s) => <option key={s}>{s}</option>)}</Select>}</Field>
            <Field label="Tỉnh / thành" required>{(p) => <Select value={f.city} onChange={(x) => u("city", x.target.value)} {...p}>{catalogs.locations.filter((c) => c.active || c.name === f.city).map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
            <Field label="Địa chỉ" required error={e.address} className="sm:col-span-2">{(p) => <Input value={f.address} onChange={(x) => u("address", x.target.value)} {...p} />}</Field>
            <Field label="Website" error={e.website}>{(p) => <Input value={f.website} onChange={(x) => u("website", x.target.value)} placeholder="congty.vn" {...p} />}</Field>
            <Field label="Điện thoại liên hệ" error={e.phone}>{(p) => <Input type="tel" value={f.phone ?? ""} onChange={(x) => u("phone", x.target.value)} placeholder="024 0000 0000" {...p} />}</Field>
            <Field label="Email tuyển dụng" required error={e.email}>{(p) => <Input type="email" value={f.email} onChange={(x) => u("email", x.target.value)} {...p} />}</Field>
          </div>
          <Field label="Giới thiệu doanh nghiệp" error={e.about} hint={`${f.about.length}/1500 ký tự`}>{(p) => <Textarea rows={7} value={f.about} onChange={(x) => u("about", x.target.value)} {...p} />}</Field>
          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row"><Button variant="outline" onClick={() => setEdit(false)}>Hủy</Button><Button type="submit" loading={busy}>Lưu thay đổi</Button></div>
        </form>
      )}
    </div>
  );
}
