import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
export const NOW = new Date("2026-11-03T09:00:00").getTime();
export const daysFromNow = (n: number) => new Date(NOW + n * 86400000).toISOString().slice(0, 10);
export const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - NOW) / 86400000);
export const relTime = (iso: string) => {
  const d = Math.floor((NOW - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Hôm nay";
  if (d === 1) return "Hôm qua";
  if (d < 30) return `${d} ngày trước`;
  return fmtDate(iso);
};
export const salaryText = (min: number, max: number) =>
  !min && !max ? "Thỏa thuận" : min && max ? `${min} – ${max} triệu` : max ? `Đến ${max} triệu` : `Từ ${min} triệu`;
export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
export const matches = (hay: string, needle: string) => normalize(hay).includes(normalize(needle.trim()));
export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
export const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isPhone = (s: string) => /^(0|\+84)\d{9,10}$/.test(s.replace(/[\s.]/g, ""));
