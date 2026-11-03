import { Eye, EyeOff, FlaskConical, MailCheck, ShieldCheck, UserRound, Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { roleHome, useStore } from "@/lib/store";
import { isEmail } from "@/lib/utils";
import type { Role } from "@/lib/types";

type Errs = Record<string, string>;
function Pw({ label, value, onChange, error, id }: { label: string; value: string; onChange: (v: string) => void; error?: string; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required error={error}>{(p) => (
      <div className="relative"><Input {...p} id={id ?? p.id} type={show ? "text" : "password"} autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} className="pr-11" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:bg-butter">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>)}</Field>
  );
}
const Alert = ({ text }: { text: string }) => <div role="alert" className="flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{text}</div>;

export default function Auth() {
  const [sp, setSp] = useSearchParams(); const nav = useNavigate();
  const { login, registerCandidate, registerEmployer, switchRole, catalogs } = useStore();
  const tab = sp.get("tab") ?? "login";
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [busy, setBusy] = useState(false); const [fail, setFail] = useState(""); const [errs, setErrs] = useState<Errs>({}); const [sent, setSent] = useState("");
  const [f, setF] = useState({ email: "", pw: "", pw2: "", name: "", company: "", tax: "", industry: "", city: "", agree: false });
  const up = (k: keyof typeof f) => (v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: "" })); };
  const changeTab = (t: string) => { setSp({ tab: t }, { replace: true }); setErrs({}); setFail(""); setMode("login"); setSent(""); };
  const quick = (r: Exclude<Role, "guest">) => { switchRole(r); toast.success("Đăng nhập mô phỏng thành công"); nav(roleHome[r]); };
  const wrap = async (fn: () => Promise<void>) => { setBusy(true); setFail(""); try { await fn(); } catch (e) { setFail((e as Error).message); toast.error("Thao tác không thành công"); } finally { setBusy(false); } };

  const doLogin = (e: FormEvent) => {
    e.preventDefault(); const x: Errs = {};
    if (!isEmail(f.email)) x.email = "Vui lòng nhập email hợp lệ."; if (f.pw.length < 6) x.pw = "Mật khẩu tối thiểu 6 ký tự.";
    setErrs(x); if (Object.keys(x).length) return;
    wrap(async () => { const u = await login(f.email, f.pw); toast.success(`Xin chào ${u.name} (đăng nhập mô phỏng)`); nav(roleHome[u.role]); });
  };
  const doForgot = (e: FormEvent) => { e.preventDefault(); if (!isEmail(f.email)) return setErrs({ email: "Vui lòng nhập email hợp lệ." }); wrap(async () => { await new Promise((r) => setTimeout(r, 700)); setSent(f.email); }); };
  const common = (x: Errs) => { if (!isEmail(f.email)) x.email = "Vui lòng nhập email hợp lệ."; if (f.pw.length < 8) x.pw = "Mật khẩu tối thiểu 8 ký tự."; if (f.pw2 !== f.pw) x.pw2 = "Mật khẩu nhập lại không khớp."; if (f.name.trim().length < 2) x.name = "Vui lòng nhập họ tên."; if (!f.agree) x.agree = "Bạn cần đồng ý với điều khoản sử dụng."; };
  const regCand = (e: FormEvent) => { e.preventDefault(); const x: Errs = {}; common(x); setErrs(x); if (Object.keys(x).length) return; wrap(async () => { await registerCandidate(f.name.trim(), f.email.trim()); toast.success("Đăng ký ứng viên thành công (mô phỏng)"); nav(roleHome.candidate); }); };
  const regEmp = (e: FormEvent) => {
    e.preventDefault(); const x: Errs = {}; common(x);
    if (f.company.trim().length < 3) x.company = "Vui lòng nhập tên doanh nghiệp."; if (!/^\d{10}(\d{3})?$/.test(f.tax.replace(/[\s-]/g, ""))) x.tax = "Mã số thuế gồm 10 hoặc 13 chữ số.";
    if (!f.industry) x.industry = "Vui lòng chọn ngành nghề."; if (!f.city) x.city = "Vui lòng chọn địa điểm.";
    setErrs(x); if (Object.keys(x).length) return;
    wrap(async () => { await registerEmployer({ name: f.name.trim(), email: f.email.trim(), company: f.company.trim(), taxCode: f.tax.replace(/[\s-]/g, ""), industry: f.industry, city: f.city }); toast.success("Đã tạo tài khoản và hồ sơ doanh nghiệp (mô phỏng)", { description: "Doanh nghiệp sẽ ở trạng thái chờ duyệt." }); nav(roleHome.employer); });
  };
  const cats = catalogs.categories.filter((c) => c.active), locs = catalogs.locations.filter((c) => c.active);
  const Sub = ({ children }: { children: string }) => <Button type="submit" size="lg" className="w-full" loading={busy}>{children}</Button>;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_380px]">
      <div className="rounded-card border border-line bg-paper p-5 shadow-soft sm:p-8">
        <h1 className="text-2xl font-bold">{mode === "forgot" ? "Quên mật khẩu" : "Chào mừng bạn"}</h1>
        <p className="mb-6 mt-1 text-ink-soft">{mode === "forgot" ? "Nhập email để nhận hướng dẫn đặt lại mật khẩu." : "Đăng nhập hoặc tạo tài khoản để tiếp tục."}</p>
        <Tabs value={tab} onValueChange={changeTab}>
          <TabsList className="mb-6"><TabsTrigger value="login">Đăng nhập</TabsTrigger><TabsTrigger value="candidate">Đăng ký ứng viên</TabsTrigger><TabsTrigger value="employer">Đăng ký nhà tuyển dụng</TabsTrigger></TabsList>

          <TabsContent value="login">
            {mode === "login" ? (
              <form onSubmit={doLogin} noValidate className="space-y-4">
                {fail && <Alert text={fail} />}
                <Field label="Email" required error={errs.email}>{(p) => <Input type="email" autoComplete="email" value={f.email} onChange={(e) => up("email")(e.target.value)} placeholder="ten@email.com" {...p} />}</Field>
                <Pw label="Mật khẩu" value={f.pw} onChange={up("pw") as (v: string) => void} error={errs.pw} />
                <div className="flex justify-end"><button type="button" className="text-sm font-medium text-gold-ink hover:underline" onClick={() => { setMode("forgot"); setErrs({}); setFail(""); }}>Quên mật khẩu?</button></div>
                <Sub>Đăng nhập</Sub>
                <p className="text-center text-[13px] text-ink-mute">Mô phỏng: dùng tài khoản mẫu bên phải (mật khẩu <b>demo1234</b>) hoặc nút “Đăng nhập nhanh”.</p>
              </form>
            ) : sent ? (
              <div className="py-6 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-ok"><MailCheck className="h-6 w-6" /></div>
                <h2 className="text-lg font-semibold">Đã ghi nhận yêu cầu</h2><p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">Đây là bản mô phỏng nên <b>không có email nào được gửi đến {sent}</b>. Khi có máy chủ thật, hướng dẫn sẽ được gửi tới email của bạn.</p>
                <Button variant="outline" className="mt-5" onClick={() => { setMode("login"); setSent(""); }}>Quay lại đăng nhập</Button></div>
            ) : (
              <form onSubmit={doForgot} noValidate className="space-y-4">
                <Field label="Email đã đăng ký" required error={errs.email}>{(p) => <Input type="email" value={f.email} onChange={(e) => up("email")(e.target.value)} placeholder="ten@email.com" {...p} />}</Field>
                <Sub>Gửi hướng dẫn</Sub>
                <button type="button" className="mx-auto flex items-center gap-1.5 text-sm font-medium hover:text-gold-ink" onClick={() => setMode("login")}><ArrowLeft className="h-4 w-4" />Quay lại đăng nhập</button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="candidate">
            <form onSubmit={regCand} noValidate className="space-y-4">
              {fail && <Alert text={fail} />}
              <Field label="Họ và tên" required error={errs.name}>{(p) => <Input autoComplete="name" value={f.name} onChange={(e) => up("name")(e.target.value)} {...p} />}</Field>
              <Field label="Email" required error={errs.email}>{(p) => <Input type="email" autoComplete="email" value={f.email} onChange={(e) => up("email")(e.target.value)} {...p} />}</Field>
              <div className="grid gap-4 sm:grid-cols-2"><Pw label="Mật khẩu" value={f.pw} onChange={up("pw") as (v: string) => void} error={errs.pw} /><Pw label="Nhập lại mật khẩu" value={f.pw2} onChange={up("pw2") as (v: string) => void} error={errs.pw2} /></div>
              <div><Check checked={f.agree} onChange={up("agree") as (v: boolean) => void}>Tôi đồng ý với điều khoản sử dụng (mô phỏng)</Check>{errs.agree && <p role="alert" className="text-[13px] text-bad">{errs.agree}</p>}</div>
              <Sub>Tạo tài khoản ứng viên</Sub>
            </form>
          </TabsContent>

          <TabsContent value="employer">
            <form onSubmit={regEmp} noValidate className="space-y-4">
              {fail && <Alert text={fail} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Họ tên người đại diện" required error={errs.name}>{(p) => <Input value={f.name} onChange={(e) => up("name")(e.target.value)} {...p} />}</Field>
                <Field label="Email công việc" required error={errs.email}>{(p) => <Input type="email" value={f.email} onChange={(e) => up("email")(e.target.value)} {...p} />}</Field>
              </div>
              <Field label="Tên doanh nghiệp" required error={errs.company}>{(p) => <Input value={f.company} onChange={(e) => up("company")(e.target.value)} {...p} />}</Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Mã số thuế" required error={errs.tax} hint="Dùng số mẫu, không nhập mã thật">{(p) => <Input inputMode="numeric" value={f.tax} onChange={(e) => up("tax")(e.target.value)} {...p} />}</Field>
                <Field label="Ngành nghề" required error={errs.industry}>{(p) => <Select value={f.industry} onChange={(e) => up("industry")(e.target.value)} {...p}><option value="">Chọn ngành</option>{cats.map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
                <Field label="Địa điểm" required error={errs.city}>{(p) => <Select value={f.city} onChange={(e) => up("city")(e.target.value)} {...p}><option value="">Chọn nơi</option>{locs.map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2"><Pw label="Mật khẩu" value={f.pw} onChange={up("pw") as (v: string) => void} error={errs.pw} /><Pw label="Nhập lại mật khẩu" value={f.pw2} onChange={up("pw2") as (v: string) => void} error={errs.pw2} /></div>
              <div><Check checked={f.agree} onChange={up("agree") as (v: boolean) => void}>Tôi đồng ý với điều khoản sử dụng (mô phỏng)</Check>{errs.agree && <p role="alert" className="text-[13px] text-bad">{errs.agree}</p>}</div>
              <Sub>Tạo tài khoản nhà tuyển dụng</Sub>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="h-fit rounded-card border border-gold bg-butter p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold-ink"><FlaskConical className="h-4 w-4" />Chế độ đăng nhập mô phỏng</p>
        <p className="mb-4 mt-2 text-sm text-ink-soft">Trải nghiệm từng vai trò chỉ với một lần bấm. Không có xác thực thật.</p>
        <div className="space-y-2.5">
          {([["candidate", "Ứng viên", "ungvien@demo.example", <UserRound key="a" />], ["employer", "Nhà tuyển dụng", "nhatuyendung@demo.example", <Building2 key="b" />], ["admin", "Quản trị viên", "quantri@demo.example", <ShieldCheck key="c" />]] as const).map(([r, l, em, ic]) => (
            <button key={r} onClick={() => quick(r)} className="flex w-full items-center gap-3 rounded-ctl border border-line bg-paper p-3.5 text-left transition-colors hover:border-ink">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ctl bg-butter [&>svg]:h-5 [&>svg]:w-5">{ic}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold">Đăng nhập nhanh: {l}</span><span className="block truncate text-xs text-ink-mute">{em}</span></span>
            </button>))}
        </div>
      </aside>
    </div>
  );
}
