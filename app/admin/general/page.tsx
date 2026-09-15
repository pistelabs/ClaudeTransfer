import type { Metadata } from "next"

import { GeneralSection } from "@/components/general/general-section"

export const metadata: Metadata = {
  title: "General · Workshop Admin",
  description: "Workshop details and regional settings.",
}

export default function GeneralPage() {
  return <GeneralSection />
}
