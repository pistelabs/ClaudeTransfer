import type { CardStatus, EquipmentCategory, EquipmentType, Stage } from "../types";

/** Shape mirroring the design source's raw seed() entries, before normalize()/buildEquip(). */
export interface RawEquip {
  type: EquipmentType;
  brand: string;
  model: string;
  size: string;
  colour?: string;
  category?: EquipmentCategory;
  services: string[];
  serviceData?: Record<string, { angles?: string; structure?: string; photos?: string[] }>;
}

export interface RawJob {
  id: string;
  customer: string;
  status: CardStatus;
  stage: Stage;
  due: string;
  pickup: string;
  dropoff?: string;
  notes?: string;
  // single-equipment shorthand (mirrors the design source)
  type?: EquipmentType;
  brand?: string;
  model?: string;
  size?: string;
  services?: string[];
  // multi-equipment jobs
  equipment?: RawEquip[];
}

export const SEED_JOBS: RawJob[] = [
  { id: "#0114", type: "SKI", brand: "Salomon", model: "QST", size: "180", customer: "Vest Customer", status: "", stage: "in_progress", due: "02/09", pickup: "2:30 PM", services: ["Race Tune"] },
  { id: "#0139", type: "SKI", brand: "Head", model: "E-SXR", size: "168", customer: "Vest Customer", status: "", stage: "in_progress", due: "08/09", pickup: "10:00 AM", services: ["Roll Wax"] },
  {
    id: "#0099", customer: "Vest Customer", status: "", stage: "in_progress", due: "20/09", pickup: "12:00 PM",
    equipment: [
      { type: "BOARD", brand: "Jones", model: "Frontier 2.0", size: "156", services: ["Premium Service", "Hot Wax"] },
      { type: "SKI", brand: "Salomon", model: "QST", size: "180", services: ["Race Tune"] },
    ],
  },
  { id: "#0220", type: "SKI", brand: "Blizzard", model: "Black Pearl 88", size: "165", customer: "Olivia Murphy", status: "late", stage: "in_progress", due: "02/07", pickup: "1:00 AM", services: ["Hot Wax"] },

  { id: "#0082", type: "SKI", brand: "Dynastar", model: "Mfree", size: "170", customer: "dean mcDean", status: "", stage: "checked_in", due: "04/09", pickup: "1:00 AM", services: ["Premium Service"] },
  {
    id: "#0089", customer: "Forrest Gump", status: "", stage: "checked_in", due: "07/09", pickup: "5:00 PM",
    equipment: [
      { type: "BOARD", brand: "Bataleon", model: "Feelgood", size: "146", services: ["Full Tune"] },
      { type: "BOARD", brand: "Burton", model: "Custom X", size: "158", services: ["Hot Wax", "Binding Check"] },
    ],
  },
  { id: "#0091", type: "SKI", brand: "Salomon", model: "QST", size: "180", customer: "Vest Customer", status: "", stage: "checked_in", due: "11/09", pickup: "11:00 AM", services: ["Race Tune"] },

  { id: "#0130", type: "SKI", brand: "Volkl", model: "Mantra", size: "177", customer: "Vest Customer", status: "", stage: "awaiting", due: "01/09", pickup: "10:00 AM", services: ["Binding Check"] },
  { id: "#0123", type: "SKI", brand: "K2", model: "Mindbender", size: "170", customer: "John Cena", status: "", stage: "awaiting", due: "01/09", pickup: "1:00 AM", services: ["Full Tune"] },
  { id: "#0046", type: "SKI", brand: "Fischer", model: "Nightstick", size: "180", customer: "Bilbo Baggins", status: "complete", stage: "awaiting", due: "02/09", pickup: "1:00 AM", services: ["Roll Wax"] },
  { id: "#0102", type: "SKI", brand: "Armada", model: "Declivity", size: "188", customer: "John Smith", status: "complete", stage: "awaiting", due: "06/09", pickup: "1:00 AM", services: ["Race Tune"] },
  { id: "#0053", type: "SKI", brand: "Salomon", model: "QST", size: "180", customer: "Bilbo Baggins", status: "", stage: "awaiting", due: "03/09", pickup: "10:00 AM", services: ["Edge and Wax"] },
  { id: "#0047", type: "SKI", brand: "Blizzard", model: "Anomaly", size: "170", customer: "Harry Potter", status: "", stage: "awaiting", due: "16/09", pickup: "8:00 AM", services: ["Premium Service"] },
  { id: "#0084", type: "SKI", brand: "Volkl", model: "Deacon", size: "170", customer: "dean mcDean", status: "complete", stage: "awaiting", due: "01/09", pickup: "1:00 AM", services: ["Free Binding Mount (with purchase)"] },
  { id: "#0085", type: "SKI", brand: "Salomon", model: "QST", size: "180", customer: "Walter White", status: "complete", stage: "awaiting", due: "02/09", pickup: "2:00 PM", services: ["Roll Wax"] },

  { id: "#0050", type: "SKI", brand: "Volkl", model: "Mantra", size: "177", customer: "Bilbo Baggins", status: "", stage: "archive", due: "15/07", pickup: "1:00 AM", services: ["Race Tune"] },
  {
    id: "#0042", customer: "Walter White", status: "complete", stage: "archive", due: "15/07", pickup: "1:00 AM",
    equipment: [
      { type: "SKI", brand: "K2", model: "Omen", size: "168", services: ["Roll Wax"] },
      { type: "SKI", brand: "Atomic", model: "Maven", size: "150", services: ["Full Tune"] },
      { type: "BOARD", brand: "Jones", model: "Mountain Twin", size: "154", services: ["Race Tune", "Hot Wax"] },
    ],
  },
  { id: "#0086", type: "SKI", brand: "Atomic", model: "maven", size: "150", customer: "Vest Customer", status: "complete", stage: "archive", due: "30/07", pickup: "1:00 AM", services: ["Full Tune"] },
  { id: "#0055", type: "SKI", brand: "Dynastar", model: "Mfree", size: "180", customer: "Bilbo Baggins", status: "", stage: "archive", due: "12/08", pickup: "1:00 AM", services: ["Full Tune"] },
  { id: "#0059", type: "BOARD", brand: "Burton", model: "Custom X", size: "156", customer: "Forrest Gump", status: "", stage: "archive", due: "30/08", pickup: "1:00 AM", services: ["Hot Wax"] },
  { id: "#0097", type: "BOARD", brand: "Bataleon", model: "Ride", size: "150", customer: "Vest Customer", status: "complete", stage: "archive", due: "27/08", pickup: "1:00 AM", services: ["Binding Mount"] },

  { id: "#0208", type: "SKI", brand: "Salomon", model: "QST", size: "180", customer: "Vest Customer", status: "", stage: "kiosk", due: "30/07", pickup: "1:00 AM", dropoff: "24/07 9:30 AM", services: ["Race Tune"] },
  { id: "#0175", type: "SKI", brand: "Volkl", model: "Mantra", size: "177", customer: "Vest Customer", status: "", stage: "kiosk", due: "07/07", pickup: "9:00 AM", dropoff: "23/07 2:00 PM", services: ["Roll Wax", "Edge and Wax"] },
  {
    id: "#0233", customer: "Marcus Reid", stage: "kiosk", due: "—", pickup: "—", dropoff: "23/07 11:00 AM", status: "",
    equipment: [{ type: "SKI", brand: "Atomic", model: "Bent 100", size: "172", colour: "Orange", category: "Alpine Ski", services: [] }],
  },
  {
    id: "#0221", customer: "Sarah Whitfield", stage: "in_progress", due: "05/08", pickup: "4:00 PM", status: "",
    notes: "Customer flagged a base gouge underfoot — photo taken at check-in.",
    equipment: [
      {
        type: "SKI", brand: "Nordica", model: "Enforcer 94", size: "179", colour: "Green", category: "Alpine Ski",
        services: ["Roll Wax"],
        serviceData: { "Roll Wax": { angles: "1° base / 88° side", structure: "Cold / Fine", photos: ["/assets/damage-221.jpg"] } },
      },
    ],
  },
];

export const STAFF_LIST: string[] = ["Dan Sweetnam", "Aoife Byrne", "Marco Rossi", "Lena Fischer", "Tom Whelan"];

export interface RawCustomer {
  id: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  channel: "Email" | "SMS";
  equipment: { type: EquipmentType; brand: string; model: string; size: string }[];
}

export const SEED_CUSTOMERS: RawCustomer[] = [
  { id: "c0", first: "Test", last: "Customer", email: "test.customer@pistelabs.com", phone: "+353 86 000 0001", channel: "Email", equipment: [{ type: "SKI", brand: "Atomic", model: "Bent 100", size: "172" }, { type: "SKI", brand: "Rossignol", model: "Experience 86", size: "176" }, { type: "BOARD", brand: "Burton", model: "Custom", size: "158" }] },
  { id: "c1", first: "Olivia", last: "Murphy", email: "olivia@icloud.com", phone: "+353 86 111 2233", channel: "Email", equipment: [{ type: "SKI", brand: "Blizzard", model: "Black Pearl 88", size: "165" }, { type: "SKI", brand: "Salomon", model: "QST", size: "180" }] },
  { id: "c2", first: "Bilbo", last: "Baggins", email: "bilbo@shire.com", phone: "+353 86 222 3344", channel: "SMS", equipment: [{ type: "SKI", brand: "Volkl", model: "Mantra", size: "177" }, { type: "SKI", brand: "Dynastar", model: "Mfree", size: "180" }] },
  { id: "c3", first: "Walter", last: "White", email: "heisenberg@abq.com", phone: "+353 86 333 4455", channel: "Email", equipment: [{ type: "SKI", brand: "K2", model: "Omen", size: "168" }, { type: "BOARD", brand: "Jones", model: "Mountain Twin", size: "154" }] },
  { id: "c4", first: "Harry", last: "Potter", email: "harry@hogwarts.uk", phone: "+353 86 444 5566", channel: "Email", equipment: [{ type: "SKI", brand: "Blizzard", model: "Anomaly", size: "170" }] },
  { id: "c5", first: "Forrest", last: "Gump", email: "forrest@bubbagump.com", phone: "+353 86 555 6677", channel: "SMS", equipment: [{ type: "BOARD", brand: "Bataleon", model: "Feelgood", size: "146" }, { type: "BOARD", brand: "Burton", model: "Custom X", size: "158" }] },
  { id: "c6", first: "John", last: "Cena", email: "john@wwe.com", phone: "+353 86 666 7788", channel: "Email", equipment: [{ type: "SKI", brand: "K2", model: "Mindbender", size: "170" }] },
  { id: "c7", first: "Dean", last: "McDean", email: "dean@gmail.com", phone: "+353 86 777 8899", channel: "Email", equipment: [{ type: "SKI", brand: "Volkl", model: "Deacon", size: "170" }, { type: "SKI", brand: "Dynastar", model: "Mfree", size: "170" }] },
];
