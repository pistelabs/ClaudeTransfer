import logoUrl from "@/assets/pistelabs-black.png";
import { cn } from "@/lib/utils";
import type { DocketSettings, RollSize } from "@/lib/types";

/** Preview width follows the roll size. */
export const ROLL_WIDTHS: Record<RollSize, number> = {
  "57mm thermal roll": 216,
  "80mm thermal roll": 300,
  "A4 sheet": 420,
  "4x6 label": 384,
};

export function rollLabel(roll: RollSize): string {
  return roll.split(" ")[0].toUpperCase();
}

const DEMO = {
  jobNumber: "#DEMO",
  checkedIn: "16 Sep 2026 · 09:24",
  customer: "L. Bianchi",
  equipment: "Atomic Bent 100",
  specs: "178 cm · Black / Teal",
  services: [
    { name: "Ski Tune & Wax", price: "$60.00", detail: "Base grind, hot wax" },
    { name: "Edge Sharpen", price: "$35.00", detail: "88° side, 1° base" },
  ],
  total: "$95.00",
  itemCount: "1 item",
  notes: "Customer collecting Friday before 5pm.",
};

interface DocketPreviewProps {
  docket: DocketSettings;
  roll: RollSize;
  copy: "customer" | "shop";
}

/**
 * Thermal-style render of a docket. Every element is driven by its checkbox so
 * the manager sees the change as it is toggled.
 */
export function DocketPreview({ docket, roll, copy }: DocketPreviewProps) {
  const width = ROLL_WIDTHS[roll];
  const isCustomer = copy === "customer";
  const els = isCustomer ? docket.customerEls : docket.shopEls;

  return (
    <div
      className="border-border mx-auto rounded-lg border bg-white px-3 py-3.5 font-mono text-[10px] leading-[1.5] text-[#1c1917] shadow-card"
      style={{ width }}
    >
      {isCustomer && docket.customerEls.logo && (
        <img
          src={logoUrl}
          alt="PisteLabs"
          className="mx-auto mb-2 block"
          style={{ width: Math.min(150, width - 40) }}
        />
      )}
      {isCustomer && !docket.customerEls.logo && docket.header && (
        <div className="mb-2 text-center text-[11px] font-bold">
          {docket.header}
        </div>
      )}

      {els.jobNumber && <Line label="JOB" value={DEMO.jobNumber} strong />}
      {isCustomer && docket.customerEls.checkedIn && (
        <Line label="CHECKED IN" value={DEMO.checkedIn} />
      )}
      {!isCustomer && docket.shopEls.timestamp && (
        <Line label="PRINTED" value={DEMO.checkedIn} />
      )}
      {!isCustomer && docket.shopEls.itemCount && (
        <Line label="ITEMS" value={DEMO.itemCount} />
      )}
      {!isCustomer && docket.shopEls.customer && (
        <Line label="CUSTOMER" value={DEMO.customer} />
      )}

      {els.equipment && (
        <>
          <Rule />
          <div className="font-bold">{DEMO.equipment}</div>
          {els.specs && <div className="text-[9px]">{DEMO.specs}</div>}
        </>
      )}

      {els.services && (
        <>
          <Rule />
          {DEMO.services.map((service) => (
            <div key={service.name}>
              <div className="flex justify-between gap-2">
                <span>{service.name}</span>
                {isCustomer && docket.customerEls.prices && (
                  <span>{service.price}</span>
                )}
              </div>
              {!isCustomer && docket.shopEls.serviceDetail && (
                <div className="pl-2 text-[9px] opacity-70">
                  {service.detail}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {isCustomer && docket.customerEls.total && (
        <>
          <Rule />
          <div className="flex justify-between gap-2 text-[11px] font-bold">
            <span>TOTAL</span>
            <span>{DEMO.total}</span>
          </div>
        </>
      )}

      {!isCustomer && docket.shopEls.notes && (
        <>
          <Rule />
          <div className="text-[9px]">{DEMO.notes}</div>
        </>
      )}

      {isCustomer && docket.customerEls.payNotice && (
        <div className="mt-2 text-center text-[9px]">
          Payment due on collection.
        </div>
      )}

      {els.barcode && <Barcode seed={copy} />}

      {isCustomer && docket.customerEls.footer && docket.footer && (
        <div className="mt-2 text-center text-[9px] whitespace-pre-line">
          {docket.footer}
        </div>
      )}

      <Rule />
      {/* Permanent caption — not toggleable. */}
      <div className="text-center text-[9px] font-bold tracking-[0.5px] uppercase">
        {isCustomer ? "Customer copy" : "Shop copy"}
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-2", strong && "font-bold")}>
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Rule() {
  return <div className="my-1.5 border-t border-dashed border-[#c4b8ae]" />;
}

function Barcode({ seed }: { seed: string }) {
  // Deterministic bar widths so the preview does not flicker between renders.
  let state = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 7);
  const bars = Array.from({ length: 42 }, () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return (state % 3) + 1;
  });
  return (
    <div
      className="mt-2 flex h-7 items-end justify-center gap-[1px]"
      aria-hidden
    >
      {bars.map((w, i) => (
        <span
          key={i}
          className="block h-full bg-[#1c1917]"
          style={{ width: w, opacity: i % 2 ? 0 : 1 }}
        />
      ))}
    </div>
  );
}
