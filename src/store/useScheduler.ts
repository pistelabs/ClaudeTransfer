import { create } from 'zustand';
import {
  ALL_SERVICES,
  EQUIP_KINDS,
  REPEATABLE_SERVICES,
  STAFF,
  equipServiceGroups,
  requiredFields,
  serviceById,
} from '../data/catalogue';
import { SEED_CUSTOMERS, SEED_RECORDS, seedAppointments } from '../data/seed';
import { dateKeyOf, todayIndex, weekDays } from '../lib/dates';
import { collisionsFor, partyOf, slotOpen } from '../lib/schedule';
import { parseTime, stampNow, toTimeValue } from '../lib/time';
import type {
  Answers,
  Appointment,
  ApptRecord,
  BookingForm,
  CompleteStep,
  Customer,
  DetailTab,
  DragState,
  EquipItem,
  FittingSide,
  MeetingDraft,
  NewCustomerDraft,
  QuestionnaireMode,
  Seat,
  SelectionState,
  Service,
  ServiceStep,
  SheetPage,
  View,
} from '../types';

const TODAY = todayIndex();
const DAYS = weekDays();

function emptySeat(): Seat {
  return { customer: '', custQuery: '', custPicked: null, details: {} };
}

function freshForm(day: number): BookingForm {
  return {
    dateKey: dateKeyOf(new Date()),
    customer: '',
    type: 'BF',
    staff: null,
    day,
    time: '09:00',
    dur: 90,
    note: '',
    service: null,
  };
}

function newEquipItem(): EquipItem {
  return { uid: 'e' + Math.random().toString(36).slice(2), kind: 'Boots', model: '', size: '', flex: '', services: [], tab: null };
}

interface State {
  // ---- schedule ----
  view: View;
  selDay: number;
  appts: Appointment[];
  staffFilter: number[];
  colW: Record<string, number>;
  drag: DragState | null;
  sel: SelectionState | null;

  // ---- chrome ----
  searchQ: string;
  searchOpen: boolean;
  filterMenu: boolean;
  addMenu: boolean;

  // ---- new appointment sheet ----
  showAdd: boolean;
  sheetPage: SheetPage;
  svcStep: ServiceStep;
  svcTab: string;
  form: BookingForm;
  monthOffset: number;
  staffOpen: boolean;
  staffUp: boolean;
  prefilled: boolean;
  prefilledDur: number | null;
  rescheduleId: string | null;
  bookedBy: number | null;
  showWho: boolean;
  questionnaire: QuestionnaireMode;
  fitting: Answers;
  details: Answers;
  seatIdx: number;
  seatData: Record<number, Seat>;

  // ---- customers ----
  customers: Customer[];
  custQuery: string;
  custPicked: string | null;
  custFocus: boolean;
  showNewCust: boolean;
  newCust: NewCustomerDraft;

  // ---- team meeting ----
  showMeeting: boolean;
  meeting: MeetingDraft;

  // ---- detail sheet ----
  showDetail: boolean;
  detailId: string | null;
  detailTab: DetailTab;
  detailWho: FittingSide;
  detailCust: number;
  detailStaffOpen: boolean;
  apptMenu: boolean;
  checkins: Record<string, string>;
  saved: Record<string, string>;
  equipment: Record<string, EquipItem[]>;
  records: Record<string, ApptRecord>;

  // ---- complete dialog ----
  showComplete: boolean;
  completeStep: CompleteStep;
  svcDone: Record<string, boolean>;
  pdfReport: boolean;
}

interface Actions {
  setView: (v: View) => void;
  setSelDay: (d: number) => void;
  shiftDate: (dir: number) => void;
  goToday: () => void;

  setSearch: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  toggleFilterMenu: () => void;
  closeFilterMenu: () => void;
  toggleStaffFilter: (idx: number) => void;
  onlyStaff: (idx: number) => void;
  clearStaffFilter: () => void;
  toggleAddMenu: () => void;
  closeAddMenu: () => void;

  setColWidth: (key: string, w: number) => void;
  setDrag: (d: DragState | null) => void;
  commitDrag: () => void;
  setSelection: (s: SelectionState | null) => void;

  openAdd: () => void;
  closeAdd: () => void;
  startBooking: (colIdx: number, mins: number, dur: number | null) => void;
  setBookedBy: (idx: number) => void;
  showWhoGate: () => void;
  setSheetPage: (p: SheetPage) => void;
  setSvcTab: (key: string) => void;
  pickService: (sv: Service) => void;
  pickDate: (dayIdx: number, key: string) => void;
  pickTime: (mins: number) => void;
  setFormStaff: (idx: number | null) => void;
  setStaffOpen: (open: boolean, up?: boolean) => void;
  setMonthOffset: (fn: (n: number) => number) => void;
  setNote: (v: string) => void;
  setDetailField: (id: string, v: string) => void;
  setFittingField: (id: string, v: string) => void;
  setQuestionnaire: (m: QuestionnaireMode) => void;
  switchSeat: (i: number) => void;
  saveAppt: () => void;

  setCustQuery: (v: string) => void;
  setCustFocus: (v: boolean) => void;
  pickCustomer: (c: Customer) => void;
  clearCustomer: () => void;
  openNewCust: () => void;
  closeNewCust: () => void;
  setNewCust: (patch: Partial<NewCustomerDraft>) => void;
  saveNewCust: () => void;

  openMeeting: () => void;
  closeMeeting: () => void;
  setMeeting: (patch: Partial<MeetingDraft>) => void;
  toggleMeetingWho: (idx: number) => void;
  toggleMeetingAll: () => void;
  saveMeeting: () => void;

  openDetail: (id: string) => void;
  closeDetail: () => void;
  setDetailTab: (t: DetailTab) => void;
  setDetailWho: (w: FittingSide) => void;
  setDetailCust: (i: number) => void;
  setDetailStaffOpen: (open: boolean) => void;
  reassignFitter: (staffIdx: number) => void;
  toggleApptMenu: () => void;
  closeApptMenu: () => void;
  checkIn: (key: string) => void;
  markSaved: (suffix: string) => void;
  setCustAnswer: (ci: number, key: string, val: string) => void;
  setStaffAnswer: (ci: number, key: string, val: string) => void;
  rescheduleAppt: () => void;
  deleteAppt: () => void;

  updateEquip: (uid: string, key: 'kind' | 'model' | 'size' | 'flex', val: string) => void;
  removeEquip: (uid: string) => void;
  setEquipTab: (uid: string, key: string) => void;
  toggleEquipService: (uid: string, name: string, price: string) => void;
  addEquipServiceInstance: (uid: string, name: string, price: string) => void;
  removeLastEquipService: (uid: string, name: string) => void;
  removeEquipServiceInstance: (uid: string, sid: string) => void;
  updateEquipService: (uid: string, sid: string, key: 'location' | 'side' | 'note', val: string) => void;

  openComplete: () => void;
  closeComplete: () => void;
  setCompleteStep: (s: CompleteStep) => void;
  toggleSvcDone: (key: string) => void;
  togglePdf: () => void;
  finishComplete: () => void;

  closeAllMenus: () => void;
}

export type SchedulerStore = State & Actions;

export const useScheduler = create<SchedulerStore>((set, get) => ({
  view: 'day',
  selDay: TODAY,
  appts: seedAppointments(TODAY),
  staffFilter: [],
  colW: {},
  drag: null,
  sel: null,

  searchQ: '',
  searchOpen: false,
  filterMenu: false,
  addMenu: false,

  showAdd: false,
  sheetPage: 'book',
  svcStep: 'service',
  svcTab: 'fitting',
  form: freshForm(TODAY),
  monthOffset: 0,
  staffOpen: false,
  staffUp: false,
  prefilled: false,
  prefilledDur: null,
  rescheduleId: null,
  bookedBy: null,
  showWho: false,
  questionnaire: 'email',
  fitting: {},
  details: {},
  seatIdx: 0,
  seatData: {},

  customers: SEED_CUSTOMERS,
  custQuery: '',
  custPicked: null,
  custFocus: false,
  showNewCust: false,
  newCust: { first: '', last: '', email: '', phone: '', channel: 'Email' },

  showMeeting: false,
  meeting: { title: 'Team meeting', day: TODAY, time: '08:30', dur: 30, who: [0, 1, 2, 3] },

  showDetail: false,
  detailId: null,
  detailTab: 0,
  detailWho: 'customer',
  detailCust: 0,
  detailStaffOpen: false,
  apptMenu: false,
  checkins: {},
  saved: {},
  equipment: {},
  records: SEED_RECORDS,

  showComplete: false,
  completeStep: 'review',
  svcDone: {},
  pdfReport: false,

  // ---- schedule ---------------------------------------------------------

  setView: (view) => set({ view }),
  setSelDay: (selDay) => set({ selDay }),
  shiftDate: (dir) =>
    set((s) => (s.view === 'week' ? s : { selDay: Math.max(0, Math.min(6, s.selDay + dir)) })),
  goToday: () => set({ view: 'day', selDay: TODAY }),

  setSearch: (searchQ) => set({ searchQ, searchOpen: true }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  toggleFilterMenu: () => set((s) => ({ filterMenu: !s.filterMenu })),
  closeFilterMenu: () => set({ filterMenu: false }),
  toggleStaffFilter: (idx) =>
    set((s) => ({
      staffFilter: s.staffFilter.includes(idx) ? s.staffFilter.filter((x) => x !== idx) : s.staffFilter.concat(idx),
    })),
  onlyStaff: (idx) => set({ staffFilter: [idx], filterMenu: false }),
  clearStaffFilter: () => set({ staffFilter: [], filterMenu: false }),
  toggleAddMenu: () => set((s) => ({ addMenu: !s.addMenu })),
  closeAddMenu: () => set({ addMenu: false }),

  setColWidth: (key, w) => set((s) => ({ colW: { ...s.colW, [key]: w } })),
  setDrag: (drag) => set({ drag }),
  /** Commits a drag, unless the target slot is already taken — those drops are rejected. */
  commitDrag: () =>
    set((s) => {
      const d = s.drag;
      if (!d || !d.moved) return { drag: null };
      const blocked = collisionsFor(s.appts, { id: d.id, d: d.d, s: d.s, st: d.st, du: d.du }).length > 0;
      if (blocked) return { drag: null };
      return {
        drag: null,
        appts: s.appts.map((a) => (a.id === d.id ? { ...a, d: d.d, s: d.s, st: d.st } : a)),
      };
    }),
  setSelection: (sel) => set({ sel }),

  // ---- new appointment --------------------------------------------------

  openAdd: () =>
    set((s) => ({
      showAdd: true,
      addMenu: false,
      showWho: true,
      bookedBy: null,
      staffOpen: false,
      rescheduleId: null,
      monthOffset: 0,
      sheetPage: 'book',
      details: {},
      questionnaire: 'email',
      fitting: {},
      prefilled: false,
      prefilledDur: null,
      svcStep: 'service',
      svcTab: 'fitting',
      custQuery: '',
      custPicked: null,
      seatIdx: 0,
      seatData: {},
      form: { ...freshForm(s.selDay), day: s.selDay },
    })),

  closeAdd: () =>
    set({ showAdd: false, showWho: false, staffOpen: false, showNewCust: false, custFocus: false, rescheduleId: null }),

  startBooking: (colIdx, mins, dur) =>
    set((s) => {
      const isWeek = s.view === 'week';
      const day = isWeek ? colIdx : s.selDay;
      const staffIdx = isWeek ? null : colIdx;
      return {
        prefilledDur: dur,
        showAdd: true,
        addMenu: false,
        showWho: true,
        bookedBy: null,
        staffOpen: false,
        rescheduleId: null,
        sheetPage: 'book',
        details: {},
        questionnaire: 'email',
        fitting: {},
        svcStep: 'service',
        svcTab: 'fitting',
        prefilled: true,
        custQuery: '',
        custPicked: null,
        seatIdx: 0,
        seatData: {},
        form: {
          ...s.form,
          customer: '',
          service: null,
          note: '',
          dur: dur || s.form.dur,
          day,
          staff: staffIdx,
          dateKey: dateKeyOf(DAYS[day].iso),
          time: toTimeValue(mins),
        },
      };
    }),

  setBookedBy: (bookedBy) => set({ bookedBy, showWho: false }),
  showWhoGate: () => set({ showWho: true }),
  setSheetPage: (sheetPage) => set({ sheetPage, staffOpen: false }),
  setSvcTab: (svcTab) => set({ svcTab }),

  /** Clicking the selected card deselects it and collapses the later steps. */
  pickService: (sv) =>
    set((s) =>
      s.form.service === sv.id
        ? { form: { ...s.form, service: null }, svcStep: 'service', seatIdx: 0, seatData: {} }
        : {
            form: { ...s.form, service: sv.id, type: sv.t, dur: s.prefilledDur || sv.du },
            svcStep: s.prefilled ? 'time' : 'date',
            seatIdx: 0,
            seatData: {},
          },
    ),

  pickDate: (dayIdx, key) => set((s) => ({ form: { ...s.form, day: dayIdx, dateKey: key }, svcStep: 'time' })),
  pickTime: (mins) => set((s) => ({ form: { ...s.form, time: toTimeValue(mins) } })),
  setFormStaff: (idx) => set((s) => ({ form: { ...s.form, staff: idx }, staffOpen: false })),
  setStaffOpen: (staffOpen, staffUp = false) => set({ staffOpen, staffUp }),
  setMonthOffset: (fn) => set((s) => ({ monthOffset: fn(s.monthOffset) })),
  setNote: (v) => set((s) => ({ form: { ...s.form, note: v } })),
  setDetailField: (id, v) => set((s) => ({ details: { ...s.details, [id]: v } })),
  setFittingField: (id, v) => set((s) => ({ fitting: { ...s.fitting, [id]: v } })),
  setQuestionnaire: (questionnaire) => set({ questionnaire }),

  /** Parks the seat being edited and swaps in whatever the next seat had. */
  switchSeat: (i) =>
    set((s) => {
      if (i === s.seatIdx) return s;
      const snapshot: Seat = { customer: s.form.customer, custQuery: s.custQuery, custPicked: s.custPicked, details: { ...s.details } };
      const store = { ...s.seatData, [s.seatIdx]: snapshot };
      const next = store[i] ?? emptySeat();
      return {
        seatData: store,
        seatIdx: i,
        custFocus: false,
        custQuery: next.custQuery,
        custPicked: next.custPicked,
        details: { ...next.details },
        form: { ...s.form, customer: next.customer },
      };
    }),

  saveAppt: () => {
    const s = get();
    const f = s.form;

    // rescheduling an existing appointment: move it and close
    if (s.rescheduleId) {
      const mins = parseTime(f.time);
      const id = s.rescheduleId;
      set((st) => ({
        appts: st.appts.map((a) =>
          a.id === id ? { ...a, d: f.day, s: f.staff === null ? a.s : f.staff, st: mins, du: f.dur } : a,
        ),
        showAdd: false,
        rescheduleId: null,
        view: 'day',
        selDay: f.day,
      }));
      return;
    }

    if (!f.customer.trim() || !f.service || s.svcStep !== 'time') return;
    if (seatMissingTotal(s) > 0) return;

    const mins = parseTime(f.time);
    if (!slotOpen(s.appts, f.staff, f.day, mins, f.dur, s.rescheduleId)) return;

    // unassigned → hand it to the first fitter actually free for that slot
    let si = f.staff;
    if (si === null) {
      const found = STAFF.findIndex((_, i) => slotOpen(s.appts, i, f.day, mins, f.dur));
      si = found === -1 ? 0 : found;
    }

    const by = s.bookedBy !== null ? STAFF[s.bookedBy].name : null;
    const note = [f.note.trim(), by ? `Booked by ${by}` : ''].filter(Boolean).join(' · ');
    const sv = serviceById(f.service);
    const seats = Array.from({ length: seatCountOf(s) }, (_, i) => seatAt(s, i));
    const names = seats.map((x) => x.customer.trim()).filter(Boolean);

    const appt: Appointment = {
      id: 'u' + Date.now(),
      d: f.day,
      s: si,
      st: mins,
      du: f.dur,
      t: f.type,
      c: names[0] || f.customer.trim(),
      n: note,
      by,
      bb: sv?.bb ?? 0,
      ba: sv?.ba ?? 0,
      party: names.length > 1 ? names : undefined,
    };

    set((st) => ({
      appts: [...st.appts, appt],
      records: {
        ...st.records,
        [appt.id]: {
          fittingByCustomer: { 0: { ...st.fitting } },
          details: { ...seats[0].details },
          seats: seats.map((x) => ({ customer: x.customer, details: x.details })),
          bookedBy: st.bookedBy ?? undefined,
          questionnaire: st.questionnaire,
        },
      },
      seatIdx: 0,
      seatData: {},
      showAdd: false,
      selDay: f.day,
      svcStep: 'service',
      sheetPage: 'book',
      details: {},
      custQuery: '',
      custPicked: null,
      form: freshForm(f.day),
    }));
  },

  // ---- customers --------------------------------------------------------

  setCustQuery: (v) => set((s) => ({ custQuery: v, custFocus: true, custPicked: null, form: { ...s.form, customer: v } })),
  setCustFocus: (custFocus) => set({ custFocus }),
  pickCustomer: (c) =>
    set((s) => ({
      custPicked: c.id,
      custQuery: `${c.first} ${c.last}`,
      custFocus: false,
      form: { ...s.form, customer: `${c.first} ${c.last}` },
    })),
  clearCustomer: () => set((s) => ({ custPicked: null, custQuery: '', custFocus: true, form: { ...s.form, customer: '' } })),
  openNewCust: () => {
    const q = get().custQuery.trim().split(/\s+/);
    set({
      showNewCust: true,
      custFocus: false,
      newCust: { first: q[0] || '', last: q.slice(1).join(' '), email: '', phone: '', channel: 'Email' },
    });
  },
  closeNewCust: () => set({ showNewCust: false }),
  setNewCust: (patch) => set((s) => ({ newCust: { ...s.newCust, ...patch } })),
  saveNewCust: () => {
    const n = get().newCust;
    if (!n.first.trim()) return;
    const c: Customer = {
      id: 'c' + Date.now(),
      first: n.first.trim(),
      last: n.last.trim(),
      email: n.email.trim() || '—',
      phone: n.phone.trim() || '—',
      visits: 0,
      channel: n.channel,
    };
    const name = c.first + (c.last ? ` ${c.last}` : '');
    set((s) => ({
      customers: [c, ...s.customers],
      showNewCust: false,
      custPicked: c.id,
      custQuery: name,
      form: { ...s.form, customer: name },
    }));
  },

  // ---- team meeting -----------------------------------------------------

  openMeeting: () => set((s) => ({ addMenu: false, showMeeting: true, meeting: { ...s.meeting, day: s.selDay } })),
  closeMeeting: () => set({ showMeeting: false }),
  setMeeting: (patch) => set((s) => ({ meeting: { ...s.meeting, ...patch } })),
  toggleMeetingWho: (idx) =>
    set((s) => ({
      meeting: {
        ...s.meeting,
        who: s.meeting.who.includes(idx) ? s.meeting.who.filter((x) => x !== idx) : s.meeting.who.concat(idx),
      },
    })),
  toggleMeetingAll: () =>
    set((s) => ({
      meeting: { ...s.meeting, who: s.meeting.who.length === STAFF.length ? [] : STAFF.map((_, i) => i) },
    })),
  /** Writes one block per attendee, sharing a group id so they read as one meeting. */
  saveMeeting: () => {
    const m = get().meeting;
    if (!m.title.trim() || !m.who.length) return;
    const start = parseTime(m.time);
    const stamp = Date.now();
    const blocks: Appointment[] = m.who.map((si) => ({
      id: `m${stamp}-${si}`,
      d: m.day,
      s: si,
      st: start,
      du: m.dur,
      t: 'MT',
      c: m.title.trim(),
      n: 'Internal · all hands',
      bb: 0,
      ba: 0,
    }));
    set((s) => ({ appts: [...s.appts, ...blocks], showMeeting: false, view: 'day', selDay: m.day }));
  },

  // ---- detail sheet -----------------------------------------------------

  openDetail: (id) =>
    set({ showDetail: true, detailId: id, detailTab: 0, detailWho: 'customer', detailCust: 0, apptMenu: false, detailStaffOpen: false }),
  closeDetail: () => set({ showDetail: false }),
  setDetailTab: (detailTab) => set({ detailTab }),
  setDetailWho: (detailWho) => set({ detailWho }),
  setDetailCust: (detailCust) => set({ detailCust }),
  setDetailStaffOpen: (detailStaffOpen) => set({ detailStaffOpen }),
  reassignFitter: (staffIdx) =>
    set((s) => ({
      detailStaffOpen: false,
      appts: s.appts.map((a) => (a.id === s.detailId ? { ...a, s: staffIdx } : a)),
    })),
  toggleApptMenu: () => set((s) => ({ apptMenu: !s.apptMenu })),
  closeApptMenu: () => set({ apptMenu: false }),

  checkIn: (key) =>
    set((s) => (s.checkins[key] ? s : { checkins: { ...s.checkins, [key]: stampNow() } })),

  markSaved: (suffix) =>
    set((s) => ({ saved: { ...s.saved, [`${s.detailId}:${suffix}`]: stampNow() } })),

  setCustAnswer: (ci, key, val) =>
    set((s) => {
      const id = s.detailId;
      if (!id) return s;
      const rec = s.records[id] ?? {};
      const byCust = { ...(rec.fittingByCustomer ?? {}) };
      byCust[ci] = { ...(byCust[ci] ?? {}), [key]: val };
      return { records: { ...s.records, [id]: { ...rec, fittingByCustomer: byCust } } };
    }),

  setStaffAnswer: (ci, key, val) =>
    set((s) => {
      const id = s.detailId;
      if (!id) return s;
      const rec = s.records[id] ?? {};
      const byCust = { ...(rec.staffByCustomer ?? {}) };
      byCust[ci] = { ...(byCust[ci] ?? {}), [key]: val };
      return { records: { ...s.records, [id]: { ...rec, staffByCustomer: byCust } } };
    }),

  /** Reopens the booking sheet on the date/time step, prefilled from this appointment. */
  rescheduleAppt: () => {
    const s = get();
    const a = s.appts.find((x) => x.id === s.detailId);
    if (!a) {
      set({ apptMenu: false });
      return;
    }
    const svc = ALL_SERVICES.find((x) => x.t === a.t) ?? null;
    set({
      apptMenu: false,
      showDetail: false,
      showAdd: true,
      showWho: false,
      bookedBy: null,
      staffOpen: false,
      sheetPage: 'book',
      svcStep: 'time',
      prefilled: true,
      prefilledDur: a.du,
      rescheduleId: a.id,
      custQuery: a.c,
      custPicked: null,
      form: {
        dateKey: dateKeyOf(DAYS[a.d].iso),
        customer: a.c,
        type: a.t,
        staff: a.s,
        day: a.d,
        note: a.n || '',
        time: toTimeValue(a.st),
        dur: a.du,
        service: svc ? svc.id : null,
      },
    });
  },

  deleteAppt: () =>
    set((s) => ({ apptMenu: false, showDetail: false, appts: s.appts.filter((x) => x.id !== s.detailId) })),

  // ---- equipment --------------------------------------------------------

  updateEquip: (uid, key, val) =>
    setEquip(set, get, (list) =>
      list.map((e) => {
        if (e.uid !== uid) return e;
        const next = { ...e, [key]: val };
        if (key === 'kind') {
          next.size = '';
          next.flex = '';
          next.tab = null;
          // drop services that don't exist for the new equipment type
          const valid = equipServiceGroups(val).flatMap((g) => g.items.map((i) => i.name));
          next.services = e.services.filter((sv) => valid.includes(sv.name));
        }
        return next;
      }),
    ),

  removeEquip: (uid) =>
    setEquip(set, get, (list) => {
      const next = list.filter((e) => e.uid !== uid);
      return next.length ? next : [newEquipItem()];
    }),

  setEquipTab: (uid, key) => setEquip(set, get, (list) => list.map((e) => (e.uid === uid ? { ...e, tab: key } : e))),

  toggleEquipService: (uid, name, price) =>
    setEquip(set, get, (list) =>
      list.map((e) =>
        e.uid !== uid
          ? e
          : {
              ...e,
              services: e.services.some((sv) => sv.name === name)
                ? e.services.filter((sv) => sv.name !== name)
                : e.services.concat({ sid: 's' + Math.random().toString(36).slice(2), name, price, location: '', side: 'Both', note: '' }),
            },
      ),
    ),

  addEquipServiceInstance: (uid, name, price) =>
    setEquip(set, get, (list) =>
      list.map((e) =>
        e.uid !== uid
          ? e
          : { ...e, services: e.services.concat({ sid: 's' + Math.random().toString(36).slice(2), name, price, location: '', side: 'Both', note: '' }) },
      ),
    ),

  removeLastEquipService: (uid, name) =>
    setEquip(set, get, (list) =>
      list.map((e) => {
        if (e.uid !== uid) return e;
        const idx = e.services.map((sv) => sv.name).lastIndexOf(name);
        if (idx === -1) return e;
        return { ...e, services: e.services.filter((_, i) => i !== idx) };
      }),
    ),

  removeEquipServiceInstance: (uid, sid) =>
    setEquip(set, get, (list) => list.map((e) => (e.uid !== uid ? e : { ...e, services: e.services.filter((sv) => sv.sid !== sid) }))),

  updateEquipService: (uid, sid, key, val) =>
    setEquip(set, get, (list) =>
      list.map((e) =>
        e.uid !== uid ? e : { ...e, services: e.services.map((sv) => (sv.sid === sid ? { ...sv, [key]: val } : sv)) },
      ),
    ),

  // ---- complete dialog --------------------------------------------------

  openComplete: () => set({ showComplete: true, apptMenu: false, completeStep: 'review' }),
  closeComplete: () => set({ showComplete: false }),
  setCompleteStep: (completeStep) => set({ completeStep }),
  toggleSvcDone: (key) => set((s) => ({ svcDone: { ...s.svcDone, [key]: !s.svcDone[key] } })),
  togglePdf: () => set((s) => ({ pdfReport: !s.pdfReport })),
  finishComplete: () => set({ showComplete: false, showDetail: false, completeStep: 'review' }),

  closeAllMenus: () => set({ addMenu: false, filterMenu: false, apptMenu: false }),
}));

// ---- equipment helpers ---------------------------------------------------

type Setter = (fn: (s: SchedulerStore) => Partial<SchedulerStore>) => void;

/** Equipment is recorded per appointment *and* per person on the booking. */
export function equipKeyOf(s: State): string {
  const a = s.appts.find((x) => x.id === s.detailId);
  const n = a ? partyOf(a).length : 1;
  return `${s.detailId}:${Math.min(s.detailCust, n - 1)}`;
}

/** Always keeps one open entry row so equipment can be recorded without an extra click. */
export function equipListOf(s: State): EquipItem[] {
  const list = s.equipment[equipKeyOf(s)];
  return list && list.length ? list : [{ uid: 'e-first', kind: EQUIP_KINDS[0], model: '', size: '', flex: '', services: [], tab: null }];
}

function setEquip(set: Setter, get: () => SchedulerStore, fn: (list: EquipItem[]) => EquipItem[]) {
  const s = get();
  const key = equipKeyOf(s);
  set(() => ({ equipment: { ...s.equipment, [key]: fn(equipListOf(s)) } }));
}

// ---- seat helpers --------------------------------------------------------

export function seatCountOf(s: Pick<State, 'form'>): number {
  return serviceById(s.form.service)?.seats ?? 1;
}

export function seatAt(s: State, i: number): Seat {
  if (i === s.seatIdx) {
    return { customer: s.form.customer, custQuery: s.custQuery, custPicked: s.custPicked, details: { ...s.details } };
  }
  return s.seatData[i] ?? emptySeat();
}

/** How many required answers (including the customer itself) a seat is still missing. */
export function seatMissing(s: State, i: number): number {
  const seat = seatAt(s, i);
  const need = requiredFields(s.form.type).filter((f) => f.req);
  return need.filter((f) => !(seat.details[f.id] ?? '').trim()).length + (seat.customer.trim() ? 0 : 1);
}

export function seatMissingTotal(s: State): number {
  let n = 0;
  for (let i = 0; i < seatCountOf(s); i++) n += seatMissing(s, i);
  return n;
}

export { REPEATABLE_SERVICES };
export const DAY_INFO = DAYS;
export const TODAY_IDX = TODAY;
