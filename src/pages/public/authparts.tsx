import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Field, Input } from "@/components/ui/form";
import { LogoMark } from "@/components/shared/common";

export function Pw({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required error={error}>{(p) => (
      <div className="relative"><Input {...p} type={show ? "text" : "password"} autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} className="pr-11" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:bg-butter">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>)}</Field>
  );
}
export const Alert = ({ text }: { text: string }) => <div role="alert" className="flex gap-2 rounded-ctl bg-bad-bg p-3 text-sm text-bad"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{text}</div>;

/** Khung 2 cột: form bên trái, giới thiệu quyền lợi bên phải. */
export function AuthShell({ title, desc, children, points, side }: { title: string; desc: string; children: ReactNode; points: string[]; side?: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="rounded-card border border-line bg-paper p-5 shadow-soft sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1><p className="mb-6 mt-1.5 text-ink-soft">{desc}</p>{children}
      </div>
      <aside className="space-y-5">
        <div className="rounded-card bg-butter p-6"><LogoMark size={44} /><h2 className="mt-4 text-lg font-bold">Vì sao dùng nền tảng này?</h2>
          <ul className="mt-4 space-y-3 text-sm">{points.map((t) => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink" />{t}</li>)}</ul></div>
        {side}
      </aside>
    </div>
  );
}
