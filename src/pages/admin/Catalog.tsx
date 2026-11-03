import { Ban, Pencil, Plus, RotateCcw, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Badge, EmptyState, ErrorState, PageHeader, Skeleton } from "@/components/shared/common";
import { useStore } from "@/lib/store";
import { useFakeLoad } from "@/lib/hooks";
import { isEmail, uid } from "@/lib/utils";
import type { CatalogItem, CatalogKey, Settings } from "@/lib/types";

const META: Record<CatalogKey, { label: string; field: "category" | "location" | "type" | "level" | "experience"; hint: string }> = {
  categories: { label: "Ngành nghề", field: "category", hint: "Ví dụ: Y tế – Dược" },
  locations: { label: "Địa điểm", field: "location", hint: "Ví dụ: Huế" },
  types: { label: "Hình thức làm việc", field: "type", hint: "Ví dụ: Làm việc hybrid" },
  levels: { label: "Cấp bậc", field: "level", hint: "Ví dụ: Giám đốc" },
  experiences: { label: "Kinh nghiệm", field: "experience", hint: "Ví dụ: Trên 10 năm" },
};

function CatalogPanel({ k }: { k: CatalogKey }) {
  const { catalogs, jobs, catalogSave, catalogToggle } = useStore(); const m = META[k]; const items = catalogs[k];
  const [dlg, setDlg] = useState<{ item: CatalogItem; isNew: boolean; prev: string } | null>(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const used = (name: string) => jobs.filter((j) => j[m.field] === name).length;
  const save = async () => {
    const name = dlg!.item.name.trim();
    if (name.length < 2 || name.length > 50) return setErr("Tên cần từ 2 đến 50 ký tự.");
    if (items.some((x) => x.id !== dlg!.item.id && x.name.toLowerCase() === name.toLowerCase())) return setErr("Tên này đã tồn tại trong danh mục.");
    setBusy(true); try { await catalogSave(k, { ...dlg!.item, name }, dlg!.isNew ? undefined : dlg!.prev); toast.success(dlg!.isNew ? `Đã thêm “${name}”` : "Đã cập nhật danh mục"); setDlg(null); } catch (e) { toast.error("Chưa lưu được", { description: (e as Error).message }); } finally { setBusy(false); }
  };
  const toggle = async (x: CatalogItem) => { if (x.active && items.filter((i) => i.active).length <= 1) return void toast.error("Cần giữ lại ít nhất một mục đang sử dụng"); try { await catalogToggle(k, x.id); toast.success(x.active ? `Đã ngừng sử dụng “${x.name}”` : `Đã kích hoạt lại “${x.name}”`, { description: x.active ? "Mục này không còn xuất hiện trong bộ lọc và biểu mẫu mới." : undefined }); } catch (e) { toast.error("Chưa cập nhật được", { description: (e as Error).message }); } };
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm text-ink-soft">{items.filter((i) => i.active).length}/{items.length} mục đang sử dụng</p><Button onClick={() => { setErr(""); setDlg({ item: { id: uid(k), name: "", active: true }, isNew: true, prev: "" }); }}><Plus className="h-4 w-4" />Thêm mục</Button></div>
      {items.length === 0 ? <EmptyState title="Danh mục trống" /> : (
        <ul className="divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-paper shadow-soft">{items.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0 flex-1"><p className={x.active ? "font-medium" : "font-medium text-ink-mute line-through"}>{x.name}</p><p className="text-xs text-ink-mute">{used(x.name)} tin đang dùng</p></div>
            {!x.active && <Badge>Ngừng sử dụng</Badge>}
            <Button variant="ghost" size="sm" aria-label={`Sửa ${x.name}`} onClick={() => { setErr(""); setDlg({ item: x, isNew: false, prev: x.name }); }}><Pencil className="h-4 w-4" /><span className="hidden sm:inline">Sửa</span></Button>
            <Button variant={x.active ? "ghost" : "soft"} size="sm" aria-label={`${x.active ? "Ngừng sử dụng" : "Kích hoạt lại"} ${x.name}`} onClick={() => toggle(x)}>{x.active ? <><Ban className="h-4 w-4" /><span className="hidden sm:inline">Ngừng dùng</span></> : <><RotateCcw className="h-4 w-4" />Kích hoạt</>}</Button>
          </li>))}</ul>)}
      <Modal open={!!dlg} onOpenChange={(o) => !o && setDlg(null)} title={dlg?.isNew ? `Thêm ${m.label.toLowerCase()}` : `Sửa ${m.label.toLowerCase()}`} description={dlg && !dlg.isNew ? "Đổi tên sẽ cập nhật cả các tin tuyển dụng đang dùng mục này." : undefined}
        footer={<><Button variant="outline" onClick={() => setDlg(null)}>Hủy</Button><Button loading={busy} onClick={save}>Lưu</Button></>}>
        {dlg && <form onSubmit={(e) => { e.preventDefault(); save(); }}><Field label="Tên hiển thị" required error={err}>{(p) => <Input autoFocus value={dlg.item.name} onChange={(e) => { setDlg({ ...dlg, item: { ...dlg.item, name: e.target.value } }); setErr(""); }} placeholder={m.hint} {...p} />}</Field></form>}
      </Modal>
    </div>
  );
}

const ACC: Record<Settings["accent"], { label: string; c: string }> = { butter: { label: "Vàng nhạt (mặc định)", c: "#f4ce73" }, warm: { label: "Vàng ấm", c: "#f0c15a" }, honey: { label: "Vàng mật", c: "#e9b949" } };

function SettingsPanel() {
  const { settings, updateSettings } = useStore(); const [f, setF] = useState(settings); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  const save = async () => {
    const x: Record<string, string> = {}; if (f.siteName.trim().length < 2) x.siteName = "Tên hiển thị tối thiểu 2 ký tự."; if (!isEmail(f.supportEmail)) x.supportEmail = "Email chưa hợp lệ.";
    setE(x); if (Object.keys(x).length) return; setBusy(true);
    try { await updateSettings({ ...f, siteName: f.siteName.trim() }); toast.success("Đã áp dụng cấu hình giao diện"); } catch (er) { toast.error("Chưa lưu được", { description: (er as Error).message }); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-2xl space-y-6 rounded-card border border-line bg-paper p-5 shadow-soft sm:p-7">
      <div><h3 className="flex items-center gap-2 font-semibold"><Palette className="h-4 w-4" />Thiết lập giao diện & cấu hình cơ bản</h3><p className="mt-1 text-sm text-ink-soft">Thay đổi áp dụng ngay cho toàn bộ bản xem trước. Tên thương hiệu chỉ là tên tạm thời.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên thương hiệu hiển thị" required error={e.siteName}>{(p) => <Input value={f.siteName} onChange={(x) => { setF({ ...f, siteName: x.target.value }); setE({}); }} maxLength={30} {...p} />}</Field>
        <Field label="Email hỗ trợ" required error={e.supportEmail}>{(p) => <Input type="email" value={f.supportEmail} onChange={(x) => { setF({ ...f, supportEmail: x.target.value }); setE({}); }} {...p} />}</Field>
        <Field label="Số việc làm mỗi trang">{(p) => <Select value={f.perPage} onChange={(x) => setF({ ...f, perPage: Number(x.target.value) })} {...p}>{[4, 8, 12, 16].map((n) => <option key={n} value={n}>{n} tin / trang</option>)}</Select>}</Field>
        <Field label="Độ bo góc">{(p) => <Select value={f.radius} onChange={(x) => setF({ ...f, radius: x.target.value as Settings["radius"] })} {...p}><option value="sm">Nhỏ</option><option value="md">Vừa (mặc định)</option><option value="lg">Lớn</option></Select>}</Field>
      </div>
      <fieldset><legend className="mb-2 text-sm font-medium">Sắc độ vàng nhấn</legend>
        <div className="grid gap-2 sm:grid-cols-3">{(Object.keys(ACC) as Settings["accent"][]).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 rounded-ctl border border-line p-3 text-sm has-[:checked]:border-ink has-[:checked]:bg-butter-soft"><input type="radio" name="accent" className="accent-[#30343b]" checked={f.accent === k} onChange={() => setF({ ...f, accent: k })} /><span className="h-6 w-6 rounded-full border border-black/10" style={{ background: ACC[k].c }} />{ACC[k].label}</label>))}</div></fieldset>
      <div className="flex justify-end"><Button loading={busy} onClick={save}>Lưu cấu hình</Button></div>
    </div>
  );
}

export default function Catalog() {
  const { loading, error, retry } = useFakeLoad(400); const [tab, setTab] = useState("categories");
  return (
    <div>
      <PageHeader title="Danh mục & cấu hình" desc="Quản lý các danh mục dùng cho bộ lọc, biểu mẫu tin tuyển dụng và giao diện chung." />
      {error ? <ErrorState onRetry={retry} /> : loading ? <Skeleton className="h-96" /> : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">{(Object.keys(META) as CatalogKey[]).map((k) => <TabsTrigger key={k} value={k}>{META[k].label}</TabsTrigger>)}<TabsTrigger value="settings">Giao diện & cấu hình</TabsTrigger></TabsList>
          {(Object.keys(META) as CatalogKey[]).map((k) => <TabsContent key={k} value={k}><CatalogPanel k={k} /></TabsContent>)}
          <TabsContent value="settings"><SettingsPanel /></TabsContent>
        </Tabs>)}
    </div>
  );
}
