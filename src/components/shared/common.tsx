import { AlertTriangle, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { Field, Textarea } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { AppStatus, CompanyStatus, JobStatus } from "@/lib/types";

export function Logo({ className, onDark }: { className?: string; onDark?: boolean }) {
  const { settings } = useStore();
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 font-bold", className)} aria-label={`${settings.siteName} – Trang chủ`}>
      <LogoMark />
      <span className={cn("text-[19px] tracking-tight", onDark && "text-cream")}>{settings.siteName}</span>
    </Link>
  );
}
/** Ý tưởng logo: mặt trời mọc trên đường chân trời — “nắng” là khởi đầu mới cho công việc. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden>
      <rect width="36" height="36" rx="11" fill="var(--color-gold)" />
      <path d="M8.5 23a9.5 9.5 0 0 1 19 0z" fill="#30343b" />
      <rect x="7" y="25" width="22" height="3" rx="1.5" fill="#30343b" />
      <path d="M18 7.5v3M8.6 11.4l2.1 2.1M27.4 11.4l-2.1 2.1" stroke="#30343b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const TONES = [["#fff4c7", "#7a5600"], ["#f4ce73", "#30343b"], ["#30343b", "#fff4c7"], ["#e9e2cc", "#4a4e57"]];
export function CompanyLogo({ name, tone = 0, size = 48, className }: { name: string; tone?: number; size?: number; className?: string }) {
  const [bg, fg] = TONES[tone % TONES.length];
  const ini = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div aria-hidden className={cn("grid shrink-0 place-items-center rounded-ctl font-bold", className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36, border: tone === 0 ? "1px solid #ece2bd" : undefined }}>{ini}</div>
  );
}

const chip = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "ok" | "bad" | "info" | "gold"; className?: string }) {
  const t = { neutral: "bg-neutral-bg text-ink-soft", ok: "bg-ok-bg text-ok", bad: "bg-bad-bg text-bad", info: "bg-info-bg text-info", gold: "bg-butter text-gold-ink" }[tone];
  return <span className={cn(chip, t, className)}>{children}</span>;
}
export const JOB_STATUS: Record<JobStatus, { label: string; tone: "neutral" | "ok" | "bad" | "info" | "gold" }> = {
  draft: { label: "Bản nháp", tone: "neutral" }, pending: { label: "Chờ duyệt", tone: "gold" }, approved: { label: "Đang hiển thị", tone: "ok" },
  rejected: { label: "Bị từ chối", tone: "bad" }, closed: { label: "Đã đóng", tone: "neutral" }, hidden: { label: "Đã ẩn", tone: "info" },
};
export const APP_STATUS: Record<AppStatus, { label: string; tone: "neutral" | "ok" | "bad" | "info" | "gold" }> = {
  new: { label: "Mới nhận", tone: "info" }, reviewing: { label: "Đang xem xét", tone: "gold" }, interview: { label: "Phỏng vấn", tone: "ok" }, closed: { label: "Kết thúc", tone: "neutral" },
};
export const COMPANY_STATUS: Record<CompanyStatus, { label: string; tone: "neutral" | "ok" | "bad" | "info" | "gold" }> = {
  pending: { label: "Chờ duyệt", tone: "gold" }, approved: { label: "Đã duyệt", tone: "ok" }, rejected: { label: "Bị từ chối", tone: "bad" },
};
export const JobStatusBadge = ({ s }: { s: JobStatus }) => <Badge tone={JOB_STATUS[s].tone}>{JOB_STATUS[s].label}</Badge>;
export const AppStatusBadge = ({ s }: { s: AppStatus }) => <Badge tone={APP_STATUS[s].tone}>{APP_STATUS[s].label}</Badge>;

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-butter text-gold-ink">{icon ?? <SearchX className="h-6 w-6" />}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { setSimulateError } = useStore();
  return (
    <div role="alert" className="flex flex-col items-center rounded-card border border-bad/30 bg-bad-bg/50 px-6 py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-bad-bg text-bad"><AlertTriangle className="h-6 w-6" /></div>
      <h3 className="text-base font-semibold">Không tải được dữ liệu</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">Đây là trạng thái lỗi mô phỏng do bạn bật “Mô phỏng lỗi mạng” trên thanh Xem trước.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>Thử lại</Button>
        <Button variant="dark" onClick={() => { setSimulateError(false); onRetry(); }}>Tắt mô phỏng lỗi và tải lại</Button>
      </div>
    </div>
  );
}
export const Skeleton = ({ className }: { className?: string }) => <div className={cn("skeleton", className)} aria-hidden />;
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-card border border-line bg-paper p-5">
          <Skeleton className="h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2.5"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, desc, actions, back }: { title: string; desc?: string; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>{back}<h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>{desc && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-soft">{desc}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-1.5">
      <Button variant="outline" size="icon" aria-label="Trang trước" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-ink-mute">…</span>}
          <Button variant={n === page ? "dark" : "outline"} size="icon" aria-label={`Trang ${n}`} aria-current={n === page ? "page" : undefined} onClick={() => onChange(n)}>{n}</Button>
        </span>
      ))}
      <Button variant="outline" size="icon" aria-label="Trang sau" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
    </nav>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, text, confirmLabel, danger, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} footer={<>
      <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
      <Button variant={danger ? "danger" : "primary"} loading={busy} onClick={async () => { setBusy(true); try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); } }}>{confirmLabel}</Button>
    </>}>
      <p className="text-[15px] text-ink-soft">{text}</p>
    </Modal>
  );
}

/** Hộp thoại bắt buộc nhập lý do (từ chối / ẩn tin). */
export function ReasonDialog({ open, onOpenChange, title, text, label = "Lý do", confirmLabel, min = 10, required = true, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; text?: string; label?: string; confirmLabel: string; min?: number; required?: boolean; onConfirm: (reason: string) => Promise<void>;
}) {
  const [v, setV] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (required && v.trim().length < min) { setErr(`Vui lòng nhập lý do (tối thiểu ${min} ký tự) để nhà tuyển dụng biết cách chỉnh sửa.`); return; }
    setBusy(true); try { await onConfirm(v.trim()); setV(""); setErr(""); onOpenChange(false); } catch { /* lỗi đã được toast ở nơi gọi */ } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { setErr(""); } onOpenChange(o); }} title={title} description={text} footer={<>
      <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
      <Button variant="danger" loading={busy} onClick={submit}>{confirmLabel}</Button>
    </>}>
      <Field label={label} required={required} error={err}>{(p) => <Textarea rows={4} value={v} onChange={(e) => { setV(e.target.value); setErr(""); }} placeholder="Nhập nội dung…" {...p} />}</Field>
    </Modal>
  );
}

export function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-soft">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-ctl bg-butter text-gold-ink">{icon}</div><span className="text-sm text-ink-soft">{label}</span></div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-[13px] text-ink-mute">{hint}</div>}
    </div>
  );
}
