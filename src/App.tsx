import { Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";
import { AreaLayout, PublicLayout } from "@/components/layout/shell";
import { EmptyState } from "@/components/shared/common";
import { Button } from "@/components/ui/button";
// 01–08 Website công khai
import Home from "@/pages/public/Home";
import Jobs from "@/pages/public/Jobs";
import JobDetail from "@/pages/public/JobDetail";
import Companies from "@/pages/public/Companies";
import CompanyDetail from "@/pages/public/CompanyDetail";
import { Guides, GuideDetail } from "@/pages/public/Guides";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
// 09–13 Ứng viên
import Overview from "@/pages/candidate/Overview";
import Profile from "@/pages/candidate/Profile";
import Saved from "@/pages/candidate/Saved";
import Applications from "@/pages/candidate/Applications";
import Account from "@/pages/candidate/Account";
// 14–21 Nhà tuyển dụng
import Dashboard from "@/pages/employer/Dashboard";
import CompanyProfile from "@/pages/employer/CompanyProfile";
import JobsManage from "@/pages/employer/JobsManage";
import JobEditor from "@/pages/employer/JobEditor";
import JobStats from "@/pages/employer/JobStats";
import Applicants from "@/pages/employer/Applicants";
import ApplicantDetail from "@/pages/employer/ApplicantDetail";
import Reports from "@/pages/employer/Reports";
// 22–26 Quản trị
import AdminOverview from "@/pages/admin/AdminOverview";
import Moderation from "@/pages/admin/Moderation";
import CompanyModeration from "@/pages/admin/CompanyModeration";
import UsersViolations from "@/pages/admin/UsersViolations";
import Catalog from "@/pages/admin/Catalog";

const NotFound = () => (
  <div className="mx-auto max-w-xl px-4 py-24"><EmptyState title="Không tìm thấy trang" text="Đường dẫn bạn mở không tồn tại trong bản xem trước." action={<Link to="/"><Button>Về trang chủ</Button></Link>} /></div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/viec-lam" element={<Jobs />} />
        <Route path="/viec-lam/:id" element={<JobDetail />} />
        <Route path="/cong-ty" element={<Companies />} />
        <Route path="/cong-ty/:id" element={<CompanyDetail />} />
        <Route path="/cam-nang" element={<Guides />} />
        <Route path="/cam-nang/:slug" element={<GuideDetail />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AreaLayout need="candidate" />}>
        <Route path="/ung-vien" element={<Overview />} />
        <Route path="/ung-vien/ho-so" element={<Profile />} />
        <Route path="/ung-vien/da-luu" element={<Saved />} />
        <Route path="/ung-vien/da-ung-tuyen" element={<Applications />} />
        <Route path="/ung-vien/tai-khoan" element={<Account />} />
      </Route>
      <Route element={<AreaLayout need="employer" />}>
        <Route path="/nha-tuyen-dung" element={<Dashboard />} />
        <Route path="/nha-tuyen-dung/doanh-nghiep" element={<CompanyProfile />} />
        <Route path="/nha-tuyen-dung/tin-tuyen-dung" element={<JobsManage />} />
        <Route path="/nha-tuyen-dung/tin/moi" element={<JobEditor />} />
        <Route path="/nha-tuyen-dung/tin/:id/sua" element={<JobEditor />} />
        <Route path="/nha-tuyen-dung/tin/:id/hieu-qua" element={<JobStats />} />
        <Route path="/nha-tuyen-dung/ung-vien" element={<Applicants />} />
        <Route path="/nha-tuyen-dung/ung-vien/:id" element={<ApplicantDetail />} />
        <Route path="/nha-tuyen-dung/bao-cao" element={<Reports />} />
      </Route>
      <Route element={<AreaLayout need="admin" />}>
        <Route path="/quan-tri" element={<AdminOverview />} />
        <Route path="/quan-tri/kiem-duyet" element={<Moderation />} />
        <Route path="/quan-tri/doanh-nghiep" element={<CompanyModeration />} />
        <Route path="/quan-tri/nguoi-dung" element={<UsersViolations />} />
        <Route path="/quan-tri/danh-muc" element={<Catalog />} />
      </Route>
    </Routes>
  );
}
