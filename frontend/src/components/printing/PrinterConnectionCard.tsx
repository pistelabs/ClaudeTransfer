import { useState } from "react"
import { NetworkIcon, PrinterIcon, UsbIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldLabel } from "@/components/common/FieldLabel"
import { fieldErrorsFrom, networkPrinterSchema } from "@/lib/validation"
import {
  PRINTER_PROTOCOLS,
  type PrinterConnection,
  type PrinterProtocol,
  type PrinterSettings,
} from "@/lib/types"

interface PrinterConnectionCardProps {
  printer: PrinterSettings
  onChange: (patch: Partial<PrinterSettings>) => void
  onTest: () => Promise<{ ok: boolean; detail: string }>
  testing?: boolean
}

const CONNECTIONS: {
  id: PrinterConnection
  label: string
  description: string
  icon: typeof NetworkIcon
}[] = [
  {
    id: "network",
    label: "Network Printer",
    description: "Connected over Wi-Fi / LAN",
    icon: NetworkIcon,
  },
  {
    id: "wired",
    label: "Wired Printer",
    description: "Connected by USB / serial",
    icon: UsbIcon,
  },
]

export function PrinterConnectionCard({
  printer,
  onChange,
  onTest,
  testing = false,
}: PrinterConnectionCardProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleTest() {
    if (printer.connection === "network") {
      const parsed = networkPrinterSchema.safeParse({
        ip: printer.ip,
        port: printer.port,
      })
      if (!parsed.success) {
        setErrors(fieldErrorsFrom(parsed.error))
        return
      }
    }
    setErrors({})
    const result = await onTest()
    if (result.ok) {
      toast.success("Test docket sent", { description: result.detail })
    } else {
      toast.error("Could not reach the printer", {
        description: result.detail,
      })
    }
  }

  return (
    <Card className="gap-0 rounded-xl p-[18px] shadow-card">
      <h3 className="font-heading text-[14px] font-bold tracking-[-0.2px]">
        Printer connection
      </h3>

      <div
        className="mt-3 grid items-start gap-2.5"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 240px)) 1fr" }}
      >
        {CONNECTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = printer.connection === option.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange({ connection: option.id })}
              className={cn(
                "focus-ring rounded-lg border px-3 py-3 text-left transition-colors duration-[120ms]",
                isSelected
                  ? "border-sky-300 bg-sky-50"
                  : "border-border bg-card hover:bg-background",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px]",
                  isSelected ? "text-primary" : "text-placeholder-foreground",
                )}
              />
              <div
                className={cn(
                  "mt-2 text-[13px] font-semibold",
                  isSelected && "text-primary-strong",
                )}
              >
                {option.label}
              </div>
              <div className="text-muted-foreground text-[11.5px]">
                {option.description}
              </div>
            </button>
          )
        })}
      </div>

      {printer.connection === "network" && (
        <div className="mt-3.5 grid grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="printer-ip">IP address</FieldLabel>
            <Input
              id="printer-ip"
              value={printer.ip}
              onChange={(e) => onChange({ ip: e.target.value })}
              aria-invalid={Boolean(errors.ip)}
              placeholder="192.168.1.42"
            />
            {errors.ip && (
              <p className="text-destructive text-[12px]">{errors.ip}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="printer-port">Port</FieldLabel>
            <Input
              id="printer-port"
              value={printer.port}
              onChange={(e) => onChange({ port: e.target.value })}
              aria-invalid={Boolean(errors.port)}
              placeholder="9100"
            />
            {errors.port && (
              <p className="text-destructive text-[12px]">{errors.port}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="printer-model">Printer model</FieldLabel>
            <Input
              id="printer-model"
              value={printer.model}
              onChange={(e) => onChange({ model: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="printer-protocol">Protocol</FieldLabel>
            <Select
              value={printer.protocol}
              onValueChange={(value) =>
                onChange({ protocol: value as PrinterProtocol })
              }
            >
              <SelectTrigger id="printer-protocol" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRINTER_PROTOCOLS.map((protocol) => (
                  <SelectItem key={protocol} value={protocol}>
                    {protocol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        className="mt-3.5 w-[240px]"
        onClick={handleTest}
        disabled={testing}
      >
        <PrinterIcon />
        {printer.connection === "network"
          ? "Test network printer"
          : "Test wired printer"}
      </Button>
    </Card>
  )
}
