import type { Metadata } from "next"

import { AppointmentsSection } from "@/components/appointments/appointments-section"

export const metadata: Metadata = {
  title: "Appointments · Workshop Admin",
  description: "Create appointment types and the appointments customers can book.",
}

export default function AppointmentsPage() {
  return <AppointmentsSection />
}
