import { Bell, BellOff, CheckCheck, Mail, Send, Briefcase, Info, Undo2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Switch } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { Badge, EmptyState, PageHeader } from "@/components/shared/common";
import { Card } from "@/components/shared/cards";
import { useStore } from "@/lib/store";
import { isPhone, relTime } from "@/lib/utils";
import type { Prefs } from "@/lib/types";

const ICON = { apply: <Send />, status: <Info />, job: <Briefcase />, system: <Bell /> };

function Contact() {
  const { user, updateAccount } = useStore(); const [name, setName] = useState(user?.name ?? ""); const [phone, setPhone] = useState(user?.phone ?? ""); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  if (!user) return null;
  const save = async () => {
    const x: Record<string, string> = {}; if (name.trim().length < 2) x.name = "Vui lòng nhập họ tên."; if (phone && !isPhone(phone)) x.phone = "Số điện thoại chưa hợp lệ (ví dụ 0901234567).";
    setE(x); if (Object.keys(x).length) return; setBusy(true);
    try { await updateAccount({ name: name.trim(), phone }); toast.success("Đã cập nhật thông tin liên hệ (mô phỏng)"); } catch (er) { toast.error("Chưa lưu được", { description: (er as Error).message }); } finally { setBusy(false); }
  };
  return (
    <Card className="max-w-2xl"><h2 className="font-semibold">Thông tin tài khoản</h2><p className="mb-5 mt-1 text-sm text-ink-soft">Thông tin liên hệ được dùng khi bạn ứng tuyển. Email đăng nhập không thể đổi trong bản xem trước.</p>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Họ và tên" required error={e.name}>{(p) => <Input value={name} onChange={(x) => { setName(x.target.value); setE({}); }} {...p} />}</Field>
        <Field label="Số điện thoại" error={e.phone}>{(p) => <Input type="tel" value={phone} onChange={(x) => { setPhone(x.target.value); setE({}); }} placeholder="0901234567" {...p} />}</Field>
        <Field label="Email đăng nhập" className="sm:col-span-2">{(p) => <Input value={user.email} readOnly disabled {...p} />}</Field></div>
      <div className="mt-5 flex justify-end"><Button loading={busy} onClick={save}>Lưu thay đổi</Button></div></Card>
  );
}

function Notifs() {
  const { myNotifications, markRead, markAllRead } = useStore(); const [only, setOnly] = useState(false);
  const list = myNotifications.filter((n) => !only || !n.read); const unread = myNotifications.filter((n) => !n.read).length;
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2" role="group" aria-label="Lọc thông báo"><Button size="sm" variant={!only ? "dark" : "outline"} onClick={() => setOnly(false)}>Tất cả ({myNotifications.length})</Button><Button size="sm" variant={only ? "dark" : "outline"} onClick={() => setOnly(true)}>Chưa đọc ({unread})</Button></div>
        <Button size="sm" variant="outline" disabled={!unread} onClick={() => { markAllRead(); toast.success("Đã đánh dấu tất cả là đã đọc"); }}><CheckCheck className="h-4 w-4" />Đọc tất cả</Button></div>
      {list.length === 0 ? <EmptyState icon={<BellOff className="h-6 w-6" />} title={only ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"} text="Thông báo về hồ sơ ứng tuyển sẽ xuất hiện tại đây (mẫu)." /> :
        <ul className="space-y-2.5">{list.map((n) => (
          <li key={n.id} className={`flex gap-4 rounded-card border p-4 ${n.read ? "border-line bg-paper" : "border-gold bg-butter-soft"}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-butter text-gold-ink [&>svg]:h-[18px] [&>svg]:w-[18px]">{ICON[n.kind]}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold leading-snug">{n.title}</p>{!n.read && <Badge tone="gold">Mới</Badge>}</div><p className="mt-1 text-sm leading-relaxed text-ink-soft">{n.body}</p><p className="mt-1.5 text-xs text-ink-mute">{relTime(n.at)}</p></div>
            <Button variant="ghost" size="sm" onClick={() => markRead(n.id, !n.read)} aria-label={n.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}>{n.read ? <Undo2 className="h-4 w-4" /> : <CheckCheck className="h-4 w-4" />}</Button>
          </li>))}</ul>}
    </div>
  );
}

function Settings() {
  const { prefsOf, savePrefs } = useStore(); const [p, setP] = useState<Prefs>(prefsOf); const [busy, setBusy] = useState(false);
  const rows: [keyof Prefs, string, string][] = [["inApp", "Thông báo trong trang", "Hiển thị chuông thông báo khi có cập nhật."], ["emailStatus", "Email khi hồ sơ đổi trạng thái", "Nhận email khi nhà tuyển dụng xem hoặc mời phỏng vấn."], ["emailJobs", "Gợi ý việc làm phù hợp", "Tổng hợp việc làm mới theo vị trí mong muốn."], ["emailNews", "Bản tin cẩm nang nghề nghiệp", "Bài viết mới về CV, phỏng vấn và định hướng."]];
  const save = async () => { setBusy(true); try { await savePrefs(p); toast.success("Đã lưu cài đặt thông báo (mô phỏng, không có email thật)"); } catch (er) { toast.error("Chưa lưu được", { description: (er as Error).message }); } finally { setBusy(false); } };
  return (
    <Card className="max-w-2xl"><h2 className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" />Cài đặt nhận thông báo</h2><p className="mb-2 mt-1 text-sm text-ink-soft">Bản xem trước không gửi email thật; cài đặt chỉ được lưu trong trình duyệt.</p>
      <ul className="divide-y divide-line-soft">{rows.map(([k, t, d]) => <li key={k} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium">{t}</p><p className="text-sm text-ink-soft">{d}</p></div><Switch checked={p[k]} onChange={(v) => setP({ ...p, [k]: v })} label={t} /></li>)}</ul>
      <div className="mt-2 flex justify-end"><Button loading={busy} onClick={save}>Lưu cài đặt</Button></div></Card>
  );
}

export default function Account() {
  const [sp, setSp] = useSearchParams(); const tab = ["account", "notifications", "settings"].includes(sp.get("tab") ?? "") ? sp.get("tab")! : "account";
  return (
    <div><PageHeader title="Tài khoản & thông báo" desc="Quản lý thông tin liên hệ, xem thông báo ứng tuyển và chọn cách nhận thông báo." />
      <Tabs value={tab} onValueChange={(t) => setSp({ tab: t }, { replace: true })}>
        <TabsList className="mb-6"><TabsTrigger value="account">Tài khoản</TabsTrigger><TabsTrigger value="notifications">Thông báo</TabsTrigger><TabsTrigger value="settings">Cài đặt thông báo</TabsTrigger></TabsList>
        <TabsContent value="account"><Contact /></TabsContent><TabsContent value="notifications"><Notifs /></TabsContent><TabsContent value="settings"><Settings /></TabsContent>
      </Tabs></div>
  );
}
