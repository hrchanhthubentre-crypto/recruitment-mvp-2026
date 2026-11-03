import * as D from "@radix-ui/react-dialog";
import * as M from "@radix-ui/react-dropdown-menu";
import * as T from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Modal ---------- */
export function Modal({ open, onOpenChange, title, description, children, footer, wide }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children?: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="ov fixed inset-0 z-50 bg-ink/40" />
        <D.Content aria-describedby={description ? undefined : undefined}
          className={cn("modal fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-cream shadow-pop", wide ? "max-w-3xl" : "max-w-lg")}>
          <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
            <div>
              <D.Title className="text-lg font-semibold">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-sm text-ink-soft">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close className="-mr-2 -mt-1 rounded-lg p-2 text-ink-soft hover:bg-butter" aria-label="Đóng"><X className="h-5 w-5" /></D.Close>
          </div>
          <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <div className="flex flex-col-reverse gap-2 border-t border-line-soft px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/* ---------- Drawer (panel trượt từ phải) ---------- */
export function Drawer({ open, onOpenChange, title, description, children, footer, side = "right", width = "max-w-xl" }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children?: ReactNode; footer?: ReactNode; side?: "right"; width?: string;
}) {
  void side;
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="ov fixed inset-0 z-50 bg-ink/40" />
        <D.Content className={cn("drawer fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-cream shadow-pop", width)}>
          <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
            <div>
              <D.Title className="text-lg font-semibold">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-sm text-ink-soft">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close className="-mr-2 -mt-1 rounded-lg p-2 text-ink-soft hover:bg-butter" aria-label="Đóng"><X className="h-5 w-5" /></D.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && <div className="flex flex-col-reverse gap-2 border-t border-line-soft bg-cream px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/* ---------- Dropdown ---------- */
export const Menu = M.Root;
export const MenuTrigger = M.Trigger;
export function MenuContent({ children, align = "end", className }: { children: ReactNode; align?: "start" | "end" | "center"; className?: string }) {
  return (
    <M.Portal>
      <M.Content align={align} sideOffset={6} collisionPadding={12}
        className={cn("modal-menu z-[60] min-w-52 rounded-xl border border-line bg-paper p-1.5 shadow-pop", className)}>
        {children}
      </M.Content>
    </M.Portal>
  );
}
export function MenuItem({ children, onSelect, danger, disabled, icon }: { children: ReactNode; onSelect?: () => void; danger?: boolean; disabled?: boolean; icon?: ReactNode }) {
  return (
    <M.Item disabled={disabled} onSelect={onSelect}
      className={cn("flex min-h-10 cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 text-sm outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-butter", danger && "text-bad data-[highlighted]:bg-bad-bg")}>
      {icon}{children}
    </M.Item>
  );
}
export const MenuLabel = ({ children }: { children: ReactNode }) => <M.Label className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-mute">{children}</M.Label>;
export const MenuSep = () => <M.Separator className="my-1 h-px bg-line-soft" />;
export const MenuRadioGroup = M.RadioGroup;
export function MenuRadio({ value, children }: { value: string; children: ReactNode }) {
  return (
    <M.RadioItem value={value} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-butter data-[state=checked]:font-semibold">
      <span className="grid h-4 w-4 place-items-center rounded-full border border-ink-mute"><M.ItemIndicator><span className="block h-2 w-2 rounded-full bg-ink" /></M.ItemIndicator></span>
      {children}
    </M.RadioItem>
  );
}
export function MenuCheck({ checked, onCheckedChange, children }: { checked: boolean; onCheckedChange: (c: boolean) => void; children: ReactNode }) {
  return (
    <M.CheckboxItem checked={checked} onCheckedChange={onCheckedChange} onSelect={(e) => e.preventDefault()}
      className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-butter">
      <span className="grid h-4 w-4 place-items-center rounded border border-ink-mute"><M.ItemIndicator><span className="block h-2 w-2 rounded-sm bg-ink" /></M.ItemIndicator></span>
      {children}
    </M.CheckboxItem>
  );
}

/* ---------- Tabs ---------- */
export const Tabs = T.Root;
export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <T.List className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-butter p-1", className)}>{children}</T.List>;
}
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <T.Trigger value={value} className="shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink data-[state=active]:bg-paper data-[state=active]:font-semibold data-[state=active]:text-ink data-[state=active]:shadow-sm">
      {children}
    </T.Trigger>
  );
}
export const TabsContent = ({ value, children, className }: { value: string; children: ReactNode; className?: string }) => (
  <T.Content value={value} className={cn("fade-in outline-none", className)}>{children}</T.Content>
);
