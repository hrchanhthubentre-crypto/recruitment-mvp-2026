import { Bookmark, Building2, ClipboardList, FileText, FolderCog, LayoutDashboard, ListChecks, LogOut, Menu as MenuIcon, ShieldCheck, Users, UserRound, FlaskConical, ChevronDown, Briefcase, Send, Lock } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, Menu, MenuCheck, MenuContent, MenuItem, MenuLabel, MenuRadio, MenuRadioGroup, MenuSep, MenuTrigger } from "@/components/ui/overlay";
import { Logo, Badge } from "@/components/shared/common";
import { roleHome, roleLabel, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ---------- Thanh xem trước: chuyển vai trò, mô phỏng lỗi, đặt lại dữ liệu ---------- */
export function PreviewBar() {
  const { role, switchRole, simulateError, setSimulateError, reset } = useStore();
  const nav = useNavigate();
  const go = (r: Role) => { switchRole(r); nav(roleHome[r]); toast.success(`Đang xem với vai trò: ${roleLabel[r]} (mô phỏng)`); };
  return (
    <div className="sticky top-0 z-40 h-10 bg-ink text-cream">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 text-[13px] sm:px-6">
        <p className="flex min-w-0 items-center gap-2"><FlaskConical className="h-4 w-4 shrink-0 text-gold" /><span className="truncate"><span className="hidden sm:inline">Bản xem trước giao diện · Dữ liệu mô phỏng, chưa kết nối máy chủ · </span><span className="sm:hidden">Xem trước · Dữ liệu mô phỏng</span></span></p>
        <Menu>
          <MenuTrigger className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 font-medium hover:bg-white/20" aria-label="Chuyển vai trò xem trước">
            <UserRound className="h-4 w-4" /> {roleLabel[role]} <ChevronDown className="h-3.5 w-3.5" />
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>Vai trò xem trước</MenuLabel>
            <MenuRadioGroup value={role} onValueChange={(v) => go(v as Role)}>
              {(["guest", "candidate", "employer", "admin"] as Role[]).map((r) => <MenuRadio key={r} value={r}>{roleLabel[r]}</MenuRadio>)}
            </MenuRadioGroup>
            <MenuSep />
            <MenuCheck checked={simulateError} onCheckedChange={(c) => { setSimulateError(c); toast(c ? "Đã bật mô phỏng lỗi mạng: các thao tác sẽ thất bại" : "Đã tắt mô phỏng lỗi mạng"); }}>Mô phỏng lỗi mạng</MenuCheck>
            <MenuItem onSelect={() => { reset(); nav("/"); toast.success("Đã đặt lại dữ liệu mẫu ban đầu"); }}>Đặt lại dữ liệu mẫu</MenuItem>
            <p className="px-3 pb-2 pt-1 text-xs leading-snug text-ink-mute">Chỉ là công cụ xem trước. Việc ẩn menu theo vai trò không phải phân quyền bảo mật thật.</p>
          </MenuContent>
        </Menu>
      </div>
    </div>
  );
}

const areaNav: Record<Exclude<Role, "guest">, { to: string; label: string; icon: ReactNode; end?: boolean }[]> = {
  candidate: [
    { to: "/ung-vien/ho-so", label: "Hồ sơ & CV", icon: <FileText /> },
    { to: "/ung-vien/da-luu", label: "Việc làm đã lưu", icon: <Bookmark /> },
    { to: "/ung-vien/da-ung-tuyen", label: "Đã ứng tuyển", icon: <Send /> },
  ],
  employer: [
    { to: "/nha-tuyen-dung", label: "Tổng quan", icon: <LayoutDashboard />, end: true },
    { to: "/nha-tuyen-dung/doanh-nghiep", label: "Hồ sơ doanh nghiệp", icon: <Building2 /> },
    { to: "/nha-tuyen-dung/tin-tuyen-dung", label: "Tin tuyển dụng", icon: <ClipboardList /> },
    { to: "/nha-tuyen-dung/ung-vien", label: "Quản lý ứng viên", icon: <Users /> },
  ],
  admin: [
    { to: "/quan-tri/kiem-duyet", label: "Kiểm duyệt tin", icon: <ShieldCheck /> },
    { to: "/quan-tri/nguoi-dung", label: "Công ty & người dùng", icon: <Users /> },
    { to: "/quan-tri/danh-muc", label: "Danh mục & cấu hình", icon: <FolderCog /> },
  ],
};

function UserMenu() {
  const { user, role, logout } = useStore();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <Menu>
      <MenuTrigger className="flex h-10 items-center gap-2 rounded-ctl border border-line bg-paper pl-1.5 pr-3 text-sm font-medium hover:border-gold" aria-label="Menu tài khoản">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold">{user.name.split(" ").slice(-1)[0][0]}</span>
        <span className="hidden max-w-32 truncate sm:block">{user.name}</span><ChevronDown className="h-3.5 w-3.5 text-ink-mute" />
      </MenuTrigger>
      <MenuContent>
        <div className="px-3 py-2"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-ink-mute">{roleLabel[role]}</p></div>
        <MenuSep />
        {areaNav[role as Exclude<Role, "guest">].map((n) => <MenuItem key={n.to} onSelect={() => nav(n.to)} icon={<span className="[&>svg]:h-4 [&>svg]:w-4 text-ink-mute">{n.icon}</span>}>{n.label}</MenuItem>)}
        <MenuSep />
        <MenuItem danger icon={<LogOut className="h-4 w-4" />} onSelect={() => { logout(); nav("/"); toast.success("Đã đăng xuất (mô phỏng)"); }}>Đăng xuất</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function Header() {
  const { role } = useStore();
  const [open, setOpen] = useState(false);
  const nav = useNavigate(); const loc = useLocation();
  const scrollHome = (id: string) => { setOpen(false); if (loc.pathname === "/") document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); else nav("/", { state: { scrollTo: id } }); };
  const link = ({ isActive }: { isActive: boolean }) => cn("rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors hover:bg-butter", isActive && "bg-butter font-semibold");
  const links = (
    <>
      <NavLink to="/" end className={link} onClick={() => setOpen(false)}>Trang chủ</NavLink>
      <NavLink to="/viec-lam" className={link} onClick={() => setOpen(false)}>Việc làm</NavLink>
      <button type="button" className={link({ isActive: false })} onClick={() => scrollHome("doanh-nghiep")}>Doanh nghiệp</button>
      {role === "guest" && <NavLink to="/dang-nhap?tab=employer" className={link} onClick={() => setOpen(false)}>Dành cho nhà tuyển dụng</NavLink>}
    </>
  );
  return (
    <header className="sticky top-10 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Điều hướng chính" className="ml-6 hidden items-center gap-1 lg:flex">{links}</nav>
        <div className="ml-auto flex items-center gap-2">
          {role === "guest" ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => nav("/dang-nhap")}>Đăng nhập</Button>
              <Button size="sm" onClick={() => nav("/dang-nhap?tab=candidate")}>Đăng ký</Button>
            </>
          ) : <UserMenu />}
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Mở menu" onClick={() => setOpen(true)}><MenuIcon className="h-5 w-5" /></Button>
        </div>
      </div>
      <Drawer open={open} onOpenChange={setOpen} title="Menu" width="max-w-xs">
        <nav aria-label="Điều hướng di động" className="flex flex-col gap-1 [&>*]:justify-start [&>*]:text-left [&>*]:text-base [&>*]:py-3">{links}</nav>
        {role === "guest" && <div className="mt-6 grid gap-2"><Button variant="outline" onClick={() => { setOpen(false); nav("/dang-nhap"); }}>Đăng nhập</Button><Button onClick={() => { setOpen(false); nav("/dang-nhap?tab=candidate"); }}>Đăng ký ứng viên</Button></div>}
      </Drawer>
    </header>
  );
}

export function Footer() {
  const { settings, catalogs } = useStore();
  const cats = catalogs.categories.filter((c) => c.active).slice(0, 5);
  const H = ({ children }: { children: ReactNode }) => <h4 className="mb-3 text-sm font-semibold text-cream">{children}</h4>;
  const L = ({ to, children }: { to: string; children: ReactNode }) => <li><Link to={to} className="inline-block py-1 text-sm text-cream/70 hover:text-gold">{children}</Link></li>;
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">Việc tốt, đến sớm như nắng mai. Nền tảng kết nối ứng viên và doanh nghiệp trên toàn quốc.</p>
          <p className="mt-4 text-sm text-cream/70">Liên hệ: {settings.supportEmail}</p>
        </div>
        <div><H>Dành cho ứng viên</H><ul><L to="/viec-lam">Tìm việc làm</L><L to="/dang-nhap?tab=candidate">Đăng ký ứng viên</L><L to="/dang-nhap">Đăng nhập</L></ul></div>
        <div><H>Dành cho nhà tuyển dụng</H><ul><L to="/dang-nhap?tab=employer">Đăng ký nhà tuyển dụng</L><L to="/dang-nhap">Đăng nhập</L></ul></div>
        <div><H>Việc làm theo ngành</H><ul>{cats.map((c) => <L key={c.id} to={`/viec-lam?cat=${encodeURIComponent(c.name)}`}>{c.name}</L>)}</ul></div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs leading-relaxed text-cream/60 sm:px-6">© 2026 {settings.siteName} — tên thương hiệu tạm thời, <b>chưa được phê duyệt</b>; chưa kiểm tra tên miền hay nhãn hiệu. Đây là bản thiết kế giao diện với dữ liệu mô phỏng, chưa kết nối máy chủ hay cơ sở dữ liệu thật.</p>
      </div>
    </footer>
  );
}

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

export function PublicLayout() {
  const { state } = useLocation();
  useEffect(() => { const id = (state as { scrollTo?: string } | null)?.scrollTo; if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80); }, [state]);
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollTop /><PreviewBar /><Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

/* ---------- Khu vực theo vai trò ---------- */
export function NoAccess({ need }: { need: Exclude<Role, "guest"> }) {
  const { role, switchRole } = useStore(); const nav = useNavigate();
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-butter text-gold-ink"><Lock className="h-7 w-7" /></div>
      <h1 className="text-2xl font-bold">Khu vực dành cho {roleLabel[need].toLowerCase()}</h1>
      <p className="mt-2 text-ink-soft">{role === "guest" ? "Bạn cần đăng nhập để tiếp tục." : `Bạn đang xem với vai trò ${roleLabel[role].toLowerCase()}.`} Trong bản xem trước, bạn có thể đăng nhập mô phỏng hoặc đổi vai trò.</p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button onClick={() => nav("/dang-nhap")}>Đến trang đăng nhập</Button>
        <Button variant="outline" onClick={() => { switchRole(need); }}>Xem với vai trò {roleLabel[need].toLowerCase()}</Button>
      </div>
      <p className="mt-6 text-xs text-ink-mute">Lưu ý: giới hạn truy cập này chỉ là trải nghiệm giao diện, chưa phải phân quyền bảo mật.</p>
    </div>
  );
}

export function AreaLayout({ need }: { need: Exclude<Role, "guest"> }) {
  const { role, company, jobs, savedIds, applications, user, companies } = useStore();
  if (role !== need) return <div className="flex min-h-screen flex-col"><ScrollTop /><PreviewBar /><Header /><main className="flex-1"><NoAccess need={need} /></main><Footer /></div>;
  const counts: Record<string, number | undefined> = {
    "/ung-vien/da-luu": savedIds.length,
    "/ung-vien/da-ung-tuyen": applications.filter((a) => a.candidateId === user?.id).length,
    "/nha-tuyen-dung/tin-tuyen-dung": jobs.filter((j) => j.companyId === company?.id).length,
    "/nha-tuyen-dung/ung-vien": applications.filter((a) => a.status === "new" && jobs.find((j) => j.id === a.jobId)?.companyId === company?.id).length,
    "/quan-tri/kiem-duyet": jobs.filter((j) => j.status === "pending").length,
    "/quan-tri/nguoi-dung": companies.filter((c) => c.status === "pending").length,
  };
  const items = areaNav[need];
  const cls = ({ isActive }: { isActive: boolean }) => cn("flex shrink-0 items-center gap-2.5 rounded-ctl px-3.5 py-2.5 text-sm font-medium transition-colors [&>svg]:h-[18px] [&>svg]:w-[18px] hover:bg-butter", isActive ? "bg-butter font-semibold text-ink" : "text-ink-soft");
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollTop /><PreviewBar /><Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="mb-6 lg:mb-0">
          <div className="lg:sticky lg:top-[120px]">
            <div className="mb-3 hidden px-3 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">{need === "candidate" ? "Khu vực ứng viên" : need === "employer" ? "Khu vực tuyển dụng" : "Quản trị hệ thống"}</p>
              {need === "employer" && company && <p className="mt-1 flex items-center gap-2 text-sm font-semibold"><Briefcase className="h-4 w-4 text-gold-ink" />{company.name}</p>}
            </div>
            <nav aria-label="Menu khu vực" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {items.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={cls}>
                  {n.icon}<span className="whitespace-nowrap">{n.label}</span>
                  {!!counts[n.to] && <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold">{counts[n.to]}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">
          {need === "employer" && company && company.status !== "approved" && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-card border border-gold bg-butter p-4 text-sm">
              <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink" />
              <p><b>Doanh nghiệp của bạn đang ở trạng thái “{company.status === "pending" ? "Chờ duyệt" : "Bị từ chối"}”.</b> Bạn có thể soạn và lưu nháp tin, nhưng chỉ gửi duyệt được sau khi quản trị viên duyệt hồ sơ doanh nghiệp.{company.rejectReason && <> Lý do: {company.rejectReason}</>}</p>
            </div>
          )}
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
export { Badge };
