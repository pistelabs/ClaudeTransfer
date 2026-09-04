import { Card, CardContent } from "@/components/ui/card"

export default function GeneralPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">General</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This section is part of the Workshop Admin console but is not built in this slice.
        </p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-[13px] text-muted-foreground">
          The General section has not been implemented yet.
        </CardContent>
      </Card>
    </div>
  )
}
