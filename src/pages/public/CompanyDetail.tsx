import { ChevronRight, Globe, Mail, MapPin, Users, Layers } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CompanyLogo, EmptyState } from "@/components/shared/common";
import { JobCard } from "@/components/shared/job";
import { useStore } from "@/lib/store";

export default function CompanyDetail() {
  const { id } = useParams(); const { companies, jobs, role, company: mine } = useStore();
  const co = companies.find((c) => c.id === id);
  if (!co || (co.status !== "approved" && role !== "admin" && mine?.id !== co.id))
    return <div className="mx-auto max-w-xl px-4 py-24"><EmptyState title="Không tìm thấy doanh nghiệp" text="Doanh nghiệp không tồn tại hoặc chưa được duyệt hiển thị." action={<Link to="/viec-lam"><Button>Xem việc làm</Button></Link>} /></div>;
  const open = jobs.filter((j) => j.companyId === co.id && j.status === "approved");
  const info = [[<Layers key="a" />, "Lĩnh vực", co.industry], [<Users key="b" />, "Quy mô", co.size], [<MapPin key="c" />, "Địa chỉ", [co.address, co.city].filter(Boolean).join(", ") || "Chưa cập nhật"], [<Globe key="d" />, "Website", co.website || "Chưa cập nhật"], [<Mail key="e" />, "Email", co.email]];
  return (
    <div>
      <section className="bg-butter">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-ink-soft"><Link to="/" className="hover:text-ink">Trang chủ</Link><ChevronRight className="h-3.5 w-3.5" /><span className="text-ink">{co.name}</span></nav>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <CompanyLogo name={co.name} tone={co.tone} size={88} className="shadow-soft" />
            <div><h1 className="text-2xl font-bold sm:text-4xl">{co.name}</h1><p className="mt-1.5 text-ink-soft">{co.industry} · {co.city} · {open.length} vị trí đang tuyển</p></div>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <section><h2 className="mb-3 text-xl font-bold">Giới thiệu doanh nghiệp</h2>{co.about ? co.about.split("\n").filter(Boolean).map((p, i) => <p key={i} className="mb-3 leading-relaxed text-ink-soft">{p}</p>) : <p className="text-ink-mute">Doanh nghiệp chưa cập nhật phần giới thiệu.</p>}</section>
          <section aria-labelledby="h-open"><h2 id="h-open" className="mb-4 text-xl font-bold">Vị trí đang tuyển ({open.length})</h2>
            {open.length ? <div className="space-y-3">{open.map((j) => <JobCard key={j.id} job={j} company={co} compact />)}</div> : <EmptyState title="Hiện chưa có vị trí đang tuyển" text="Hãy quay lại sau hoặc khám phá các việc làm khác." action={<Link to="/viec-lam"><Button variant="outline">Tìm việc làm khác</Button></Link>} />}</section>
        </div>
        <aside><div className="rounded-card border border-line bg-paper p-5 shadow-soft lg:sticky lg:top-[120px]"><h2 className="mb-4 font-semibold">Thông tin doanh nghiệp</h2>
          <dl className="space-y-4 text-sm">{info.map(([i, k, v]) => <div key={k as string} className="flex gap-3"><span className="mt-0.5 text-ink-mute [&>svg]:h-4 [&>svg]:w-4">{i}</span><div className="min-w-0"><dt className="text-ink-mute">{k}</dt><dd className="break-words font-medium">{v}</dd></div></div>)}</dl></div></aside>
      </div>
    </div>
  );
}
