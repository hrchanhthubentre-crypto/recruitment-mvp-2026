import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Activity, AppStatus, Application, CatalogItem, CatalogKey, Catalogs, Company, Job, JobStatus, ModLog, Profile, Role, Settings, User } from "./types";
import { blankProfile, DEMO, seedActivity, seedApplications, seedCatalogs, seedCompanies, seedJobs, seedModLog, seedProfile, seedSettings, seedUsers } from "./seed";
import { daysFromNow, uid } from "./utils";

/**
 * KHO DỮ LIỆU MÔ PHỎNG — toàn bộ nằm trong bộ nhớ trình duyệt (và localStorage).
 * Không có máy chủ, cơ sở dữ liệu hay xác thực thật. Mọi thao tác chỉ thay đổi dữ liệu mẫu cục bộ.
 */
interface Data {
  userId: string | null;
  users: User[]; companies: Company[]; jobs: Job[]; applications: Application[];
  profiles: Record<string, Profile>; saved: Record<string, string[]>;
  catalogs: Catalogs; settings: Settings; activity: Activity[]; modLog: ModLog[];
}
const KEY = "nangviec.preview.v1";
const fresh = (): Data => ({
  userId: null, users: seedUsers(), companies: seedCompanies(), jobs: seedJobs(), applications: seedApplications(),
  profiles: { "u-cand": seedProfile() }, saved: { "u-cand": ["j09", "j24", "j35", "j26"] },
  catalogs: seedCatalogs(), settings: seedSettings(), activity: seedActivity(), modLog: seedModLog(),
});
const load = (): Data => {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...fresh(), ...JSON.parse(raw) }; } catch { /* localStorage có thể bị chặn */ }
  return fresh();
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = () => daysFromNow(0);

interface Ctx extends Data {
  role: Role; user: User | null; company: Company | null; profile: Profile | null; savedIds: string[];
  simulateError: boolean; setSimulateError: (v: boolean) => void;
  switchRole: (r: Role) => void; login: (email: string, password: string) => Promise<User>; logout: () => void; reset: () => void;
  registerCandidate: (name: string, email: string) => Promise<void>;
  registerEmployer: (p: { name: string; email: string; company: string; taxCode: string; industry: string; city: string }) => Promise<void>;
  toggleSave: (jobId: string) => boolean;
  apply: (jobId: string, p: { phone: string; cover: string; cvName: string }) => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  saveJob: (job: Job, submit: boolean) => Promise<Job>;
  setJobStatus: (id: string, status: JobStatus) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  setAppStatus: (id: string, s: AppStatus) => Promise<void>;
  setAppNote: (id: string, note: string) => Promise<void>;
  moderate: (jobId: string, action: "approved" | "rejected" | "hidden" | "restored", reason?: string) => Promise<void>;
  decideCompany: (id: string, status: "approved" | "rejected", reason?: string) => Promise<void>;
  updateCompany: (id: string, patch: Partial<Company>) => Promise<void>;
  toggleLock: (userId: string) => Promise<void>;
  catalogSave: (key: CatalogKey, item: CatalogItem, prevName?: string) => Promise<void>;
  catalogToggle: (key: CatalogKey, id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}
const C = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("StoreProvider missing"); return c; };

const ACCENT = { butter: ["#f4ce73", "#ebc05a"], warm: ["#f0c15a", "#e3ae3d"], honey: ["#e9b949", "#d9a634"] } as const;
const RADIUS = { sm: ["8px", "6px"], md: ["14px", "10px"], lg: ["20px", "14px"] } as const;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Data>(load);
  const [simulateError, setSimulateError] = useState(false);
  const ref = useRef(d); ref.current = d;
  const errRef = useRef(false); errRef.current = simulateError;

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* bỏ qua */ } }, [d]);
  useEffect(() => {
    const r = document.documentElement.style; const [a, s] = ACCENT[d.settings.accent]; const [c, k] = RADIUS[d.settings.radius];
    r.setProperty("--accent", a); r.setProperty("--accent-strong", s); r.setProperty("--r-card", c); r.setProperty("--r-ctl", k);
  }, [d.settings.accent, d.settings.radius]);

  const set = useCallback((fn: (s: Data) => Partial<Data>) => setD((s) => ({ ...s, ...fn(s) })), []);
  /** Mô phỏng độ trễ mạng; ném lỗi khi bật “Mô phỏng lỗi mạng”. */
  const run = useCallback(async (ms = 600) => {
    await sleep(ms);
    if (errRef.current) throw new Error("Không thể hoàn tất thao tác (đang bật chế độ mô phỏng lỗi mạng).");
  }, []);
  const log = (s: Data, text: string, kind: Activity["kind"]): Activity[] => [{ id: uid("ac"), at: today(), kind, text }, ...s.activity].slice(0, 30);

  const user = d.users.find((u) => u.id === d.userId) ?? null;
  const role: Role = user?.role ?? "guest";
  const company = user?.companyId ? d.companies.find((c) => c.id === user.companyId) ?? null : null;
  const profile = user && role === "candidate" ? d.profiles[user.id] ?? blankProfile(user.name, user.email) : null;
  const savedIds = user ? d.saved[user.id] ?? [] : [];

  const value: Ctx = useMemo(() => ({
    ...d, role, user, company, profile, savedIds, simulateError, setSimulateError,
    switchRole: (r) => set(() => ({ userId: r === "guest" ? null : DEMO[r] })),
    login: async (email, password) => {
      await run(700);
      const u = ref.current.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
      const demoOk = password === "demo1234" || !!u?.id.startsWith("u-r"); // tài khoản mẫu dùng mật khẩu demo; tài khoản tự đăng ký (mô phỏng) nhận mọi mật khẩu
      if (!u || !demoOk) throw new Error("Email hoặc mật khẩu không đúng. (Mô phỏng: dùng nút “Đăng nhập nhanh” hoặc mật khẩu demo1234)");
      if (u.status === "locked") throw new Error("Tài khoản này đang bị khóa (mô phỏng). Vui lòng liên hệ quản trị viên.");
      set(() => ({ userId: u.id })); return u;
    },
    logout: () => set(() => ({ userId: null })),
    reset: () => { const f = fresh(); setD(f); },
    registerCandidate: async (name, email) => {
      await run(800);
      if (ref.current.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email này đã được đăng ký trong dữ liệu mẫu.");
      const u: User = { id: uid("u-r"), name, email, role: "candidate", status: "active", createdAt: today() };
      set((s) => ({ users: [...s.users, u], profiles: { ...s.profiles, [u.id]: blankProfile(name, email) }, userId: u.id }));
    },
    registerEmployer: async (p) => {
      await run(900);
      if (ref.current.users.some((u) => u.email.toLowerCase() === p.email.toLowerCase())) throw new Error("Email này đã được đăng ký trong dữ liệu mẫu.");
      const cid = uid("c"); const u: User = { id: uid("u-r"), name: p.name, email: p.email, role: "employer", status: "active", companyId: cid, createdAt: today() };
      const c: Company = { id: cid, name: p.company, industry: p.industry, size: "Dưới 50 nhân sự", address: "", city: p.city, website: "", email: p.email, taxCode: p.taxCode, about: "", tone: 0, status: "pending" };
      set((s) => ({ users: [...s.users, u], companies: [...s.companies, c], userId: u.id }));
    },
    toggleSave: (jobId) => {
      if (!user || role !== "candidate") return false;
      set((s) => { const cur = s.saved[user.id] ?? []; return { saved: { ...s.saved, [user.id]: cur.includes(jobId) ? cur.filter((x) => x !== jobId) : [jobId, ...cur] } }; });
      return true;
    },
    apply: async (jobId, p) => {
      await run(900);
      if (!user) return;
      const s0 = ref.current; if (s0.applications.some((a) => a.jobId === jobId && a.candidateId === user.id)) throw new Error("Bạn đã ứng tuyển vị trí này.");
      const pr = s0.profiles[user.id] ?? blankProfile(user.name, user.email); const job = s0.jobs.find((j) => j.id === jobId)!;
      const a: Application = { id: uid("a"), jobId, candidateId: user.id, name: pr.fullName || user.name, email: pr.email, phone: p.phone, headline: pr.desiredTitle || pr.experiences[0]?.title || "Ứng viên",
        appliedAt: today(), status: "new", note: "", cvName: p.cvName, cover: p.cover, skills: pr.skills, years: Math.max(0, pr.experiences.length), location: pr.city, timeline: [{ at: today(), text: "Hồ sơ được gửi" }] };
      set((s) => ({ applications: [a, ...s.applications], activity: job.companyId === "c-saomai" ? log(s, `Ứng viên ${a.name} vừa ứng tuyển vị trí ${job.title}`, "apply") : s.activity }));
    },
    saveProfile: async (patch) => {
      await run(600); if (!user) return;
      set((s) => ({ profiles: { ...s.profiles, [user.id]: { ...(s.profiles[user.id] ?? blankProfile(user.name, user.email)), ...patch } } }));
    },
    saveJob: async (job, submit) => {
      await run(700);
      if (submit && company && company.status !== "approved") throw new Error("Doanh nghiệp của bạn chưa được duyệt nên chưa thể gửi duyệt tin. Hãy lưu nháp và chờ quản trị viên duyệt hồ sơ doanh nghiệp.");
      const out: Job = { ...job, status: submit ? "pending" : "draft", rejectReason: undefined };
      set((s) => {
        const exists = s.jobs.some((j) => j.id === out.id);
        return { jobs: exists ? s.jobs.map((j) => (j.id === out.id ? out : j)) : [out, ...s.jobs],
          activity: log(s, submit ? `Bạn đã gửi duyệt tin “${out.title}”` : `Bạn đã lưu nháp tin “${out.title}”`, "job") };
      });
      return out;
    },
    setJobStatus: async (id, status) => {
      await run(500);
      set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)), activity: log(s, `Tin “${s.jobs.find((j) => j.id === id)?.title}” chuyển sang trạng thái ${status === "closed" ? "đã đóng" : status === "pending" ? "chờ duyệt" : status}`, "job") }));
    },
    deleteJob: async (id) => { await run(500); set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })); },
    setAppStatus: async (id, st) => {
      await run(450);
      const labels: Record<AppStatus, string> = { new: "Mới nhận", reviewing: "Đang xem xét", interview: "Mời phỏng vấn", closed: "Kết thúc quy trình" };
      set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, status: st, timeline: [...a.timeline, { at: today(), text: labels[st] }] } : a)) }));
    },
    setAppNote: async (id, note) => { await run(400); set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, note } : a)) })); },
    moderate: async (jobId, action, reason) => {
      await run(550);
      const status: JobStatus = action === "approved" || action === "restored" ? "approved" : action === "rejected" ? "rejected" : "hidden";
      set((s) => {
        const job = s.jobs.find((j) => j.id === jobId);
        return {
          jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status, rejectReason: action === "rejected" ? reason : undefined, hiddenReason: action === "hidden" ? reason : undefined } : j)),
          modLog: [{ id: uid("m"), at: today(), jobId, action, reason }, ...s.modLog],
          activity: job?.companyId === "c-saomai" ? log(s, action === "approved" ? `Tin “${job.title}” đã được quản trị viên duyệt` : action === "rejected" ? `Tin “${job.title}” bị từ chối: ${reason}` : `Tin “${job.title}” ${action === "hidden" ? "bị ẩn" : "được hiển thị lại"}`, "job") : s.activity,
        };
      });
    },
    decideCompany: async (id, status, reason) => {
      await run(550);
      set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, status, rejectReason: status === "rejected" ? reason : undefined } : c)) }));
    },
    updateCompany: async (id, patch) => { await run(650); set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)) })); },
    toggleLock: async (id) => { await run(450); set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: u.status === "locked" ? "active" : "locked" } : u)) })); },
    catalogSave: async (key, item, prevName) => {
      await run(450);
      set((s) => {
        const list = s.catalogs[key]; const exists = list.some((x) => x.id === item.id);
        const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
        let jobs = s.jobs;
        if (prevName && prevName !== item.name) {
          const f = ({ categories: "category", locations: "location", types: "type", levels: "level", experiences: "experience" } as const)[key];
          jobs = s.jobs.map((j) => (j[f] === prevName ? { ...j, [f]: item.name } : j));
        }
        return { catalogs: { ...s.catalogs, [key]: next }, jobs };
      });
    },
    catalogToggle: async (key, id) => { await run(350); set((s) => ({ catalogs: { ...s.catalogs, [key]: s.catalogs[key].map((x) => (x.id === id ? { ...x, active: !x.active } : x)) } })); },
    updateSettings: async (patch) => { await run(400); set((s) => ({ settings: { ...s.settings, ...patch } })); },
  }), [d, role, user, company, profile, savedIds, simulateError, run, set]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const roleHome: Record<Role, string> = { guest: "/", candidate: "/ung-vien/ho-so", employer: "/nha-tuyen-dung", admin: "/quan-tri/kiem-duyet" };
export const roleLabel: Record<Role, string> = { guest: "Khách", candidate: "Ứng viên", employer: "Nhà tuyển dụng", admin: "Quản trị viên" };
