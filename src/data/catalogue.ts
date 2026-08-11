import type {
  ApptType,
  EquipServiceGroup,
  QuestionField,
  Service,
  ServiceGroup,
  Staff,
  TypeCode,
} from '../types';

export const TYPES: Record<TypeCode, ApptType> = {
  BF: { label: 'Boot Fitting', bg: '#e0f2fe', border: '#0284c7', text: '#075985' },
  FB: { label: 'Custom Footbed', bg: '#ccfbf1', border: '#0d9488', text: '#115e59' },
  SH: { label: 'Shell Fit / Punch', bg: '#cbd5e1', border: '#334155', text: '#1e293b' },
  HM: { label: 'Heat Mold', bg: '#fef3c7', border: '#d97706', text: '#92400e' },
  AL: { label: 'Alignment / Cant', bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6' },
  TU: { label: 'Ski Mount / Tune', bg: '#ffe4e6', border: '#e11d48', text: '#9f1239' },
  MT: { label: 'Team Meeting', bg: '#d6d3d0', border: '#292524', text: '#292524' },
};

/** The branch this console is signed in to. Comes from the account in a real deployment. */
export const STORE = { name: 'Alpine Bootfit', location: 'Chamonix' };

/** shift = scheduled working window, brk = unpaid lunch, both in minutes from midnight. */
export const STAFF: Staff[] = [
  { name: 'Erik Lund', role: 'Master Bootfitter', dot: '#0284c7', initials: 'EL', shift: [510, 1050], brk: [750, 795] },
  { name: 'Maya Torres', role: 'Bootfitter', dot: '#0d9488', initials: 'MT', shift: [540, 1080], brk: [780, 825] },
  { name: 'Sven Holt', role: 'Alpine Tech', dot: '#7c3aed', initials: 'SH', shift: [510, 990], brk: [720, 765] },
  { name: 'Priya Anand', role: 'Footbed Specialist', dot: '#e11d48', initials: 'PA', shift: [555, 1020], brk: [765, 810] },
];

/** Week view draws one shift band per day rather than per fitter. */
export const SHOP_HOURS: [number, number] = [540, 1020];

/** Bookable service catalogue, grouped into the tabs shown in the new-appointment sheet. */
export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: 'fitting',
    label: 'Boot Fitting',
    items: [
      { id: 'bf-full', name: 'Full Boot Fitting', t: 'BF', du: 90, price: '€120.00', ba: 15 },
      { id: 'bf-rac', name: 'Race Stock Fit', t: 'BF', du: 120, price: '€180.00', ba: 15 },
      { id: 'bf-tour', name: 'Touring Boot Fit', t: 'BF', du: 90, price: '€130.00' },
      { id: 'bf-jr', name: 'Junior Fit', t: 'BF', du: 45, price: '€60.00' },
      { id: 'bf-couple', name: 'Couples Boot Fitting', t: 'BF', du: 150, price: '€220.00', ba: 15, seats: 2 },
    ],
  },
  {
    key: 'footbeds',
    label: 'Footbeds',
    items: [
      { id: 'fb-cust', name: 'Custom Footbed', t: 'FB', du: 90, price: '€185.00', ba: 15 },
      { id: 'fb-cork', name: 'Cork Footbed Cast', t: 'FB', du: 90, price: '€210.00', ba: 30 },
      { id: 'fb-grind', name: 'Footbed Regrind', t: 'FB', du: 45, price: '€45.00' },
    ],
  },
  {
    key: 'mods',
    label: 'Modifications',
    items: [
      { id: 'sh-punch', name: 'Shell Punch', t: 'SH', du: 45, price: '€55.00' },
      { id: 'sh-grind', name: 'Shell Grind', t: 'SH', du: 45, price: '€65.00' },
      { id: 'hm-liner', name: 'Liner Heat Mold', t: 'HM', du: 45, price: '€50.00', bb: 15, ba: 20 },
      { id: 'hm-shell', name: 'Shell Heat Stretch', t: 'HM', du: 60, price: '€70.00', bb: 15, ba: 20 },
    ],
  },
  {
    key: 'align',
    label: 'Alignment',
    items: [
      { id: 'al-cant', name: 'Canting Assessment', t: 'AL', du: 90, price: '€140.00' },
      { id: 'al-sole', name: 'Sole Planing', t: 'AL', du: 60, price: '€95.00' },
    ],
  },
  {
    key: 'ski',
    label: 'Ski Service',
    items: [
      { id: 'tu-mount', name: 'Binding Mount', t: 'TU', du: 60, price: '€75.00', ba: 15 },
      { id: 'tu-tune', name: 'Full Tune & Wax', t: 'TU', du: 45, price: '€55.00' },
      { id: 'tu-hotwax', name: 'Hot Wax', t: 'TU', du: 30, price: '€25.00' },
    ],
  },
];

export const ALL_SERVICES: Service[] = SERVICE_GROUPS.flatMap((g) => g.items);

export function serviceById(id: string | null): Service | null {
  if (!id) return null;
  return ALL_SERVICES.find((s) => s.id === id) ?? null;
}

/** Customer fitting questionnaire — asked at booking, emailed, or captured at the bench. */
export const FITTING_QUESTIONS: QuestionField[] = [
  { id: 'height', label: 'Height', kind: 'text', ph: 'e.g. 178 cm' },
  { id: 'weight', label: 'Weight', kind: 'text', ph: 'e.g. 74 kg' },
  { id: 'ability', label: 'Skier ability', kind: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert / Race'] },
  { id: 'days', label: 'Days on snow / yr', kind: 'select', options: ['1–5', '6–15', '16–40', '40+'] },
  { id: 'terrain', label: 'Usual terrain', kind: 'select', options: ['Groomed piste', 'All-mountain', 'Off-piste / powder', 'Park', 'Touring'] },
  { id: 'injuries', label: 'Foot or leg injuries', kind: 'text', ph: 'Fractures, surgery, chronic pain' },
];

/** Staff assessment — recorded by the fitter during the appointment only. */
export const STAFF_QUESTIONS: QuestionField[] = [
  { id: 's_footlen', label: 'Foot length (mm)', kind: 'text', ph: 'e.g. 273' },
  { id: 's_footwid', label: 'Forefoot width (mm)', kind: 'text', ph: 'e.g. 101' },
  { id: 's_instep', label: 'Instep height', kind: 'select', options: ['Low', 'Average', 'High'] },
  { id: 's_arch', label: 'Measured arch', kind: 'select', options: ['Flat', 'Low', 'Neutral', 'High'] },
  { id: 's_shell', label: 'Shell fit (finger)', kind: 'select', options: ['Race — 1 finger', 'Performance — 1.5', 'Comfort — 2', 'Too large'] },
  { id: 's_flexrec', label: 'Recommended flex', kind: 'select', options: ['80', '90', '100', '110', '120', '130', '140'] },
  { id: 's_canting', label: 'Canting observed', kind: 'select', options: ['Neutral', 'Varus (bow-legged)', 'Valgus (knock-kneed)'] },
  { id: 's_work', label: 'Work carried out', kind: 'text', ph: 'Punches, grinds, mold cycles' },
];

/** Service-specific information the fitter needs before the appointment. */
const REQUIRED_FIELDS: Partial<Record<TypeCode, QuestionField[]>> = {
  BF: [
    { id: 'mondo', label: 'Mondopoint / shoe size', kind: 'text', ph: 'e.g. 27.5 / EU 43', req: true },
    { id: 'current', label: 'Current boots', kind: 'text', ph: 'Brand, model, age', req: true },
    { id: 'issues', label: 'Known fit issues', kind: 'select', req: true, options: ['None', 'Narrow heel / heel lift', 'Wide forefoot', 'High instep', 'Sixth toe / bunion', 'Cold feet', 'Shin bang'] },
    { id: 'orthotic', label: 'Uses orthotics?', kind: 'select', req: true, options: ['No', 'Yes — ski specific', 'Yes — everyday orthotic'] },
  ],
  FB: [
    { id: 'mondo', label: 'Mondopoint / shoe size', kind: 'text', ph: 'e.g. 27.5 / EU 43', req: true },
    { id: 'arch', label: 'Arch profile', kind: 'select', req: true, options: ['Unknown', 'Low / flat', 'Neutral', 'High'] },
    { id: 'prev', label: 'Previous footbeds', kind: 'select', req: true, options: ['None', 'Stock liner insole', 'Custom — under 2 yrs', 'Custom — over 2 yrs'] },
    { id: 'boots', label: 'Boots to fit them into', kind: 'text', ph: 'Brand and model', req: true },
  ],
  SH: [
    { id: 'boots', label: 'Boot brand & model', kind: 'text', ph: 'e.g. Lange RX 120', req: true },
    { id: 'pain', label: 'Pressure point location', kind: 'select', req: true, options: ['Sixth toe / bunion', 'Navicular', 'Ankle bone', 'Instep', 'Heel', 'Calf / cuff'] },
    { id: 'side', label: 'Which foot', kind: 'select', req: true, options: ['Left', 'Right', 'Both'] },
  ],
  HM: [
    { id: 'boots', label: 'Boot brand & model', kind: 'text', ph: 'e.g. Atomic Hawx 130', req: true },
    { id: 'liner', label: 'Liner type', kind: 'select', req: true, options: ['Stock liner', 'Intuition', 'Zipfit', 'Other aftermarket'] },
    { id: 'session', label: 'Mold session', kind: 'select', req: true, options: ['First mold', 'Re-mold / adjustment'] },
  ],
  AL: [
    { id: 'boots', label: 'Boot brand & model', kind: 'text', ph: 'e.g. Head Raptor', req: true },
    { id: 'knee', label: 'Knee tracking', kind: 'select', req: true, options: ['Unknown', 'Knock-kneed (valgus)', 'Bow-legged (varus)', 'Neutral'] },
    { id: 'discipline', label: 'Primary discipline', kind: 'select', req: true, options: ['All-mountain', 'Piste / carving', 'Race', 'Touring', 'Park'] },
  ],
  TU: [
    { id: 'skis', label: 'Ski brand & length', kind: 'text', ph: 'e.g. Völkl Mantra 177', req: true },
    { id: 'binding', label: 'Binding model', kind: 'text', ph: 'e.g. Marker Griffon 13', req: true },
    { id: 'bsl', label: 'Boot sole length (mm)', kind: 'text', ph: 'e.g. 305', req: true },
    { id: 'din', label: 'DIN setting', kind: 'text', ph: 'e.g. 8.5', req: false },
  ],
};

export function requiredFields(t: TypeCode): QuestionField[] {
  return REQUIRED_FIELDS[t] ?? [];
}

// ---- equipment -----------------------------------------------------------

export const EQUIP_KINDS = ['Boots', 'Skis', 'Snowboard', 'Bindings', 'Footbeds', 'Liners', 'Poles', 'Helmet'];

/**
 * Brands the shop sees, per equipment type. `Other` is always last so a brand
 * nobody stocks can still be recorded — the model field carries the rest.
 */
const EQUIP_BRANDS: Record<string, string[]> = {
  Boots: ['Atomic', 'Dalbello', 'Fischer', 'Full Tilt', 'Head', 'K2', 'Lange', 'Nordica', 'Rossignol', 'Salomon', 'Scarpa', 'Tecnica'],
  Skis: ['Armada', 'Atomic', 'Black Crows', 'Blizzard', 'Dynastar', 'Elan', 'Fischer', 'Head', 'K2', 'Line', 'Nordica', 'Rossignol', 'Salomon', 'Völkl'],
  Snowboard: ['Burton', 'CAPiTA', 'GNU', 'Jones', 'Lib Tech', 'Never Summer', 'Nidecker', 'Ride', 'Salomon', 'YES'],
  Bindings: ['ATK', 'Atomic', 'Dynafit', 'Fritschi', 'Look', 'Marker', 'Salomon', 'Tyrolia', 'Union'],
  Footbeds: ["Conform'able", 'Sidas', 'Superfeet', 'Surefoot', 'Shop cast'],
  Liners: ['Atomic', 'Intuition', 'Palau', 'Salomon', 'ZipFit'],
  Poles: ['Black Diamond', 'Komperdell', 'Leki', 'Scott', 'Swix'],
  Helmet: ['Atomic', 'Giro', 'POC', 'Salomon', 'Smith', 'Sweet Protection'],
};

export function equipBrands(kind: string): string[] {
  return [...(EQUIP_BRANDS[kind] ?? []), 'Other'];
}

const EQUIP_SERVICES: Record<string, EquipServiceGroup[]> = {
  Boots: [
    { key: 'fitting', label: 'Fitting', accent: '#0284c7', items: [{ name: 'Full Boot Fitting', price: '€120.00' }, { name: 'Shell Fit Assessment', price: '€40.00' }] },
    { key: 'mods', label: 'Modifications', accent: '#d97706', items: [{ name: 'Shell Punch', price: '€55.00' }, { name: 'Shell Grind', price: '€65.00' }, { name: 'Cuff Alignment', price: '€45.00' }] },
    { key: 'heat', label: 'Heat Molding', accent: '#e11d48', items: [{ name: 'Liner Heat Mold', price: '€50.00' }, { name: 'Shell Heat Stretch', price: '€70.00' }] },
    { key: 'align', label: 'Alignment', accent: '#7c3aed', items: [{ name: 'Canting Assessment', price: '€140.00' }, { name: 'Sole Planing', price: '€95.00' }] },
  ],
  Skis: [
    { key: 'wax', label: 'Waxing', accent: '#0284c7', items: [{ name: 'Hot Wax', price: '€25.00' }, { name: 'Roll Wax', price: '€15.00' }] },
    { key: 'tune', label: 'Tuning', accent: '#d97706', items: [{ name: 'Full Tune', price: '€55.00' }, { name: 'Edge Bevel', price: '€35.00' }, { name: 'Base Grind', price: '€60.00' }] },
    { key: 'repair', label: 'Repairs', accent: '#e11d48', items: [{ name: 'Base Weld', price: '€30.00' }, { name: 'Core Shot Repair', price: '€45.00' }] },
  ],
  Snowboard: [
    { key: 'wax', label: 'Waxing', accent: '#0284c7', items: [{ name: 'Hot Wax', price: '€25.00' }, { name: 'Roll Wax', price: '€15.00' }] },
    { key: 'tune', label: 'Tuning', accent: '#d97706', items: [{ name: 'Full Tune', price: '€55.00' }, { name: 'Edge Bevel', price: '€35.00' }, { name: 'Base Grind', price: '€60.00' }] },
    { key: 'repair', label: 'Repairs', accent: '#e11d48', items: [{ name: 'Base Weld', price: '€30.00' }, { name: 'Core Shot Repair', price: '€45.00' }] },
  ],
  Bindings: [
    { key: 'mount', label: 'Mounting', accent: '#0284c7', items: [{ name: 'Binding Mount', price: '€75.00' }, { name: 'Remount / Plug', price: '€95.00' }] },
    { key: 'safety', label: 'Safety', accent: '#0d9488', items: [{ name: 'DIN Setting', price: '€20.00' }, { name: 'Release Test', price: '€35.00' }] },
  ],
  Footbeds: [
    { key: 'make', label: 'Manufacture', accent: '#0d9488', items: [{ name: 'Custom Footbed', price: '€185.00' }, { name: 'Cork Footbed Cast', price: '€210.00' }] },
    { key: 'adjust', label: 'Adjustment', accent: '#d97706', items: [{ name: 'Footbed Regrind', price: '€45.00' }, { name: 'Posting / Wedge', price: '€35.00' }] },
  ],
  Liners: [
    { key: 'heat', label: 'Heat Molding', accent: '#e11d48', items: [{ name: 'Liner Heat Mold', price: '€50.00' }, { name: 'Re-mold', price: '€35.00' }] },
    { key: 'fit', label: 'Fit', accent: '#0284c7', items: [{ name: 'Tongue Shim', price: '€25.00' }, { name: 'Ankle Pad', price: '€25.00' }] },
  ],
  Poles: [{ key: 'service', label: 'Service', accent: '#0284c7', items: [{ name: 'Cut to Length', price: '€15.00' }, { name: 'Basket Replacement', price: '€12.00' }] }],
  Helmet: [{ key: 'fit', label: 'Fit', accent: '#0284c7', items: [{ name: 'Fit Check', price: '€0.00' }, { name: 'Pad Swap', price: '€18.00' }] }],
};

export function equipServiceGroups(kind: string): EquipServiceGroup[] {
  return EQUIP_SERVICES[kind] ?? [];
}

export const EQUIP_SIDES = ['Left', 'Right', 'Both'] as const;

export function equipSizes(kind: string): string[] {
  if (kind === 'Skis') return ['150', '156', '162', '168', '170', '172', '177', '180', '184', '188', '191'];
  if (kind === 'Snowboard') return ['142', '146', '150', '154', '156', '158', '159W', '162', '163W', '165'];
  if (kind === 'Bindings') return ['S', 'M', 'L', 'XL'];
  if (kind === 'Helmet') return ['XS', 'S', 'M', 'L', 'XL'];
  if (kind === 'Poles') return ['105', '110', '115', '120', '125', '130'];
  const out: string[] = [];
  for (let m = 22; m <= 31.5; m += 0.5) out.push(m.toFixed(1));
  return out;
}

/** The stiffness rating stamped on a boot cuff. Boots only. */
export function equipFlex(kind: string): string[] {
  if (kind === 'Boots') return ['60', '70', '80', '90', '100', '110', '120', '130', '140', 'Race'];
  return [];
}

/**
 * A ski or board's profile — the equivalent spec to a boot's flex, and what a
 * tuner needs to know before touching the base.
 */
export function equipCamber(kind: string): string[] {
  if (kind === 'Skis' || kind === 'Snowboard') {
    return ['Camber', 'Rocker', 'Camber / Rocker', 'Flat', 'Full Rocker'];
  }
  return [];
}

/** Services that can legitimately be applied more than once to the same item. */
export const REPEATABLE_SERVICES = ['Shell Punch', 'Shell Grind', 'Shell Heat Stretch', 'Posting / Wedge'];

/**
 * Work included in the appointment price by default. Custom insoles are the
 * exception — they are a made-to-measure product, billed on top.
 */
const CHARGED_BY_DEFAULT = ['Custom Footbed', 'Cork Footbed Cast'];

export function chargedByDefault(name: string): boolean {
  return CHARGED_BY_DEFAULT.includes(name);
}
