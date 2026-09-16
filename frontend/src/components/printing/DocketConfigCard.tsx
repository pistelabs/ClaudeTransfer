import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FieldLabel } from "@/components/common/FieldLabel"
import { DocketPreview, rollLabel } from "./DocketPreview"
import {
  ROLL_SIZES,
  CUSTOMER_DOCKET_ELEMENTS,
  SHOP_DOCKET_ELEMENTS,
  type CustomerDocketElement,
  type DocketSettings,
  type RollSize,
  type ShopDocketElement,
} from "@/lib/types"

const CUSTOMER_LABELS: Record<CustomerDocketElement, string> = {
  logo: "Logo",
  jobNumber: "Job number",
  checkedIn: "Checked-in date",
  equipment: "Equipment names",
  specs: "Size & colour",
  services: "Services list",
  prices: "Prices",
  total: "Total",
  payNotice: "Pay notice",
  barcode: "Barcode",
  footer: "Footer",
}

const SHOP_LABELS: Record<ShopDocketElement, string> = {
  jobNumber: "Job number",
  itemCount: "Item count",
  timestamp: "Timestamp",
  equipment: "Equipment",
  specs: "Size & colour",
  services: "Services",
  serviceDetail: "Service detail",
  notes: "Notes",
  customer: "Customer",
  barcode: "Barcode",
}

interface DocketConfigCardProps {
  docket: DocketSettings
  roll: RollSize
  onChange: (patch: Partial<DocketSettings>) => void
  onRollChange: (roll: RollSize) => void
}

export function DocketConfigCard({
  docket,
  roll,
  onChange,
  onRollChange,
}: DocketConfigCardProps) {
  return (
    <Card className="mt-3 gap-0 rounded-xl p-[18px] shadow-card">
      <h3 className="font-heading text-[14px] font-bold tracking-[-0.2px]">
        Docket configuration
      </h3>
      <p className="text-muted-foreground mt-0.5 text-[12.5px]">
        Preview · Job #DEMO · {rollLabel(roll)}
      </p>

      <div
        className="mt-4 grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Customer copy */}
        <div>
          <div className="border-divider flex items-center gap-3 border-b pb-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">Customer copy</div>
              <p className="text-muted-foreground text-[11.5px]">
                Printed for the customer at check-in
              </p>
            </div>
            <Switch
              checked={docket.customerCopy}
              onCheckedChange={(customerCopy) => onChange({ customerCopy })}
              aria-label="Print a customer copy"
            />
          </div>

          <div
            className={cn(
              "mt-3 space-y-3 transition-opacity",
              !docket.customerCopy && "opacity-45",
            )}
            inert={!docket.customerCopy}
          >
            <div className="space-y-1.5">
              <FieldLabel htmlFor="docket-header">Header</FieldLabel>
              <Input
                id="docket-header"
                value={docket.header}
                onChange={(e) => onChange({ header: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {CUSTOMER_DOCKET_ELEMENTS.map((element) => (
                <label
                  key={element}
                  className="flex cursor-pointer items-center gap-2 text-[12.5px]"
                >
                  <Checkbox
                    checked={docket.customerEls[element]}
                    onCheckedChange={(checked) =>
                      onChange({
                        customerEls: {
                          ...docket.customerEls,
                          [element]: checked === true,
                        },
                      })
                    }
                    aria-label={CUSTOMER_LABELS[element]}
                  />
                  {CUSTOMER_LABELS[element]}
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="docket-footer">Footer</FieldLabel>
              <Textarea
                id="docket-footer"
                rows={3}
                value={docket.footer}
                onChange={(e) => onChange({ footer: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Print media + live preview — customer */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FieldLabel className="mr-1">Print media</FieldLabel>
            {ROLL_SIZES.map((option) => {
              const isSelected = roll === option
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onRollChange(option)}
                  className={cn(
                    "focus-ring h-8 rounded-md border px-3 text-[12.5px] transition-colors duration-[120ms]",
                    isSelected
                      ? "border-sky-300 bg-sky-50 text-primary-strong font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-background",
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
          <div className="bg-muted border-border rounded-lg border p-4">
            {docket.customerCopy ? (
              <DocketPreview docket={docket} roll={roll} copy="customer" />
            ) : (
              <p className="text-placeholder-foreground py-10 text-center text-[12px]">
                Customer copy is off
              </p>
            )}
          </div>
        </div>

        {/* Shop copy */}
        <div>
          <div className="border-divider flex items-center gap-3 border-b pb-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">Shop copy</div>
              <p className="text-muted-foreground text-[11.5px]">
                Stays with the job on the rack
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {SHOP_DOCKET_ELEMENTS.map((element) => (
              <label
                key={element}
                className="flex cursor-pointer items-center gap-2 text-[12.5px]"
              >
                <Checkbox
                  checked={docket.shopEls[element]}
                  onCheckedChange={(checked) =>
                    onChange({
                      shopEls: {
                        ...docket.shopEls,
                        [element]: checked === true,
                      },
                    })
                  }
                  aria-label={SHOP_LABELS[element]}
                />
                {SHOP_LABELS[element]}
              </label>
            ))}
          </div>
        </div>

        {/* Live preview — shop */}
        <div className="bg-muted border-border rounded-lg border p-4">
          <DocketPreview docket={docket} roll={roll} copy="shop" />
        </div>
      </div>
    </Card>
  )
}
