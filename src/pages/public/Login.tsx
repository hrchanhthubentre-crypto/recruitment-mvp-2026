import { Building2, FlaskConical, MailCheck, ShieldCheck, UserRound, ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { roleHome, roleLabel, useStore } from "@/lib/store";
import { isEmail } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { Alert, AuthShell, Pw } from "./authparts";

export default function Login() {
  const [sp, setSp] = useSearchParams(); const nav = useNavigate(); const { login, switchRole, logout } = useStore();
  const tab = (["candidate", "employer", "admin"].includes(sp.get("tab") ?? "") ? sp.get("tab") : "candidate") as Exclude<Role, "guest">;
  const [mode, setMode] = useState<"login" | "forgot">("login"); const [busy, setBusy] = useState(false); const [fail, setFail] = useState(""); const [errs, setErrs] = useState<Record<string, string>>({}); const [sent, setSent] = useState("");
  const [f, setF] = useState({ email: "", pw: "" });
  const up = (k: "email" | "pw") => (v: string) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: "" })); };
  const quick = (r: Exclude<Role, "guest">) => { switchRole(r); toast.success(`Đang xem với vai trò ${roleLabel[r].toLowerCase()} (mô phỏng)`); nav(roleHome[r]); };
  const doLogin = async (e: FormEvent) => {
    e.preventDefault(); const x: Record<string, string> = {};
    if (!isEmail(f.email)) x.email = "Vui lòng nhập email hợp lệ."; if (f.pw.length < 6) x.pw = "Mật khẩu tối thiểu 6 ký tự.";
    setErrs(x); setFail(""); if (Object.keys(x).length) return; setBusy(true);
    try { const u = await login(f.email, f.pw); if (u.role !== tab) { logout(); throw new Error(`Đây là tài khoản ${roleLabel[u.role].toLowerCase()}. Hãy chọn đúng thẻ đăng nhập ở trên.`); } toast.success(`Xin chào ${u.name} (đăng nhập mô phỏng)`); nav(roleHome[u.role]); }
    catch (er) { setFail((er as Error).message); toast.error("Đăng nhập không thành công"); } finally { setBusy(false); }
  };
  const doForgot = async (e: FormEvent) => { e.preventDefault(); if (!isEmail(f.email)) return setErrs({ email: "Vui lòng nhập email hợp lệ." }); setBusy(true); await new Promise((r) => setTimeout(r, 700)); setBusy(false); setSent(f.email); };
  const hint = { candidate: "ungvien@demo.example", employer: "nhatuyendung@demo.example", admin: "quantri@demo.example" }[tab];
  return (
    <AuthShell title={mode === "forgot" ? "Quên mật khẩu" : "Đăng nhập"} desc={mode === "forgot" ? "Nhập email để nhận hướng dẫn đặt lại mật khẩu." : "Chào mừng bạn quay lại. Chọn loại tài khoản để tiếp tục."}
      points={["Lưu việc làm và theo dõi trạng thái hồ sơ", "Nhà tuyển dụng quản lý tin và ứng viên tại một nơi", "Bản xem trước: không có xác thực hay máy chủ thật"]}
      side={<div className="rounded-card border border-gold bg-butter-soft p-5"><p className="flex items-center gap-2 text-sm font-semibold text-gold-ink"><FlaskConical className="h-4 w-4" />Xem thử theo vai trò</p><p className="mb-4 mt-2 text-sm text-ink-soft">Vào ngay bằng tài khoản mẫu, không cần nhập gì.</p>
        <div className="space-y-2.5">{([["candidate", "Ứng viên", <UserRound key="a" />], ["employer", "Nhà tuyển dụng", <Building2 key="b" />], ["admin", "Quản trị viên", <ShieldCheck key="c" />]] as const).map(([r, l, ic]) => (
          <button key={r} onClick={() => quick(r)} className="flex w-full items-center gap-3 rounded-ctl border border-line bg-paper p-3.5 text-left transition-colors hover:border-ink"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-ctl bg-butter [&>svg]:h-5 [&>svg]:w-5">{ic}</span><span className="text-sm font-semibold">Đăng nhập nhanh: {l}</span></button>))}</div></div>}>
      <Tabs value={tab} onValueChange={(t) => { setSp({ tab: t }, { replace: true }); setErrs({}); setFail(""); setMode("login"); setSent(""); }}>
        <TabsList className="mb-6"><TabsTrigger value="candidate">Ứng viên</TabsTrigger><TabsTrigger value="employer">Nhà tuyển dụng</TabsTrigger><TabsTrigger value="admin">Quản trị</TabsTrigger></TabsList>
        {(["candidate", "employer", "admin"] as const).map((t) => <TabsContent key={t} value={t}>
          {mode === "login" ? (
            <form onSubmit={doLogin} noValidate className="space-y-4">
              {fail && <Alert text={fail} />}
              <Field label="Email" required error={errs.email}>{(p) => <Input type="email" autoComplete="email" value={f.email} onChange={(e) => up("email")(e.target.value)} placeholder="ten@email.com" {...p} />}</Field>
              <Pw label="Mật khẩu" value={f.pw} onChange={up("pw")} error={errs.pw} />
              <div className="flex justify-end"><button type="button" className="text-sm font-medium text-gold-ink hover:underline" onClick={() => { setMode("forgot"); setErrs({}); setFail(""); }}>Quên mật khẩu?</button></div>
              <Button type="submit" size="lg" className="w-full" loading={busy}>Đăng nhập</Button>
              <p className="text-center text-[13px] text-ink-mute">Mô phỏng: dùng <b>{hint}</b> với mật khẩu <b>demo1234</b>, hoặc nút “Đăng nhập nhanh”.</p>
              {t !== "admin" && <p className="text-center text-sm text-ink-soft">Chưa có tài khoản? <Link to={`/dang-ky?tab=${t}`} className="font-semibold text-gold-ink hover:underline">Đăng ký {t === "candidate" ? "ứng viên" : "doanh nghiệp"}</Link></p>}
            </form>
          ) : sent ? (
            <div className="py-6 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-ok"><MailCheck className="h-6 w-6" /></div><h2 className="text-lg font-semibold">Đã ghi nhận yêu cầu</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">Đây là bản mô phỏng nên <b>không có email nào được gửi đến {sent}</b>. Khi có máy chủ thật, hướng dẫn sẽ được gửi tới email của bạn.</p><Button variant="outline" className="mt-5" onClick={() => { setMode("login"); setSent(""); }}>Quay lại đăng nhập</Button></div>
          ) : (
            <form onSubmit={doForgot} noValidate className="space-y-4">
              <Field label="Email đã đăng ký" required error={errs.email}>{(p) => <Input type="email" value={f.email} onChange={(e) => up("email")(e.target.value)} placeholder="ten@email.com" {...p} />}</Field>
              <Button type="submit" size="lg" className="w-full" loading={busy}>Gửi hướng dẫn</Button>
              <button type="button" className="mx-auto flex items-center gap-1.5 text-sm font-medium hover:text-gold-ink" onClick={() => setMode("login")}><ArrowLeft className="h-4 w-4" />Quay lại đăng nhập</button>
            </form>)}
        </TabsContent>)}
      </Tabs>
    </AuthShell>
  );
}
