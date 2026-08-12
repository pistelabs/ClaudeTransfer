import { create } from "zustand";
import type {
  Customer,
  CustomerEquipmentRef,
  EquipmentCategory,
  FormItem,
  Job,
  NewCustomerForm,
  NewJobForm,
  PayPromptKind,
  ReadyPromptKind,
  ServiceData,
  Stage,
} from "../types";
import { SEED_CUSTOMERS, SEED_JOBS, STAFF_LIST } from "../data/seedRaw";
import { buildEquip, equipmentFullyComplete, hashCategory, jobBalance, jobTotal, normalizeJob } from "../data/build";
import { nextEquipmentCode } from "../lib/equipmentCode";
import { blankDin, categoryToType, defaultCategoryForType, SERVICE_DEFS } from "../lib/serviceCatalog";
import { canPickStatus, isEquipmentLocked, STAGE_WORK_STATUS } from "../lib/statusFlow";
import { stampNow } from "../lib/format";

export const STAGE_DEFS: { key: Stage; label: string; dot: string }[] = [
  { key: "kiosk", label: "Drop offs Booked", dot: "#10b981" },
  { key: "in_progress", label: "In Progress", dot: "#8b5cf6" },
  { key: "pending", label: "Pending", dot: "#0ea5e9" },
  { key: "awaiting", label: "Awaiting Collection", dot: "#f59e0b" },
  { key: "archive", label: "Archive", dot: "#52525b" },
];

export interface ImgViewerPayload {
  url: string;
  title: string;
  subtitle: string;
}

function blankForm(): NewJobForm {
  return {
    customer: "",
    customerId: null,
    phone: "",
    email: "",
    due: "",
    pickup: "",
    notes: "",
    type: "SKI",
    category: "Alpine Ski",
    brand: "",
    model: "",
    size: "",
    colour: "",
    services: [],
    serviceData: {},
    priceOverride: "",
    items: [],
    din: blankDin(),
  };
}

function blankCust(): NewCustomerForm {
  return { first: "", last: "", email: "", phone: "", channel: "Email" };
}

/** Every equipment code currently in play, so a new one never collides. */
function issuedCodes(jobs: Job[], customers: Customer[]): string[] {
  const out: string[] = [];
  for (const j of jobs) for (const eq of j.equipment) if (eq.code) out.push(eq.code);
  for (const c of customers) for (const e of c.equipment) if (e.code) out.push(e.code);
  return out;
}

/** Stamps codes onto the seed data. A customer's on-file item and the same item sitting on
 * one of their jobs are the same physical thing, so they share a code. */
function buildSeed(): { jobs: Job[]; customers: Customer[] } {
  const customers: Customer[] = SEED_CUSTOMERS.map((c) => ({ ...c, equipment: c.equipment.map((e) => ({ ...e })) }));
  const issued: string[] = [];
  for (const c of customers) {
    for (const e of c.equipment) {
      const category = e.category || hashCategory(e.type, e.brand, e.model);
      e.category = category;
      e.code = nextEquipmentCode(category, issued);
      issued.push(e.code);
    }
  }
  const jobs = SEED_JOBS.map(normalizeJob);
  for (const j of jobs) {
    const owner = customers.find((c) => c.first + " " + c.last === j.customer);
    for (const eq of j.equipment) {
      const onFile = owner?.equipment.find((e) => e.type === eq.type && e.brand === eq.brand && e.model === eq.model && e.size === eq.size);
      eq.code = onFile?.code ?? nextEquipmentCode(eq.category, issued);
      issued.push(eq.code);
    }
  }
  return { jobs, customers };
}

const SEED = buildSeed();

function nextJobIdStr(jobs: Job[]): string {
  const nums = jobs.map((j) => parseInt((j.id || "").replace(/[^0-9]/g, ""), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return "#" + String(next).padStart(4, "0");
}

interface AppState {
  jobs: Job[];
  customers: Customer[];
  staffList: string[];
  activeStaff: string;

  // board / search / filter
  query: string;
  filterCats: EquipmentCategory[];
  filterOpen: boolean;

  // board layout
  boardOrder: string[];
  colWidths: Record<string, number>;
  collapsedCols: string[];
  colDragKey: string | null;
  /** the specific equipment item (not just the job) currently being dragged */
  dragEq: { jobId: string; eqIdx: number } | null;
  /** ticking clock, so collected items lock themselves once the grace period elapses */
  now: number;
  overCol: string | null;

  // job details sheet
  selectedId: string | null;
  activeTab: number;
  draft: string;
  menuOpen: boolean;
  progressMenuOpen: boolean;
  holdPrompt: boolean;
  holdReason: string;
  holdMoveStage: Stage | null;
  /** which equipment item on the selected job the hold-reason prompt applies to */
  holdEqIdx: number | null;
  readyPrompt: ReadyPromptKind;
  payPrompt: PayPromptKind;
  noSvcPrompt: { jobId: string; eqIdx: number } | null;
  resolvePendingPrompt: { jobId: string; eqIdx: number; targetStage: Stage; targetLabel: string } | null;
  imgViewer: ImgViewerPayload | null;

  // staff prompt
  staffPrompt: boolean;

  // check-in / edit sheet
  newOpen: boolean;
  editId: string | null;
  nf: NewJobForm;
  custQuery: string;
  itemMenuIdx: number | null;
  priceEditIdx: number | null;

  // customer add/edit dialog
  addCustOpen: boolean;
  editCustId: string | null;
  ncust: NewCustomerForm;

  // ---- actions ----
  setQuery: (q: string) => void;
  toggleFilterOpen: () => void;
  closeFilter: () => void;
  toggleFilterCat: (cat: EquipmentCategory) => void;
  clearFilter: () => void;

  reorderCols: (dragKey: string, overKey: string) => void;
  setColDragKey: (key: string | null) => void;
  startColResize: (key: string, startX: number, startWidth: number) => void;
  colWidth: (key: string) => number;
  toggleCollapse: (key: string) => void;
  setOverCol: (key: string | null) => void;
  setDragEq: (v: { jobId: string; eqIdx: number } | null) => void;
  tickClock: () => void;
  isLocked: (jobId: string, eqIdx: number) => boolean;
  isJobLocked: (jobId: string) => boolean;

  openJob: (id: string, tab?: number) => void;
  closeDetail: () => void;
  setActiveTab: (i: number) => void;
  setDraft: (v: string) => void;
  addUpdate: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  toggleProgressMenu: () => void;
  closeProgressMenu: () => void;
  deleteJob: (id: string) => void;
  setLoc: (jobId: string, idx: number, loc: string) => void;

  moveJob: (id: string, eqIdx: number, stage: Stage) => void;
  dropJob: (id: string, eqIdx: number, stage: Stage) => void;

  toggleLineItemDone: (jobId: string, eqIdx: number, svcIdx: number) => void;
  addServiceToEquip: (jobId: string, idx: number, name: string) => void;
  removeServiceFromEquip: (jobId: string, idx: number, sIdx: number) => void;

  openPay: () => void;
  closePay: () => void;
  paymentDone: () => void;
  markCollected: () => void;
  setWorkStatus: (jobId: string, eqIdx: number, status: { label: string; stage: Stage | null }) => void;
  closeReady: () => void;
  notifyCustomer: () => void;

  closeNoSvc: () => void;
  noSvcAddServices: () => void;

  closeResolvePending: () => void;
  confirmResolvePending: () => void;

  closeImgViewer: () => void;
  setImgViewer: (payload: ImgViewerPayload) => void;

  setStaff: (name: string) => void;
  openStaffPrompt: () => void;

  openNew: () => void;
  closeNew: () => void;
  openEditJob: (id: string) => void;
  patchNf: (patch: Partial<NewJobForm>) => void;
  patchDin: (patch: Partial<NewJobForm["din"]>) => void;
  patchServiceData: (name: string, patch: ServiceData) => void;
  toggleNfService: (name: string) => void;
  nfSetCategory: (category: NewJobForm["category"]) => void;
  addAnotherItem: () => void;
  removeItem: (i: number) => void;
  swapToEditor: (i: number) => void;
  setItemPriceOverride: (i: number, v: string) => void;
  setItemMenuIdx: (i: number | null) => void;
  setPriceEditIdx: (i: number | null) => void;
  createJob: () => void;

  setCustQuery: (q: string) => void;
  selectCustomer: (c: Customer) => void;
  clearCustomer: () => void;
  toggleCustEquip: (eq: CustomerEquipmentRef) => void;

  openAddCust: (prefill?: Partial<NewCustomerForm>) => void;
  editCustomerByName: (name: string, email: string, phone: string) => void;
  closeAddCust: () => void;
  patchNcust: (patch: Partial<NewCustomerForm>) => void;
  addCustomer: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  jobs: SEED.jobs,
  customers: SEED.customers,
  staffList: STAFF_LIST,
  activeStaff: (typeof localStorage !== "undefined" && localStorage.getItem("wsb_staff")) || "",

  query: "",
  filterCats: [],
  filterOpen: false,

  boardOrder: ["table", "kiosk", "in_progress", "pending", "awaiting", "archive"],
  colWidths: {},
  collapsedCols: [],
  colDragKey: null,
  dragEq: null,
  now: Date.now(),
  overCol: null,

  selectedId: null,
  activeTab: 0,
  draft: "",
  menuOpen: false,
  progressMenuOpen: false,
  holdPrompt: false,
  holdReason: "",
  holdMoveStage: null,
  holdEqIdx: null,
  readyPrompt: null,
  payPrompt: null,
  noSvcPrompt: null,
  resolvePendingPrompt: null,
  imgViewer: null,

  staffPrompt: false,

  newOpen: false,
  editId: null,
  nf: blankForm(),
  custQuery: "",
  itemMenuIdx: null,
  priceEditIdx: null,

  addCustOpen: false,
  editCustId: null,
  ncust: blankCust(),

  // ---- board search / filter ----
  setQuery: (q) => set({ query: q }),
  toggleFilterOpen: () => set((s) => ({ filterOpen: !s.filterOpen })),
  closeFilter: () => set({ filterOpen: false }),
  toggleFilterCat: (cat) =>
    set((s) => ({
      filterCats: s.filterCats.includes(cat) ? s.filterCats.filter((c) => c !== cat) : [...s.filterCats, cat],
    })),
  clearFilter: () => set({ filterCats: [] }),

  // ---- board layout ----
  reorderCols: (dragKey, overKey) =>
    set((s) => {
      const arr = s.boardOrder.slice();
      const from = arr.indexOf(dragKey);
      const to = arr.indexOf(overKey);
      if (from < 0 || to < 0 || from === to) return {};
      arr.splice(from, 1);
      arr.splice(to, 0, dragKey);
      return { boardOrder: arr };
    }),
  setColDragKey: (key) => set({ colDragKey: key }),
  startColResize: (key, startX, startWidth) => {
    const move = (ev: PointerEvent) => {
      const w = Math.max(210, Math.min(820, startWidth + (ev.clientX - startX)));
      set((s) => ({ colWidths: { ...s.colWidths, [key]: w } }));
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  },
  colWidth: (key) => {
    const d = key === "table" ? 620 : 268;
    return get().colWidths[key] ?? d;
  },
  toggleCollapse: (key) =>
    set((s) => ({
      collapsedCols: s.collapsedCols.includes(key) ? s.collapsedCols.filter((k) => k !== key) : [...s.collapsedCols, key],
    })),
  setOverCol: (key) => set({ overCol: key }),
  setDragEq: (v) => set({ dragEq: v }),
  tickClock: () => set({ now: Date.now() }),
  isLocked: (jobId, eqIdx) => {
    const eq = get().jobs.find((j) => j.id === jobId)?.equipment[eqIdx];
    return !!eq && isEquipmentLocked(eq, Date.now());
  },
  isJobLocked: (jobId) => {
    const j = get().jobs.find((x) => x.id === jobId);
    return !!j && j.equipment.length > 0 && j.equipment.every((eq) => isEquipmentLocked(eq, Date.now()));
  },

  // ---- job details sheet ----
  openJob: (id, tab) =>
    set({
      selectedId: id,
      draft: "",
      menuOpen: false,
      holdPrompt: false,
      holdReason: "",
      holdMoveStage: null,
      holdEqIdx: null,
      activeTab: tab || 0,
      readyPrompt: null,
      resolvePendingPrompt: null,
    }),
  closeDetail: () =>
    set({ selectedId: null, menuOpen: false, holdPrompt: false, holdReason: "", holdMoveStage: null, holdEqIdx: null, readyPrompt: null, resolvePendingPrompt: null }),
  setActiveTab: (i) => set({ activeTab: i }),
  setDraft: (v) => set({ draft: v }),
  addUpdate: () => {
    const s = get();
    const t = s.draft.trim();
    const sel = s.jobs.find((j) => j.id === s.selectedId);
    if (!t || !sel) return;
    const stamp = stampNow();
    set((st) => ({
      jobs: st.jobs.map((j) => (j.id === sel.id ? { ...j, updates: [{ text: t, at: sel.tech + " · " + stamp }, ...j.updates] } : j)),
      draft: "",
    }));
  },
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),
  toggleProgressMenu: () => set((s) => ({ progressMenuOpen: !s.progressMenuOpen })),
  closeProgressMenu: () => set({ progressMenuOpen: false }),
  deleteJob: (id) => {
    if (get().isJobLocked(id)) return;
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id), selectedId: null, menuOpen: false }));
  },
  setLoc: (jobId, idx, loc) => {
    if (get().isLocked(jobId, idx)) return;
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === jobId ? { ...j, equipment: j.equipment.map((eq, i) => (i === idx ? { ...eq, loc } : eq)) } : j,
      ),
    }));
  },

  // ---- drag & drop / move guards ----
  // All guards below act on ONE equipment item (jobId + eqIdx), never the whole job — each
  // piece of equipment on a job moves through the board independently of its siblings.
  moveJob: (id, eqIdx, stage) =>
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              equipment: j.equipment.map((eq, i) =>
                i === eqIdx
                  ? { ...eq, stage, workStatus: STAGE_WORK_STATUS[stage] ?? eq.workStatus, collectedAt: stage === "archive" ? Date.now() : null }
                  : eq,
              ),
            }
          : j,
      ),
      dragEq: null,
      overCol: null,
    })),
  dropJob: (id, eqIdx, stage) => {
    const s = get();
    const j = s.jobs.find((x) => x.id === id);
    const eq = j?.equipment[eqIdx];
    if (!j || !eq) {
      set({ dragEq: null, overCol: null });
      return;
    }
    if (isEquipmentLocked(eq, Date.now())) {
      set({ dragEq: null, overCol: null });
      return;
    }
    const noServices = eq.services.length === 0;
    if (eq.stage === "kiosk" && stage !== "kiosk" && noServices) {
      set({ dragEq: null, overCol: null, noSvcPrompt: { jobId: id, eqIdx } });
      return;
    }
    if (eq.workStatus === "Pending" && stage !== "pending" && !canPickStatus(eq.workStatus, STAGE_WORK_STATUS[stage] ?? "")) {
      // Held work has to be resumed (Checked-in / In progress) before it can go anywhere else.
      set({ dragEq: null, overCol: null, selectedId: id, activeTab: eqIdx, menuOpen: false, readyPrompt: "hold_blocked" });
      return;
    }
    if (eq.stage === "pending" && eq.workStatus === "Pending" && stage !== "pending") {
      set({
        dragEq: null,
        overCol: null,
        selectedId: id,
        activeTab: eqIdx,
        menuOpen: false,
        resolvePendingPrompt: { jobId: id, eqIdx, targetStage: stage, targetLabel: STAGE_WORK_STATUS[stage] ?? "Booked" },
      });
      return;
    }
    if (stage === "pending") {
      // Don't move the item yet — it stays in its current column until a hold reason is confirmed.
      set({
        dragEq: null,
        overCol: null,
        selectedId: id,
        activeTab: eqIdx,
        menuOpen: false,
        holdPrompt: true,
        holdReason: "",
        holdEqIdx: eqIdx,
        holdMoveStage: "pending",
        readyPrompt: null,
      });
      return;
    }
    if (stage === "awaiting" && !equipmentFullyComplete(eq)) {
      set({ dragEq: null, overCol: null, selectedId: id, activeTab: eqIdx, menuOpen: false, holdPrompt: false, readyPrompt: "collect_incomplete" });
      return;
    }
    if (stage === "archive") {
      const fullyDone = equipmentFullyComplete(eq);
      const balance = jobBalance(j);
      if (!(fullyDone && balance <= 0)) {
        set({
          dragEq: null,
          overCol: null,
          selectedId: id,
          activeTab: eqIdx,
          menuOpen: false,
          holdPrompt: false,
          readyPrompt: !fullyDone ? "collect_incomplete" : "collect_balance",
        });
        return;
      }
    }
    get().moveJob(id, eqIdx, stage);
  },

  // ---- services on an open job's equipment ----
  toggleLineItemDone: (jobId, eqIdx, svcIdx) => {
    if (get().isLocked(jobId, eqIdx)) return;
    set((s) => ({
      jobs: s.jobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          equipment: j.equipment.map((eq, i) => {
            if (i !== eqIdx) return eq;
            const doneFlags = eq.doneFlags.slice();
            doneFlags[svcIdx] = !doneFlags[svcIdx];
            return { ...eq, doneFlags };
          }),
        };
      }),
    }));
  },
  addServiceToEquip: (jobId, idx, name) =>
    set((s) => ({
      jobs: s.jobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          equipment: j.equipment.map((eq, i) => {
            if (i !== idx) return eq;
            return { ...eq, services: [...eq.services, name], doneFlags: [...eq.doneFlags, false] };
          }),
        };
      }),
    })),
  removeServiceFromEquip: (jobId, idx, sIdx) =>
    set((s) => ({
      jobs: s.jobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          equipment: j.equipment.map((eq, i) => {
            if (i !== idx) return eq;
            return {
              ...eq,
              services: eq.services.filter((_, k) => k !== sIdx),
              doneFlags: eq.doneFlags.filter((_, k) => k !== sIdx),
            };
          }),
        };
      }),
    })),

  // ---- payments / ready-collect flow ----
  openPay: () => set({ payPrompt: "pay" }),
  closePay: () => set({ payPrompt: null }),
  paymentDone: () => {
    // Returning from the payment software means the outstanding balance was taken.
    const s = get();
    const sel = s.jobs.find((j) => j.id === s.selectedId);
    if (!sel) return set({ payPrompt: "collect" });
    const stamp = stampNow();
    const taken = jobBalance(sel);
    set((st) => ({
      jobs: st.jobs.map((j) =>
        j.id === sel.id
          ? {
              ...j,
              paid: jobTotal(j),
              updates: taken > 0 ? [{ text: `Payment received · ${taken.toFixed(2)}`, at: (st.activeStaff || j.tech) + " · " + stamp }, ...j.updates] : j.updates,
            }
          : j,
      ),
      payPrompt: "collect",
    }));
  },
  markCollected: () => {
    // Pay Now → Mark equipment as collected archives EVERY item on the job together — this is
    // the real-world moment the customer walks out with all of it, even though each item was
    // otherwise free to move through the board independently up to this point.
    const s = get();
    const sel = s.jobs.find((j) => j.id === s.selectedId);
    if (!sel) return;
    const stamp = stampNow();
    set((st) => ({
      jobs: st.jobs.map((j) =>
        j.id === sel.id
          ? {
              ...j,
              equipment: j.equipment.map((eq) => ({ ...eq, stage: "archive" as Stage, workStatus: "Collected", collectedAt: eq.collectedAt ?? Date.now() })),
              updates: [{ text: "Payment taken · marked collected", at: (st.activeStaff || j.tech) + " · " + stamp }, ...j.updates],
            }
          : j,
      ),
      payPrompt: null,
      dragEq: null,
      overCol: null,
    }));
  },
  setWorkStatus: (jobId, eqIdx, status) => {
    const s = get();
    const sel = s.jobs.find((j) => j.id === jobId);
    if (!sel) return;
    const eq = sel.equipment[eqIdx];
    if (!eq) return;
    if (isEquipmentLocked(eq, Date.now())) return;
    const noServices = eq.services.length === 0;
    const targetStage: Stage | null = status.label === "Ready" ? "awaiting" : status.label === "Collected" ? "archive" : status.stage;
    if (eq.stage === "kiosk" && targetStage && targetStage !== "kiosk" && noServices) {
      set({ noSvcPrompt: { jobId, eqIdx }, menuOpen: false });
      return;
    }
    // A held item has to resume active work before it can go Ready/Collected — its services
    // still need ticking off — so refuse anything outside the allowed exits.
    if (!canPickStatus(eq.workStatus, status.label)) return;
    if (eq.stage === "pending" && eq.workStatus === "Pending" && targetStage && targetStage !== "pending") {
      set({ resolvePendingPrompt: { jobId, eqIdx, targetStage, targetLabel: status.label }, menuOpen: false });
      return;
    }
    if (status.label === "Pending") {
      // Same as dragging onto the Pending column: the item only actually moves once a hold
      // reason is confirmed, so hand the target stage to the prompt rather than moving now.
      set({ holdPrompt: true, holdReason: "", holdEqIdx: eqIdx, holdMoveStage: "pending", menuOpen: false });
      return;
    }
    if (status.label === "Ready") {
      const total = eq.services.length;
      const done = eq.doneFlags.filter(Boolean).length;
      if (!(total > 0 && done === total)) {
        set({ readyPrompt: "incomplete" });
        return;
      }
      const multi = sel.equipment.length > 1;
      set((st) => ({
        jobs: st.jobs.map((j) =>
          j.id === sel.id
            ? { ...j, equipment: j.equipment.map((e, i) => (i === eqIdx ? { ...e, workStatus: "Ready", stage: "awaiting", collectedAt: null } : e)) }
            : j,
        ),
        readyPrompt: multi ? "multi" : "single",
      }));
      return;
    }
    if (status.label === "Collected") {
      const fullyDone = equipmentFullyComplete(eq);
      const balance = jobBalance(sel);
      const canCollect = fullyDone && balance <= 0;
      if (!canCollect) {
        set({ readyPrompt: !fullyDone ? "collect_incomplete" : "collect_balance" });
        return;
      }
      set((st) => ({
        jobs: st.jobs.map((j) =>
          j.id === sel.id
            ? { ...j, equipment: j.equipment.map((e, i) => (i === eqIdx ? { ...e, workStatus: "Collected", stage: "archive", collectedAt: Date.now() } : e)) }
            : j,
        ),
      }));
      return;
    }
    set((st) => ({
      jobs: st.jobs.map((j) =>
        j.id === sel.id
          ? { ...j, equipment: j.equipment.map((e, i) => (i === eqIdx ? { ...e, workStatus: status.label, stage: status.stage ?? e.stage, collectedAt: null } : e)) }
          : j,
      ),
    }));
  },
  closeReady: () => set({ readyPrompt: null }),
  notifyCustomer: () => {
    const s = get();
    const sel = s.jobs.find((j) => j.id === s.selectedId);
    if (!sel) return;
    const stamp = stampNow();
    set((st) => ({
      jobs: st.jobs.map((j) => (j.id === sel.id ? { ...j, updates: [{ text: "Customer notified — ready for collection", at: sel.tech + " · " + stamp }, ...j.updates] } : j)),
      readyPrompt: null,
    }));
  },

  closeNoSvc: () => set({ noSvcPrompt: null }),
  noSvcAddServices: () => {
    const p = get().noSvcPrompt;
    if (!p) return;
    set({ noSvcPrompt: null, selectedId: p.jobId, activeTab: p.eqIdx });
    get().openEditJob(p.jobId);
  },

  closeResolvePending: () => set({ resolvePendingPrompt: null }),
  confirmResolvePending: () => {
    const p = get().resolvePendingPrompt;
    if (!p) return;
    const stamp = stampNow();
    set((st) => ({
      jobs: st.jobs.map((j) => {
        if (j.id !== p.jobId) return j;
        let marked = false;
        // Resolve only the hold note for this specific equipment item — a sibling item on the
        // same job may have its own independent, still-active hold note.
        const updates = j.updates.map((u) => {
          if (!marked && u.hold && !u.resolved && u.eqIdx === p.eqIdx) {
            marked = true;
            return { ...u, resolved: true, resolvedAt: stamp };
          }
          return u;
        });
        return {
          ...j,
          equipment: j.equipment.map((eq, i) => (i === p.eqIdx ? { ...eq, stage: p.targetStage, workStatus: p.targetLabel, collectedAt: null } : eq)),
          updates,
        };
      }),
      resolvePendingPrompt: null,
    }));
  },

  closeImgViewer: () => set({ imgViewer: null }),
  setImgViewer: (payload) => set({ imgViewer: payload }),

  // ---- staff ----
  setStaff: (name) => {
    try {
      localStorage.setItem("wsb_staff", name);
    } catch {
      /* ignore */
    }
    set({ activeStaff: name, staffPrompt: false });
  },
  openStaffPrompt: () => set({ staffPrompt: true }),

  // ---- check-in / edit sheet ----
  openNew: () => set({ newOpen: true, editId: null, nf: blankForm(), custQuery: "", staffPrompt: true }),
  closeNew: () => set({ newOpen: false, editId: null }),
  openEditJob: (id) => {
    if (get().isJobLocked(id)) return;
    const s = get();
    const j = s.jobs.find((x) => x.id === id);
    if (!j) return;
    const cust = s.customers.find((c) => c.first + " " + c.last === j.customer);
    const toItem = (eq: Job["equipment"][number]): FormItem => {
      const sd: Record<string, ServiceData> = {};
      eq.services.forEach((name) => {
        sd[name] = { ...eq.serviceData[name] };
      });
      return {
        type: eq.type,
        category: eq.category,
        brand: eq.brand,
        model: eq.model,
        size: eq.size,
        colour: eq.colour || "",
        services: eq.services.slice(),
        serviceData: sd,
        priceOverride: eq.priceOverride != null ? eq.priceOverride : "",
      };
    };
    const first = j.equipment[0] ? toItem(j.equipment[0]) : null;
    const rest = j.equipment.slice(1).map(toItem);
    set({
      newOpen: true,
      editId: j.id,
      menuOpen: false,
      progressMenuOpen: false,
      staffPrompt: true,
      nf: {
        ...blankForm(),
        customer: j.customer,
        customerId: cust ? cust.id : null,
        email: j.email,
        phone: j.phone,
        due: j.due === "—" ? "" : j.due,
        pickup: j.pickup === "—" ? "" : j.pickup,
        notes: j.notes || "",
        items: rest,
        type: first ? first.type : "SKI",
        category: first ? first.category : "Alpine Ski",
        brand: first ? first.brand : "",
        model: first ? first.model : "",
        size: first ? first.size : "",
        colour: first ? first.colour : "",
        services: first ? first.services : [],
        serviceData: first ? first.serviceData : {},
      },
    });
  },
  patchNf: (patch) => set((s) => ({ nf: { ...s.nf, ...patch } })),
  patchDin: (patch) => set((s) => ({ nf: { ...s.nf, din: { ...s.nf.din, ...patch } } })),
  patchServiceData: (name, patch) =>
    set((s) => ({ nf: { ...s.nf, serviceData: { ...s.nf.serviceData, [name]: { ...(s.nf.serviceData[name] || {}), ...patch } } } })),
  toggleNfService: (name) =>
    set((s) => {
      const has = s.nf.services.includes(name);
      return { nf: { ...s.nf, services: has ? s.nf.services.filter((x) => x !== name) : [...s.nf.services, name] } };
    }),
  nfSetCategory: (category) =>
    set((s) => {
      const type = categoryToType(category);
      const valid = new Set(SERVICE_DEFS.filter((d) => d.types.includes(type)).map((d) => d.name));
      return { nf: { ...s.nf, category, type, services: s.nf.services.filter((x) => valid.has(x)) } };
    }),
  addAnotherItem: () =>
    set((s) => {
      const f = s.nf;
      if (!f.brand.trim()) return {};
      return {
        nf: {
          ...f,
          items: [
            ...f.items,
            { type: f.type, category: f.category, brand: f.brand.trim(), model: f.model.trim(), size: f.size.trim() || "—", colour: f.colour.trim(), services: f.services.slice(), serviceData: { ...f.serviceData }, code: f.code },
          ],
          code: undefined,
          brand: "",
          model: "",
          size: "",
          colour: "",
          services: [],
          serviceData: {},
        },
      };
    }),
  removeItem: (i) => set((s) => ({ nf: { ...s.nf, items: s.nf.items.filter((_, idx) => idx !== i) } })),
  swapToEditor: (i) =>
    set((s) => {
      const f = s.nf;
      const target = f.items[i];
      if (!target) return {};
      const items = f.items.slice();
      if (f.brand.trim()) {
        items[i] = { type: f.type, category: f.category, brand: f.brand.trim(), model: f.model.trim(), size: f.size.trim() || "—", colour: f.colour.trim(), services: f.services.slice(), serviceData: { ...f.serviceData }, priceOverride: f.priceOverride ?? "" };
      } else {
        items.splice(i, 1);
      }
      return {
        nf: {
          ...f,
          items,
          type: target.type,
          category: target.category,
          brand: target.brand,
          model: target.model,
          size: target.size,
          colour: target.colour || "",
          services: (target.services || []).slice(),
          serviceData: { ...(target.serviceData || {}) },
          priceOverride: target.priceOverride != null ? target.priceOverride : "",
        },
        itemMenuIdx: null,
        priceEditIdx: null,
      };
    }),
  setItemPriceOverride: (i, v) => set((s) => ({ nf: { ...s.nf, items: s.nf.items.map((x, xi) => (xi === i ? { ...x, priceOverride: v } : x)) } })),
  setItemMenuIdx: (i) => set({ itemMenuIdx: i }),
  setPriceEditIdx: (i) => set({ priceEditIdx: i }),
  createJob: () => {
    const s = get();
    const f = s.nf;
    const items = f.items.slice();
    if (f.brand.trim())
      items.push({ type: f.type, category: f.category, brand: f.brand.trim(), model: f.model.trim(), size: f.size.trim() || "—", colour: f.colour.trim(), services: f.services.slice(), serviceData: { ...f.serviceData }, code: f.code });
    if (!f.customer.trim() || items.length === 0) return;
    // Newly checked-in equipment starts life in the Checked in Equipment panel — this sheet is staff
    // physically checking equipment in at the counter right now, not booking a future
    // appointment (that's what the "kiosk"/Drop offs Booked seed data represents).
    const equipment = items.map((it) =>
      buildEquip({ type: it.type, category: it.category, brand: it.brand, model: it.model, size: it.size, colour: it.colour, services: it.services, serviceData: it.serviceData }, "", "checked_in"),
    );
    // Re-added equipment keeps the code it already had; anything new gets the next free one.
    const issued = issuedCodes(s.jobs, s.customers);
    equipment.forEach((eq, i) => {
      const existing = items[i].code;
      eq.code = existing || nextEquipmentCode(eq.category, issued);
      issued.push(eq.code);
    });
    // apply price overrides from parked items
    items.forEach((it, i) => {
      if (it.priceOverride != null && it.priceOverride !== "") equipment[i].priceOverride = Number(it.priceOverride);
    });

    if (s.editId) {
      const editId = s.editId;
      set((st) => ({
        jobs: st.jobs.map((j) => {
          if (j.id !== editId) return j;
          const stamp = stampNow();
          const who = st.activeStaff || "Staff";
          // preserve completion ticks — and each item's own stage/workStatus — for equipment
          // that already existed on the same slot; only genuinely new items get the default
          // "checked_in"/"Checked-in" stage assigned above.
          const mergedEquipment = equipment.map((eq, i) => {
            const prevEq = j.equipment[i];
            if (!prevEq) return eq;
            const doneFlags = eq.services.map((name) => {
              const prevIdx = prevEq.services.indexOf(name);
              return prevIdx >= 0 ? !!prevEq.doneFlags[prevIdx] : false;
            });
            return { ...eq, doneFlags, loc: prevEq.loc, stage: prevEq.stage, workStatus: prevEq.workStatus };
          });
          return {
            ...j,
            customer: f.customer.trim(),
            email: f.email || j.email,
            phone: f.phone || j.phone,
            due: f.due || "—",
            pickup: f.pickup || "—",
            notes: f.notes || "",
            equipment: mergedEquipment,
            updates: [{ text: "Job edited", at: who + " · " + stamp }, ...j.updates],
          };
        }),
        newOpen: false,
        editId: null,
        nf: blankForm(),
        custQuery: "",
        selectedId: editId,
        activeTab: 0,
      }));
      return;
    }

    set((st) => {
      const id = nextJobIdStr(st.jobs);
      const job: Job = {
        id,
        customer: f.customer.trim(),
        email: f.email || (f.customer.trim().split(/\s+/)[0]?.toLowerCase() || "customer") + "@pistelabs.com",
        phone: f.phone || "+353 86 863 3044",
        status: "",
        paid: 0,
        due: f.due || "—",
        pickup: f.pickup || "—",
        dropoff: "",
        notes: f.notes || "",
        tech: st.activeStaff || "Staff",
        updatedAt: stampNow(),
        updates: [],
        equipment,
      };
      return { jobs: [job, ...st.jobs], newOpen: false, nf: blankForm(), custQuery: "", selectedId: id, activeTab: 0 };
    });
  },

  // ---- customer search / select ----
  setCustQuery: (q) => set({ custQuery: q }),
  selectCustomer: (c) => set((s) => ({ nf: { ...s.nf, customerId: c.id, customer: c.first + " " + c.last, email: c.email, phone: c.phone }, custQuery: "" })),
  clearCustomer: () => set((s) => ({ nf: { ...s.nf, customerId: null, customer: "", email: "", phone: "", brand: "", model: "", size: "" }, custQuery: "" })),
  toggleCustEquip: (eq) =>
    set((s) => {
      const on = s.nf.brand === eq.brand && s.nf.model === eq.model && s.nf.size === eq.size && s.nf.type === eq.type;
      if (on) return { nf: { ...s.nf, type: "SKI", category: "Alpine Ski", brand: "", model: "", size: "", code: undefined } };
      return {
        nf: { ...s.nf, type: eq.type, category: eq.category || defaultCategoryForType(eq.type), brand: eq.brand, model: eq.model, size: eq.size, code: eq.code },
      };
    }),

  // ---- add/edit customer ----
  openAddCust: (prefill) => set({ addCustOpen: true, editCustId: null, ncust: { ...blankCust(), ...prefill } }),
  editCustomerByName: (name, email, phone) => {
    const s = get();
    const c = s.customers.find((x) => x.first + " " + x.last === name);
    if (c) {
      set({ editCustId: c.id, addCustOpen: true, ncust: { first: c.first, last: c.last, email: c.email, phone: c.phone, channel: c.channel } });
    } else {
      const parts = (name || "").trim().split(" ");
      set({ editCustId: null, addCustOpen: true, ncust: { first: parts[0] || "", last: parts.slice(1).join(" "), email: email || "", phone: phone || "", channel: "Email" } });
    }
  },
  closeAddCust: () => set({ addCustOpen: false, editCustId: null }),
  patchNcust: (patch) => set((s) => ({ ncust: { ...s.ncust, ...patch } })),
  addCustomer: () => {
    const s = get();
    const n = s.ncust;
    if (!n.first.trim() || !n.last.trim()) return;
    if (s.editCustId) {
      const editId = s.editCustId;
      const fullName = n.first.trim() + " " + n.last.trim();
      set((st) => {
        const prev = st.customers.find((c) => c.id === editId);
        const prevName = prev ? prev.first + " " + prev.last : null;
        return {
          customers: st.customers.map((c) => (c.id === editId ? { ...c, first: n.first.trim(), last: n.last.trim(), email: n.email.trim(), phone: n.phone.trim(), channel: n.channel } : c)),
          jobs: st.jobs.map((j) => (prevName && j.customer === prevName ? { ...j, customer: fullName, email: n.email.trim() || j.email, phone: n.phone.trim() || j.phone } : j)),
          nf: st.nf.customerId === editId ? { ...st.nf, customer: fullName, email: n.email.trim(), phone: n.phone.trim() } : st.nf,
          addCustOpen: false,
          editCustId: null,
          ncust: blankCust(),
        };
      });
      return;
    }
    const c: Customer = { id: "c" + Date.now(), first: n.first.trim(), last: n.last.trim(), email: n.email.trim(), phone: n.phone.trim(), channel: n.channel, equipment: [] };
    set((st) => ({
      customers: [c, ...st.customers],
      addCustOpen: false,
      ncust: blankCust(),
      nf: { ...st.nf, customerId: c.id, customer: c.first + " " + c.last, email: c.email, phone: c.phone },
      custQuery: "",
    }));
  },
}));

export { nextJobIdStr };
