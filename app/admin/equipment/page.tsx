import type { Metadata } from "next"

import { EquipmentSection } from "@/components/equipment/equipment-section"

export const metadata: Metadata = {
  title: "Equipment Types · Workshop Admin",
  description: "Select the equipment types your workshop offers.",
}

export default function EquipmentPage() {
  return <EquipmentSection />
}
