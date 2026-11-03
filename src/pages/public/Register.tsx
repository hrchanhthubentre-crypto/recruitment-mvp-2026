import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlay";
import { roleHome, useStore } from "@/lib/store";
import { isEmail } from "@/lib/utils";
import { Alert, AuthShell, Pw } from "./authparts";

export default function Register() {
  const [sp, setSp] = useSearchParams(); const nav = useNavigate(); const { registerCandidate, registerEmployer, catalogs } = useStore();
  const tab = sp.get("tab") === "employer" ? "employer" : "candidate";
  const [busy, setBusy] = useState(false); const [fail, setFail] = useState(""); const [errs, setErrs] = useState<Record<string, string>>({});
  const [f, setF] = useState({ email: "", pw: "", pw2: "", name: "", company: "", tax: "", industry: "", city: "", agree: false });
  const up = (k: keyof typeof f) => (v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: "" })); };
  const wrap = async (fn: () => Promise<void>) => { setBusy(true); setFail(""); try { await fn(); } catch (e) { setFail((e as Error).message); toast.error("Thao tác không thành công"); } finally { setBusy(false); } };
  const common = (x: Record<string, string>) => { if (!isEmail(f.email)) x.email = "Vui lòng nhập email hợp lệ."; if (f.pw.length < 8) x.pw = "Mật khẩu tối thiểu 8 ký tự."; if (f.pw2 !== f.pw) x.pw2 = "Mật khẩu nhập lại không khớp."; if (f.name.trim().length < 2) x.name = "Vui lòng nhập họ tên."; if (!f.agree) x.agree = "Bạn cần đồng ý với điều khoản sử dụng."; };
  const regCand = (e: FormEvent) => { e.preventDefault(); const x: Record<string, string> = {}; common(x); setErrs(x); if (Object.keys(x).length) return; wrap(async () => { await registerCandidate(f.name.trim(), f.email.trim()); toast.success("Đăng ký ứng viên thành công (mô phỏng)"); nav(roleHome.candidate); }); };
  const regEmp = (e: FormEvent) => {
    e.preventDefault(); const x: Record<string, string> = {}; common(x);
    if (f.company.trim().length < 3) x.company = "Vui lòng nhập tên doanh nghiệp."; if (!/^\d{10}(\d{3})?$/.test(f.tax.replace(/[\s-]/g, ""))) x.tax = "Mã số thuế gồm 10 hoặc 13 chữ số."; if (!f.industry) x.industry = "Vui lòng chọn ngành nghề."; if (!f.city) x.city = "Vui lòng chọn địa điểm.";
    setErrs(x); if (Object.keys(x).length) return;
    wrap(async () => { await registerEmployer({ name: f.name.trim(), email: f.email.trim(), company: f.company.trim(), taxCode: f.tax.replace(/[\s-]/g, ""), industry: f.industry, city: f.city }); toast.success("Đã tạo tài khoản và hồ sơ doanh nghiệp (mô phỏng)", { description: "Doanh nghiệp sẽ ở trạng thái chờ duyệt." }); nav(roleHome.employer); });
  };
  const cats = catalogs.categories.filter((c) => c.active), locs = catalogs.locations.filter((c) => c.active);
  const Agree = <div><Check checked={f.agree} onChange={up("agree") as (v: boolean) => void}>Tôi đồng ý với điều khoản sử dụng (mô phỏng)</Check>{errs.agree && <p role="alert" className="text-[13px] text-bad">{errs.agree}</p>}</div>;
  const Pws = <div className="grid gap-4 sm:grid-cols-2"><Pw label="Mật khẩu" value={f.pw} onChange={up("pw") as (v: string) => void} error={errs.pw} /><Pw label="Nhập lại mật khẩu" value={f.pw2} onChange={up("pw2") as (v: string) => void} error={errs.pw2} /></div>;
  return (
    <AuthShell title="Tạo tài khoản" desc="Chỉ mất một phút. Dữ liệu chỉ lưu trong trình duyệt của bạn (mô phỏng)." points={tab === "candidate" ? ["Tạo hồ sơ một lần, ứng tuyển nhiều nơi", "Nhận thông báo khi hồ sơ đổi trạng thái", "Lưu việc làm để xem lại sau"] : ["Đăng tin, lưu nháp và xem trước trước khi gửi duyệt", "Theo dõi lượt xem và ứng tuyển của từng tin", "Quản lý ứng viên và ghi chú nội bộ"]}>
      <Tabs value={tab} onValueChange={(t) => { setSp({ tab: t }, { replace: true }); setErrs({}); setFail(""); }}>
        <TabsList className="mb-6"><TabsTrigger value="candidate">Ứng viên</TabsTrigger><TabsTrigger value="employer">Doanh nghiệp</TabsTrigger></TabsList>
        <TabsContent value="candidate"><form onSubmit={regCand} noValidate className="space-y-4">
          {fail && <Alert text={fail} />}
          <Field label="Họ và tên" required error={errs.name}>{(p) => <Input autoComplete="name" value={f.name} onChange={(e) => up("name")(e.target.value)} {...p} />}</Field>
          <Field label="Email" required error={errs.email}>{(p) => <Input type="email" autoComplete="email" value={f.email} onChange={(e) => up("email")(e.target.value)} {...p} />}</Field>
          {Pws}{Agree}<Button type="submit" size="lg" className="w-full" loading={busy}>Tạo tài khoản ứng viên</Button>
          <p className="text-center text-sm text-ink-soft">Đã có tài khoản? <Link to="/dang-nhap" className="font-semibold text-gold-ink hover:underline">Đăng nhập</Link></p></form></TabsContent>
        <TabsContent value="employer"><form onSubmit={regEmp} noValidate className="space-y-4">
          {fail && <Alert text={fail} />}
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Họ tên người đại diện" required error={errs.name}>{(p) => <Input value={f.name} onChange={(e) => up("name")(e.target.value)} {...p} />}</Field><Field label="Email công việc" required error={errs.email}>{(p) => <Input type="email" value={f.email} onChange={(e) => up("email")(e.target.value)} {...p} />}</Field></div>
          <Field label="Tên doanh nghiệp" required error={errs.company}>{(p) => <Input value={f.company} onChange={(e) => up("company")(e.target.value)} {...p} />}</Field>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Mã số thuế" required error={errs.tax} hint="Dùng số mẫu, không nhập mã thật">{(p) => <Input inputMode="numeric" value={f.tax} onChange={(e) => up("tax")(e.target.value)} {...p} />}</Field>
            <Field label="Ngành nghề" required error={errs.industry}>{(p) => <Select value={f.industry} onChange={(e) => up("industry")(e.target.value)} {...p}><option value="">Chọn ngành</option>{cats.map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field>
            <Field label="Địa điểm" required error={errs.city}>{(p) => <Select value={f.city} onChange={(e) => up("city")(e.target.value)} {...p}><option value="">Chọn nơi</option>{locs.map((c) => <option key={c.id}>{c.name}</option>)}</Select>}</Field></div>
          {Pws}{Agree}<Button type="submit" size="lg" className="w-full" loading={busy}>Tạo tài khoản doanh nghiệp</Button>
          <p className="text-center text-sm text-ink-soft">Đã có tài khoản? <Link to="/dang-nhap?tab=employer" className="font-semibold text-gold-ink hover:underline">Đăng nhập</Link></p></form></TabsContent>
      </Tabs>
    </AuthShell>
  );
}
