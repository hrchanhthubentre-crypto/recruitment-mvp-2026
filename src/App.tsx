import { Navigate, Route, Routes } from "react-router-dom";
import { AreaLayout, PublicLayout } from "@/components/layout/shell";
import Home from "@/pages/public/Home";
import Jobs from "@/pages/public/Jobs";
import JobDetail from "@/pages/public/JobDetail";
import CompanyDetail from "@/pages/public/CompanyDetail";
import Auth from "@/pages/public/Auth";
import Profile from "@/pages/candidate/Profile";
import Saved from "@/pages/candidate/Saved";
import Applications from "@/pages/candidate/Applications";
import Dashboard from "@/pages/employer/Dashboard";
import CompanyProfile from "@/pages/employer/CompanyProfile";
import JobsManage from "@/pages/employer/JobsManage";
import Applicants from "@/pages/employer/Applicants";
import Moderation from "@/pages/admin/Moderation";
import UsersCompanies from "@/pages/admin/UsersCompanies";
import Catalog from "@/pages/admin/Catalog";
import { EmptyState } from "@/components/shared/common";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
        <Route path="/cong-ty/:id" element={<CompanyDetail />} />
        <Route path="/dang-nhap" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AreaLayout need="candidate" />}>
        <Route path="/ung-vien" element={<Navigate to="/ung-vien/ho-so" replace />} />
        <Route path="/ung-vien/ho-so" element={<Profile />} />
        <Route path="/ung-vien/da-luu" element={<Saved />} />
        <Route path="/ung-vien/da-ung-tuyen" element={<Applications />} />
      </Route>
      <Route element={<AreaLayout need="employer" />}>
        <Route path="/nha-tuyen-dung" element={<Dashboard />} />
        <Route path="/nha-tuyen-dung/doanh-nghiep" element={<CompanyProfile />} />
        <Route path="/nha-tuyen-dung/tin-tuyen-dung" element={<JobsManage />} />
        <Route path="/nha-tuyen-dung/ung-vien" element={<Applicants />} />
      </Route>
      <Route element={<AreaLayout need="admin" />}>
        <Route path="/quan-tri" element={<Navigate to="/quan-tri/kiem-duyet" replace />} />
        <Route path="/quan-tri/kiem-duyet" element={<Moderation />} />
        <Route path="/quan-tri/nguoi-dung" element={<UsersCompanies />} />
        <Route path="/quan-tri/danh-muc" element={<Catalog />} />
      </Route>
    </Routes>
  );
}
