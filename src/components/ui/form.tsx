import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ctl = "w-full rounded-ctl border bg-paper px-3 text-sm text-ink placeholder:text-ink-mute transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/60 disabled:bg-neutral-bg disabled:text-ink-mute";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...p }, ref) => (
    <input ref={ref} aria-invalid={invalid || undefined} className={cn(ctl, "h-11", invalid ? "border-bad" : "border-line", className)} {...p} />
  ));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...p }, ref) => (
    <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(ctl, "py-2.5 leading-relaxed", invalid ? "border-bad" : "border-line", className)} {...p} />
  ));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  ({ className, invalid, children, ...p }, ref) => (
    <div className="relative">
      <select ref={ref} aria-invalid={invalid || undefined} className={cn(ctl, "h-11 appearance-none pr-9", invalid ? "border-bad" : "border-line", className)} {...p}>{children}</select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" aria-hidden />
    </div>
  ));
Select.displayName = "Select";

/** Nhãn + ô nhập + thông báo lỗi, gắn aria đầy đủ. */
export function Field({ label, error, hint, required, className, children }: {
  label: string; error?: string; hint?: string; required?: boolean; className?: string;
  children: (p: { id: string; invalid: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const desc = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}{required && <span className="ml-0.5 text-bad" aria-hidden>*</span>}
      </label>
      {children({ id, invalid: !!error, "aria-describedby": desc })}
      {error ? <p id={`${id}-e`} role="alert" className="mt-1.5 text-[13px] text-bad">{error}</p>
        : hint ? <p id={`${id}-h`} className="mt-1.5 text-[13px] text-ink-mute">{hint}</p> : null}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-ok" : "bg-[#c9c5b8]")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#30343b]" />
      {children}
    </label>
  );
}
export function Radio({ checked, onChange, children, name }: { checked: boolean; onChange: () => void; children: ReactNode; name: string }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#30343b]" />
      {children}
    </label>
  );
}
