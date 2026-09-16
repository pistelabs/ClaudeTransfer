import {
  CalendarDaysIcon,
  GlobeIcon,
  PrinterIcon,
  PuzzleIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const STORE_TABS = [
  { id: "schedules", label: "Schedules", icon: CalendarDaysIcon },
  { id: "staff", label: "Staff", icon: UsersIcon },
  { id: "booking", label: "Booking", icon: GlobeIcon },
  { id: "integrations", label: "Integrations", icon: PuzzleIcon },
  { id: "printing", label: "Printing", icon: PrinterIcon },
] as const;

export type StoreTab = (typeof STORE_TABS)[number]["id"];

interface StoreNavProps {
  active: StoreTab;
  onChange: (tab: StoreTab) => void;
  storeName: string;
}

/**
 * Underline nav — deliberately not shadcn `Tabs`; the segmented control on
 * Schedules is where `Tabs` is used.
 */
export function StoreNav({ active, onChange, storeName }: StoreNavProps) {
  return (
    <nav
      aria-label="Store management"
      className="border-border bg-card sticky top-0 z-20 flex items-center gap-[22px] border-b px-7"
    >
      {STORE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab.id)}
            className={cn(
              "focus-ring -mb-px flex items-center gap-2 border-b-2 py-3.5 text-[13.5px] transition-colors",
              isActive
                ? "border-primary text-primary-strong font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent font-medium",
            )}
          >
            <Icon className="size-4" strokeWidth={2} />
            {tab.label}
          </button>
        );
      })}
      <div className="ml-auto">
        <span className="border-border bg-muted inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold">
          <span className="bg-teal-600 size-[7px] rounded-full" aria-hidden />
          {storeName}
        </span>
      </div>
    </nav>
  );
}
