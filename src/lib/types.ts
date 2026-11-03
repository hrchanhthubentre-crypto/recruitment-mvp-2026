export type Role = "guest" | "candidate" | "employer" | "admin";
export type JobStatus = "draft" | "pending" | "approved" | "rejected" | "closed" | "hidden";
export type AppStatus = "new" | "reviewing" | "interview" | "closed";
export type CompanyStatus = "pending" | "approved" | "rejected";

export interface Company {
  id: string; name: string; industry: string; size: string; address: string; city: string;
  website: string; email: string; taxCode: string; about: string; tone: number; status: CompanyStatus; rejectReason?: string;
  phone?: string; banner?: number; adminNote?: string;
}
export interface Job {
  id: string; title: string; companyId: string; category: string; location: string; type: string; level: string; experience: string;
  salaryMin: number; salaryMax: number; postedAt: string; deadline: string;
  description: string[]; requirements: string[]; benefits: string[];
  status: JobStatus; rejectReason?: string; hiddenReason?: string; headcount: number;
}
export interface Application {
  id: string; jobId: string; candidateId: string; name: string; email: string; phone: string; headline: string;
  appliedAt: string; status: AppStatus; note: string; cvName: string; cover: string; skills: string[]; years: number; location: string;
  timeline: { at: string; text: string }[];
}
export interface User { id: string; name: string; email: string; role: Exclude<Role, "guest">; status: "active" | "locked"; companyId?: string; createdAt: string; phone?: string }
export interface Experience { id: string; company: string; title: string; from: string; to: string; desc: string }
export interface Education { id: string; school: string; major: string; from: string; to: string }
export interface Profile {
  fullName: string; email: string; phone: string; birthYear: string; city: string; summary: string;
  skills: string[]; experiences: Experience[]; education: Education[];
  desiredTitle: string; desiredCategory: string; desiredLocation: string; desiredSalary: string; desiredType: string; openToWork: boolean;
  cv: { name: string; size: number; uploadedAt: string } | null;
}
export interface CatalogItem { id: string; name: string; active: boolean }
export type CatalogKey = "categories" | "locations" | "types" | "levels" | "experiences";
export type Catalogs = Record<CatalogKey, CatalogItem[]>;
export interface Settings { siteName: string; supportEmail: string; perPage: number; accent: "butter" | "warm" | "honey"; radius: "sm" | "md" | "lg" }
export interface Activity { id: string; at: string; text: string; kind: "apply" | "job" | "system" }
export interface ModLog { id: string; at: string; jobId: string; action: "approved" | "rejected" | "hidden" | "restored"; reason?: string }
export interface Notification { id: string; userId: string; at: string; title: string; body: string; read: boolean; kind: "apply" | "status" | "job" | "system" }
export interface Report { id: string; targetType: "job" | "user"; targetId: string; targetLabel: string; reason: string; detail: string; reporter: string; at: string; status: "open" | "resolved" | "dismissed"; resolution?: string }
export interface Prefs { emailStatus: boolean; emailJobs: boolean; emailNews: boolean; inApp: boolean }
export interface Article { slug: string; title: string; category: string; excerpt: string; minutes: number; date: string; featured?: boolean; body: string[] }
