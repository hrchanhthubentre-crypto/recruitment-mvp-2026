import type { Application, Job } from "./types";
import { daysFromNow } from "./utils";

/** Số liệu thống kê MÔ PHỎNG — lượt xem sinh từ mã tin (cố định), lượt ứng tuyển lấy thật từ danh sách hồ sơ. */
export const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const LIVE: Job["status"][] = ["approved", "closed", "hidden"];

export const lastDays = (n: number) => Array.from({ length: n }, (_, i) => daysFromNow(-(n - 1 - i)));
export function viewsOn(job: Job, date: string) {
  if (!LIVE.includes(job.status) || date < job.postedAt) return 0;
  return 8 + (hash(job.id + date) % 14) + (hash(job.id) % 9);
}
export const viewsTotal = (job: Job) => lastDays(90).reduce((a, d) => a + viewsOn(job, d), 0);
export const appliesOf = (job: Job, apps: Application[]) => apps.filter((a) => a.jobId === job.id).length;

export interface DayPoint { date: string; views: number; applies: number }
export function series(jobs: Job[], apps: Application[], days: number): DayPoint[] {
  const ids = new Set(jobs.map((j) => j.id));
  return lastDays(days).map((date) => ({
    date,
    views: jobs.reduce((a, j) => a + viewsOn(j, date), 0),
    applies: apps.filter((a) => ids.has(a.jobId) && a.appliedAt === date).length,
  }));
}
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const isFeatured = (j: Job) => j.salaryMax >= 30 || hash(j.id) % 5 === 0;
