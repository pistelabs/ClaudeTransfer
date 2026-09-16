import { useState } from "react"

import { StoreNav, type StoreTab } from "@/components/StoreNav"
import { Toaster } from "@/components/ui/sonner"
import { SchedulesPage } from "@/components/schedules/SchedulesPage"
import { StaffPage } from "@/components/staff/StaffPage"
import { BookingPage } from "@/components/booking/BookingPage"
import { IntegrationsPage } from "@/components/integrations/IntegrationsPage"
import { PrintingPage } from "@/components/printing/PrintingPage"
import { useStoreSettings } from "@/lib/api/queries"
import { DEMO_STORE_NAME } from "@/lib/demo-data"
import { USE_MOCK_API } from "@/lib/api"

export default function App() {
  const [tab, setTab] = useState<StoreTab>("schedules")
  const { data: settings } = useStoreSettings()

  return (
    <div className="min-h-screen">
      <StoreNav
        active={tab}
        onChange={setTab}
        storeName={settings?.storeName ?? DEMO_STORE_NAME}
      />
      <main className="mx-auto max-w-[1440px] px-7 pt-[26px] pb-[60px]">
        {tab === "schedules" && <SchedulesPage />}
        {tab === "staff" && <StaffPage />}
        {tab === "booking" && <BookingPage />}
        {tab === "integrations" && <IntegrationsPage />}
        {tab === "printing" && <PrintingPage />}
      </main>
      {USE_MOCK_API && (
        <p className="text-tertiary-foreground pb-6 text-center text-[11px]">
          Demo data — set VITE_API_BASE_URL to connect the Django backend.
        </p>
      )}
      <Toaster />
    </div>
  )
}
