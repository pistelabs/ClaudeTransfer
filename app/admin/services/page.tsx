import type { Metadata } from "next"

import { ServicesSection } from "@/components/services/services-section"

export const metadata: Metadata = {
  title: "Services · Workshop Admin",
  description: "Create service groups and the services your workshop sells.",
}

export default function ServicesPage() {
  return <ServicesSection />
}
