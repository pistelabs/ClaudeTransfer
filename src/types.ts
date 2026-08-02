/** Appointment type codes. `MT` is an internal team-meeting block, not a booking. */
export type TypeCode = 'BF' | 'FB' | 'SH' | 'HM' | 'AL' | 'TU' | 'MT';

export interface ApptType {
  label: string;
  bg: string;
  border: string;
  text: string;
}

export interface Staff {
  name: string;
  role: string;
  dot: string;
  initials: string;
  /** [start, end] minutes from midnight */
  shift: [number, number];
  /** unpaid lunch, minutes from midnight */
  brk: [number, number];
}

export interface Appointment {
  id: string;
  /** day index, Monday = 0 */
  d: number;
  /** staff index */
  s: number;
  /** start, minutes from midnight */
  st: number;
  /** duration in minutes */
  du: number;
  t: TypeCode;
  /** primary customer name (or meeting title for `MT`) */
  c: string;
  /** note */
  n: string;
  /** every customer on the booking, when more than one */
  party?: string[];
  /** buffer before / after, minutes */
  bb: number;
  ba: number;
  /** name of the staff member who took the booking */
  by?: string | null;
}

/** An appointment placed into a lane by the overlap packer. */
export interface LaidOutAppt extends Appointment {
  lane: number;
  lanes: number;
}

export interface Customer {
  id: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  visits: number;
  channel: 'Email' | 'SMS';
}

export interface Service {
  id: string;
  name: string;
  t: TypeCode;
  /** duration, minutes */
  du: number;
  price: string;
  /** buffer before / after, minutes */
  bb?: number;
  ba?: number;
  /** how many customers the service takes; absent means 1 */
  seats?: number;
}

export interface ServiceGroup {
  key: string;
  label: string;
  items: Service[];
}

export type FieldKind = 'text' | 'select';

export interface QuestionField {
  id: string;
  label: string;
  kind: FieldKind;
  ph?: string;
  options?: string[];
  req?: boolean;
}

export type Answers = Record<string, string>;

export interface EquipService {
  sid: string;
  name: string;
  price: string;
  location: string;
  side: 'Left' | 'Right' | 'Both';
  note: string;
}

export interface EquipItem {
  uid: string;
  kind: string;
  model: string;
  size: string;
  flex: string;
  services: EquipService[];
  /** active service-group tab; null falls back to the first group */
  tab: string | null;
}

export interface EquipServiceGroup {
  key: string;
  label: string;
  accent: string;
  items: { name: string; price: string }[];
}

/** Captured information for one appointment, answers kept per person on the booking. */
export interface ApptRecord {
  bookedBy?: number;
  questionnaire?: QuestionnaireMode;
  /** customer questionnaire answers, keyed by index in the party */
  fittingByCustomer?: Record<number, Answers>;
  /** staff assessment answers, keyed by index in the party */
  staffByCustomer?: Record<number, Answers>;
  /** required-at-booking answers for the primary customer */
  details?: Answers;
  seats?: { customer: string; details: Answers }[];
}

export type QuestionnaireMode = 'now' | 'email' | 'onsite';

export type View = 'day' | 'week';

export type SheetPage = 'book' | 'details';

export type ServiceStep = 'service' | 'date' | 'time';

export type DetailTab = 0 | 1 | 2;

export type FittingSide = 'customer' | 'staff';

export type CompleteStep = 'review' | 'workshop';

/** One seat on a multi-customer booking. */
export interface Seat {
  customer: string;
  custQuery: string;
  custPicked: string | null;
  details: Answers;
}

/** In-flight drag of an appointment block. */
export interface DragState {
  id: string;
  /** pointer offset from the top of the block when the drag started */
  grabDy: number;
  d: number;
  s: number;
  st: number;
  du: number;
  moved: boolean;
  x0: number;
  y0: number;
}

/** In-flight sweep over empty grid space. */
export interface SelectionState {
  col: number;
  anchor: number;
  from: number;
  to: number;
  moved?: boolean;
}

export interface MeetingDraft {
  title: string;
  day: number;
  time: string;
  dur: number;
  who: number[];
}

export interface BookingForm {
  /** `${year}-${monthIndex}-${date}` of the selected calendar cell */
  dateKey: string;
  customer: string;
  type: TypeCode;
  /** staff index, or null for unassigned */
  staff: number | null;
  day: number;
  /** `HH:MM` */
  time: string;
  dur: number;
  note: string;
  service: string | null;
}

export interface NewCustomerDraft {
  first: string;
  last: string;
  email: string;
  phone: string;
  channel: 'Email' | 'SMS';
}
