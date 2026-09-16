import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/PageHeader"
import { PrinterConnectionCard } from "./PrinterConnectionCard"
import { DocketConfigCard } from "./DocketConfigCard"
import {
  useDocketSettings,
  usePrinterSettings,
  useTestPrinter,
  useUpdateDocketSettings,
  useUpdatePrinterSettings,
} from "@/lib/api/queries"

export function PrintingPage() {
  const { data: printer, isLoading: printerLoading } = usePrinterSettings()
  const { data: docket, isLoading: docketLoading } = useDocketSettings()
  const updatePrinter = useUpdatePrinterSettings()
  const updateDocket = useUpdateDocketSettings()
  const testPrinter = useTestPrinter()

  if (printerLoading || docketLoading || !printer || !docket) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[52px] w-[320px]" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Printing"
        subtitle="Connect the thermal printer and choose what lands on each docket."
      />

      <PrinterConnectionCard
        printer={printer}
        onChange={(patch) => updatePrinter.mutate(patch)}
        testing={testPrinter.isPending}
        onTest={async () => {
          try {
            return await testPrinter.mutateAsync()
          } catch (error) {
            return {
              ok: false,
              detail:
                error instanceof Error
                  ? error.message
                  : "The printer did not respond.",
            }
          }
        }}
      />

      <DocketConfigCard
        docket={docket}
        roll={printer.roll}
        onChange={(patch) => updateDocket.mutate(patch)}
      />
    </div>
  )
}
